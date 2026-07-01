import express from "express";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit for base64 file uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Cloudinary credentials (fallback to provided default keys if not in env)
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "dqgsepaus";
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "799621938941556";
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "tMdtOXb6egJ2_0LJyIDTLmffPvY";

// Gemini API setup (with safe lazy-init)
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ==========================================
// API ROUTES
// ==========================================

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// RSS XML/Atom Feed Helper & Parser
function cleanCdata(str: string): string {
  if (!str) return "";
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/<[^>]*>/g, "") // strip html tags
    .trim();
}

function parseRSS(xmlText: string): any[] {
  const items: any[] = [];
  
  // Match <item> (standard RSS) or <entry> (Atom)
  const itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/g) || xmlText.match(/<entry>([\s\S]*?)<\/entry>/g);
  
  if (itemMatches) {
    for (const itemXml of itemMatches) {
      const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/);
      
      let link = "";
      const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
      if (linkMatch) {
        link = linkMatch[1];
      } else {
        const linkHrefMatch = itemXml.match(/<link[^>]+href=["']([^"']+)["']/);
        if (linkHrefMatch) {
          link = linkHrefMatch[1];
        }
      }
      
      const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/) || 
                        itemXml.match(/<summary>([\s\S]*?)<\/summary>/) ||
                        itemXml.match(/<content[^>]*>([\s\S]*?)<\/content>/);
      
      const dateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || 
                        itemXml.match(/<published>([\s\S]*?)<\/published>/) ||
                        itemXml.match(/<dc:date>([\s\S]*?)<\/dc:date>/) ||
                        itemXml.match(/<updated>([\s\S]*?)<\/updated>/);

      const title = titleMatch ? cleanCdata(titleMatch[1]) : "No Title";
      const cleanedLink = link ? cleanCdata(link) : "";
      const description = descMatch ? cleanCdata(descMatch[1]) : "";
      const pubDate = dateMatch ? cleanCdata(dateMatch[1]) : new Date().toISOString();

      if (title && title !== "No Title") {
        items.push({
          title,
          link: cleanedLink,
          description,
          pubDate
        });
      }
    }
  }
  
  return items;
}

// Proxy & parse RSS feeds endpoint
app.post("/api/rss/parse", async (req: express.Request, res: express.Response) => {
  try {
    const { url } = req.body;
    if (!url) {
      res.status(400).json({ error: "Missing 'url' parameter" });
      return;
    }
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
        "Accept": "application/xml, text/xml, application/xhtml+xml, */*"
      }
    });
    
    if (!response.ok) {
      res.status(response.status).json({ error: `Failed to fetch RSS feed. Status: ${response.status}` });
      return;
    }
    
    const xmlText = await response.text();
    const items = parseRSS(xmlText);
    
    res.json({ items });
  } catch (error: any) {
    console.error("RSS parser endpoint error:", error);
    res.status(500).json({ error: error.message || "Internal server error parsing RSS feed" });
  }
});

// Cloudinary Secure Upload Proxy
app.post("/api/cloudinary/upload", async (req: express.Request, res: express.Response) => {
  try {
    const { file, resource_type = "image" } = req.body;
    if (!file) {
       res.status(400).json({ error: "Missing file parameter (base64 string or URL)" });
       return;
    }

    const timestamp = Math.round(Date.now() / 1000);
    // Sort parameters alphabetically to sign
    const paramsToSign = `timestamp=${timestamp}`;
    const strToSign = `${paramsToSign}${CLOUDINARY_API_SECRET}`;
    const signature = crypto.createHash("sha1").update(strToSign).digest("hex");

    // Construct form data for Cloudinary API
    const formData = new URLSearchParams();
    formData.append("file", file);
    formData.append("api_key", CLOUDINARY_API_KEY);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resource_type}/upload`;

    const response = await fetch(cloudinaryUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const data = await response.json();
    if (!response.ok) {
       res.status(response.status).json({ error: data.error?.message || "Cloudinary upload failed" });
       return;
    }

    res.json({
      secure_url: data.secure_url,
      public_id: data.public_id,
      format: data.format,
      width: data.width,
      height: data.height,
      resource_type: data.resource_type,
    });
  } catch (error: any) {
    console.error("Cloudinary upload proxy error:", error);
    res.status(500).json({ error: error.message || "Internal server error during upload" });
  }
});

// Google AI Studio Gemini API Endpoint
app.post("/api/gemini/action", async (req: express.Request, res: express.Response) => {
  try {
    const { action, text, targetLanguage, tone, maxLength = 300 } = req.body;
    
    if (!text) {
       res.status(400).json({ error: "Missing 'text' body parameter" });
       return;
    }

    let prompt = "";
    switch (action) {
      case "summarize":
        prompt = `Provide a concise, professional, engaging news summary for the following article. Limit to around 3-4 clear sentences:\n\n${text}`;
        break;
      case "rewrite":
        prompt = `Rewrite the following news text to make it sound ${tone || "more engaging and professional"}. Maintain journalistic integrity, fact accuracy, and correct any grammatical imperfections:\n\n${text}`;
        break;
      case "suggest-titles":
        prompt = `Suggest 5 distinct, highly catchy, click-worthy but professional journalistic titles/headlines for a news article with the following content:\n\n${text}`;
        break;
      case "seo":
        prompt = `Analyze the following news article and provide professional SEO metadata in JSON format.
Your output MUST be a valid JSON object containing exactly three fields:
- "title": A search-optimized title (under 60 chars)
- "description": A compelling meta description (under 160 chars)
- "keywords": A comma-separated string of search keywords

Return ONLY the raw JSON object, without any markdown formatting wrappers or backticks.

Content:
${text}`;
        break;
      case "tags":
        prompt = `Suggest a list of 5-8 relevant single-word or dual-word categories/tags for the following news article. Return them as a simple comma-separated list of keywords, without extra text:\n\n${text}`;
        break;
      case "translate":
        prompt = `Translate the following news article text professionally into ${targetLanguage || "Spanish"}, preserving formatting, tone, and journalistic style:\n\n${text}`;
        break;
      case "fact-check":
        prompt = `Carefully review this draft article and provide 3-5 concise bullet points highlighting key statements that might benefit from verification, potential logical gaps, or source citation needs. Be constructive and concise:\n\n${text}`;
        break;
      default:
         res.status(400).json({ error: `Unsupported action: ${action}` });
         return;
    }

    const ai = getGeminiClient();
    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ result: result.text });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: error.message || "Failed to process request with Gemini AI" });
  }
});

// ==========================================
// VITE DEV SERVER OR STATIC FILES
// ==========================================

async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
