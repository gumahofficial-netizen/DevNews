export interface GeminiSeoResult {
  title: string;
  description: string;
  keywords: string;
}

export async function askGemini(
  action: "summarize" | "rewrite" | "suggest-titles" | "seo" | "tags" | "translate" | "fact-check",
  text: string,
  extraParams?: { targetLanguage?: string; tone?: string; maxLength?: number }
): Promise<string> {
  try {
    const response = await fetch("/api/gemini/action", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action,
        text,
        ...extraParams,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Gemini action failed");
    }

    const data = await response.json();
    return data.result;
  } catch (error: any) {
    console.error("Gemini API call failed:", error);
    throw error;
  }
}

/**
 * Returns strongly-typed SEO result from Gemini
 */
export async function generateSeoWithGemini(text: string): Promise<GeminiSeoResult> {
  try {
    const rawResult = await askGemini("seo", text);
    
    // Attempt to parse standard JSON, cleansing typical markdown wrappings if present
    const cleaned = rawResult
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();
      
    const parsed = JSON.parse(cleaned);
    return {
      title: parsed.title || "",
      description: parsed.description || "",
      keywords: parsed.keywords || "",
    };
  } catch (error) {
    console.error("Failed parsing SEO JSON from Gemini, fallback to custom parser:", error);
    // Fallback parsing just in case standard json parsing fails
    return {
      title: "Dev News Pro SEO Title",
      description: text.substring(0, 150) + "...",
      keywords: "news, tech, web",
    };
  }
}
