import { 
  db, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc 
} from "./firebase";
import { Category, NewsArticle, BreakingNews, Advertisement, WebSettings, PageContent, Comment } from "../types";

// High-quality sample images from Unsplash (representing our news themes)
const IMAGES = {
  ai: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=1200",
  react: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=1200",
  quantum: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1200",
  gadget: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=1200",
  sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=1200",
  finance: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1200",
  politics: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=1200",
  world: "https://images.unsplash.com/photo-1521295121330-bfdb319972c2?auto=format&fit=crop&q=80&w=1200",
  science: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=1200",
};

export async function seedDatabase() {
  try {
    // 1. Check Categories
    const catSnap = await getDocs(collection(db, "Categories"));
    if (!catSnap.empty) {
      console.log("Database already initialized.");
      return;
    }

    console.log("Seeding database with professional default news portal data...");

    // 2. Seed Categories
    const categories: Category[] = [
      { id: "tech", name: "Technology", slug: "tech", color: "indigo-600", icon: "Cpu", sortOrder: 1 },
      { id: "science", name: "Science", slug: "science", color: "emerald-600", icon: "Atom", sortOrder: 2 },
      { id: "business", name: "Business", slug: "business", color: "sky-600", icon: "TrendingUp", sortOrder: 3 },
      { id: "politics", name: "Politics", slug: "politics", color: "rose-600", icon: "Landmark", sortOrder: 4 },
      { id: "world", name: "World", slug: "world", color: "amber-600", icon: "Globe", sortOrder: 5 },
      { id: "sports", name: "Sports", slug: "sports", color: "orange-600", icon: "Trophy", sortOrder: 6 },
      { id: "gaming", name: "Gaming", slug: "gaming", color: "purple-600", icon: "Gamepad2", sortOrder: 7 },
    ];

    for (const cat of categories) {
      await setDoc(doc(db, "Categories", cat.id), cat);
    }

    // 3. Seed Website Settings
    const defaultSettings: WebSettings = {
      websiteName: "Dev News Pro",
      logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150",
      favicon: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=32",
      theme: "Dark",
      socialLinks: {
        facebook: "https://facebook.com/devnewspro",
        twitter: "https://twitter.com/devnewspro",
        linkedin: "https://linkedin.com/company/devnewspro",
        github: "https://github.com/devnewspro",
      },
      seo: {
        defaultTitle: "Dev News Pro | Premium Developer & Tech News",
        defaultDescription: "The absolute source of truth for software development, quantum engineering, global artificial intelligence breakthroughs, and general tech news.",
        defaultKeywords: "software engineering, developers, react, next.js, firebase, gemini, artificial intelligence, quantum computing, tech portal",
      },
      emailSettings: {
        senderEmail: "newsletter@devnewspro.com",
        senderName: "Dev News Pro Newsletter",
      },
      cloudinarySettings: {
        cloudName: "dqgsepaus",
        apiKey: "799621938941556",
      },
      maintenanceMode: false,
    };
    await setDoc(doc(db, "Settings", "general"), defaultSettings);

    // 4. Seed Static Pages
    const pages: PageContent[] = [
      {
        id: "about",
        title: "About Dev News Pro",
        content: `## Who We Are\n\nDev News Pro is a premium tech publication focused on providing high-quality, comprehensive, and up-to-date insights into the world of software development, engineering best practices, artificial intelligence, and quantum sciences.\n\nWe strive to keep developers, technology leaders, and tech enthusiasts informed about trends that shape the global tech workspace. Our core focus spans React development, cloud architectures, advanced AI model training, and web performance optimization.`,
        updatedAt: new Date().toISOString(),
      },
      {
        id: "privacy",
        title: "Privacy Policy",
        content: `## Privacy Policy\n\nAt Dev News Pro, we value your privacy. This privacy policy describes what personal data we collect, how we store and process it, and what rights you have under GDPR, CCPA, and general security directives.\n\n### 1. Data Collection\nWe only collect user information such as email addresses for our newsletter sublist and active user accounts to provide bookmarks, personalized history tracker tools, and custom commenting layouts.`,
        updatedAt: new Date().toISOString(),
      },
      {
        id: "terms",
        title: "Terms and Conditions",
        content: `## Terms and Conditions\n\nWelcome to Dev News Pro. By accessing or using our premium news platform, you agree to comply with and be bound by these Terms of Service. Please review them carefully. Any content generated or posted inside comments sections remains the user's responsibility, and is subject to active admin moderation and spam filtration.`,
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const page of pages) {
      await setDoc(doc(db, "Pages", page.id), page);
    }

    // 5. Seed Breaking News
    const breaking: BreakingNews = {
      id: "breaking_1",
      title: "BREAKING: React 19 is officially released in production mode with advanced server component actions!",
      url: "/news/react-19-production-ready",
      active: true,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, "BreakingNews", breaking.id), breaking);

    // 6. Seed News Articles
    const articles: NewsArticle[] = [
      {
        id: "react-19-production-ready",
        title: "React 19 Official Production Release: Server Actions, Suspense Improvements, and Native Asset Loading",
        slug: "react-19-production-ready",
        content: `The React team has officially released **React 19** in stable production. This major release represents a paradigm shift in full-stack web applications, introducing core architectural constructs designed to bridge client-side experiences directly with server-side infrastructure.

### What is New in React 19?

1. **React Server Components (RSC):** Native rendering on the server provides lightning-fast initial load speeds, optimized SEO capability, and minimal bundle sizes.
2. **Server Actions:** Say goodbye to manually creating client-side API routing logic. You can now define database calls or file writes directly inside asynchronous functions that are invoked natively from your client-side form controls.
3. **The \`use\` Hook:** Seamlessly resolve Promises or context objects dynamically during rendering, providing built-in elegant loader suspense behaviors.
4. **Improved Error Boundaries:** Finer error tracking and state recovery triggers during server hydration failures.

### Why It Matters for Developers

By integrating the server and client so tightly, React 19 eliminates the historic latency and boilerplate code developers spent writing fetch routines.

\`\`\`typescript
// Example of a React 19 Server Action
async function addToNewsletter(formData: FormData) {
  'use server';
  const email = formData.get('email');
  await db.newsletter.add({ email });
}
\`\`\`

The release is fully supported in Vite 6, making Dev News Pro one of the first portals to offer optimized, responsive architectures running natively with these improvements!`,
        summary: "React 19 goes production-ready, featuring server actions, native server components, improved hydration, and a streamlined developer workspace experience.",
        aiSummary: "The React team has shipped React 19, a stable release introducing Server Actions, native Server Components, the 'use' hook, and robust SEO elements. This release streamlines server-client state management, eliminating standard fetch boilerplates.",
        featuredImage: IMAGES.react,
        galleryImages: [IMAGES.ai, IMAGES.quantum],
        youtubeUrl: "https://www.youtube.com/watch?v=8pDqJVdNa44",
        authorId: "auth_admin",
        authorName: "Sarah Jenkins",
        authorEmail: "sarah@devnewspro.com",
        category: "tech",
        tags: ["react", "frontend", "javascript", "vite", "webdev"],
        status: "Published",
        publishDate: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
        updatedDate: new Date().toISOString(),
        readingTime: 4,
        views: 1254,
        likes: ["usr_1", "usr_2", "usr_3"],
        commentsCount: 2,
        isEditorsChoice: true,
        isFeatured: true,
        isTrending: true,
        seoTitle: "React 19 Production Stable Released - Server Actions & Components",
        seoDescription: "An in-depth look at the newly released stable React 19, including React Server Components, Server Actions, the new use hook, and improved hydration mechanics.",
        seoKeywords: "react 19, server actions, server components, react 19 release, react js",
      },
      {
        id: "gemini-3-ai-breakthrough",
        title: "Google AI Studio Ships Gemini 3.5: Multimodal Code Synthesizers and Ultra-Fast Latency Loops",
        slug: "gemini-3-ai-breakthrough",
        content: `Google has unveiled **Gemini 3.5**, boasting unparalleled coding synthesis speeds, complex reasoning algorithms, and fully integrated real-time audio and video streams. 

### Core Capabilities of Gemini 3.5

- **Context Window Expansion:** Now supporting up to 2 Million tokens in high-fidelity reasoning mode.
- **Advanced Coding Engine:** Capable of writing entire full-stack software repos from a single developer specification document.
- **Multimodal Audio and Visual Feeds:** Allows real-time vocal feedback loops directly from live browser canvas frames.

Developers can start building immediately on Google AI Studio without complex onboarding routines. The pricing remains free-tier default with optional paid project flows for massive enterprise integrations.`,
        summary: "Google AI Studio releases Gemini 3.5, establishing a new standard for high-performance developer code synthesizers and ultra-fast real-time reasoning loops.",
        aiSummary: "Gemini 3.5 has been launched by Google, bringing 2M token context windows, direct visual code synthesis, and real-time audio loops. The model is fully integrated with Google AI Studio to empower developers to prototype full-stack applications instantly.",
        featuredImage: IMAGES.ai,
        galleryImages: [IMAGES.gadget],
        authorId: "auth_admin",
        authorName: "Michael Chang",
        authorEmail: "michael@devnewspro.com",
        category: "tech",
        tags: ["ai", "gemini", "google", "cloud", "artificial-intelligence"],
        status: "Published",
        publishDate: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
        updatedDate: new Date(Date.now() - 3600000 * 12).toISOString(),
        readingTime: 3,
        views: 3410,
        likes: ["usr_1", "usr_4", "usr_5", "usr_6"],
        commentsCount: 0,
        isEditorsChoice: false,
        isFeatured: false,
        isTrending: true,
        seoTitle: "Google Gemini 3.5 Released - AI Studio Coding Synthesis",
        seoDescription: "Google releases Gemini 3.5 with expanded context windows, state-of-the-art coding abilities, and real-time multi-modal feedback models.",
        seoKeywords: "gemini 3.5, google ai, google ai studio, ai coding agent, multimodal",
      },
      {
        id: "quantum-silicon-breakthrough",
        title: "Quantum Processing Unit Fabricated Natively on Silicon at 15 Millikelvin Environments",
        slug: "quantum-silicon-breakthrough",
        content: `Physicists and semiconductor engineers have successfully manufactured a stable **64-qubit Quantum Processing Unit (QPU)** on standard commercial silicon wafers. 

Historically, quantum computational architectures required custom materials and complex assembly that made scaling highly difficult. This breakthrough:

- Runs on standard CMOS semiconductor lithography equipment.
- Operates at 15 Millikelvin environments using a standard dilution refrigerator.
- Exhibits an impressive 99.98% single-qubit gate fidelity level.

This brings quantum supremacy closer to standard consumer server farms, marking the first time standard silicon fabrication successfully maintains stable quantum state entanglement without major noise decibels.`,
        summary: "Semiconductor engineers fabric stable QPU qubits on standard commercial silicon, paving a roadmap for mass scaling quantum data centers.",
        aiSummary: "A stable 64-qubit quantum processing unit has been successfully printed on standard silicon wafers using existing lithography machines, operating at 15mK. The QPU's 99.98% fidelity rate unlocks a clear commercial scaling roadmap.",
        featuredImage: IMAGES.quantum,
        galleryImages: [IMAGES.science],
        authorId: "auth_admin",
        authorName: "Dr. Elena Rostova",
        authorEmail: "elena@devnewspro.com",
        category: "science",
        tags: ["quantum", "silicon", "science", "hardware", "engineering"],
        status: "Published",
        publishDate: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
        updatedDate: new Date(Date.now() - 3600000 * 24).toISOString(),
        readingTime: 5,
        views: 1890,
        likes: ["usr_2", "usr_7"],
        commentsCount: 1,
        isEditorsChoice: true,
        isFeatured: false,
        isTrending: false,
        seoTitle: "Quantum Processor Fabricated on Silicon Wafers",
        seoDescription: "Physicists achieve quantum computing breakthroughs by printing high-fidelity 64-qubit processors directly onto commercial silicon wafers.",
        seoKeywords: "quantum computing, qubits, silicon quantum, semiconductor, physics breakthrough",
      },
      {
        id: "tech-stocks-bull-run",
        title: "Tech Market Bull Run: Cloud Infrastructure Demands Drive Global Stocks to All-Time Highs",
        slug: "tech-stocks-bull-run",
        content: `Tech stocks continue to climb as cloud infrastructure providers report explosive growth. Major tech indexes hit unprecedented highs as companies invest aggressively in massive computing data centers, custom AI accelerators, and robust global content delivery systems.

### Growth Drivers:

1. **Enterprise Cloud Migrations:** Modernizing legacy architectures with robust cloud-native APIs.
2. **AI Accelerator Procurement:** Massive capital expenditures on next-generation graphics cards and TPU microchips.
3. **Cybersecurity Infrastructure:** Investment in decentralized threat management and automated firewalls.

Financial analysts predict this growth cycle will continue as enterprise applications integrate secure, low-latency machine learning models into daily workflow operations.`,
        summary: "Cloud service investments and AI chip demands propel tech stocks to historic records, as enterprise spending rises globally.",
        featuredImage: IMAGES.finance,
        galleryImages: [],
        authorId: "auth_admin",
        authorName: "Marcus Thorne",
        authorEmail: "marcus@devnewspro.com",
        category: "business",
        tags: ["finance", "business", "stocks", "cloud", "economy"],
        status: "Published",
        publishDate: new Date(Date.now() - 3600000 * 36).toISOString(), // 1.5 days ago
        updatedDate: new Date(Date.now() - 3600000 * 36).toISOString(),
        readingTime: 3,
        views: 2950,
        likes: ["usr_3", "usr_8", "usr_9"],
        commentsCount: 0,
        isEditorsChoice: false,
        isFeatured: false,
        isTrending: false,
      }
    ];

    for (const art of articles) {
      await setDoc(doc(db, "News", art.id), art);
    }

    // 7. Seed Comments (nested replies)
    const sampleComments: Comment[] = [
      {
        id: "comment_1",
        articleId: "react-19-production-ready",
        parentId: null,
        userId: "usr_1",
        userName: "DevDan",
        userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=60",
        userEmail: "dan@dev.com",
        content: "React 19 Server Actions are an absolute lifesaver! It completely removes the need to write redundant Axios post routines.",
        createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
        likes: ["usr_2", "usr_3"],
        reported: false,
        status: "Approved",
      },
      {
        id: "comment_1_reply",
        articleId: "react-19-production-ready",
        parentId: "comment_1",
        userId: "usr_2",
        userName: "CodeCraft",
        userAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=60",
        userEmail: "craft@code.com",
        content: "Absolutely Dan! Just watch out for database race conditions. You still need proper transaction guards on the server action file.",
        createdAt: new Date(Date.now() - 3600000 * 1.2).toISOString(),
        likes: ["usr_1"],
        reported: false,
        status: "Approved",
      },
      {
        id: "comment_2",
        articleId: "quantum-silicon-breakthrough",
        parentId: null,
        userId: "usr_7",
        userName: "QuantumCoder",
        userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=60",
        userEmail: "quantum@coder.com",
        content: "This is beautiful. Standard CMOS fabrication compatibility means the actual price of quantum chips is going to plummet in the next decade.",
        createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
        likes: ["usr_2"],
        reported: false,
        status: "Approved",
      }
    ];

    for (const comm of sampleComments) {
      await setDoc(doc(db, "Comments", comm.id), comm);
    }

    // 8. Seed Advertisements (Standard sizes & locations)
    const ads: Advertisement[] = [
      {
        id: "ad_header_billboard",
        title: "Learn Cloud Computing with GCP Pro - Standard Header Banner",
        imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=728&h=90",
        targetUrl: "https://cloud.google.com",
        openInNewTab: true,
        size: "728x90",
        position: "Header",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000 * 30).toISOString(),
        viewsCount: 450,
        clicksCount: 28,
        ctr: 0.062,
        enabled: true,
        priority: "High",
        targeting: {
          categories: [],
          devices: ["Desktop", "Tablet"],
          countries: [],
        },
      },
      {
        id: "ad_sidebar_rectangle",
        title: "Join AI Studio Dev Conference 2026",
        imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300&h=250",
        targetUrl: "https://ai.studio/build",
        openInNewTab: true,
        size: "300x250",
        position: "Sidebar",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000 * 15).toISOString(),
        viewsCount: 210,
        clicksCount: 15,
        ctr: 0.071,
        enabled: true,
        priority: "Medium",
        targeting: {
          categories: ["tech"],
          devices: ["Desktop", "Tablet", "Mobile"],
          countries: [],
        },
      },
      {
        id: "ad_sticky_bottom",
        title: "DevNews Pro Premium Subscription",
        imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=320&h=50",
        targetUrl: "https://ai.studio/build",
        openInNewTab: true,
        size: "320x50",
        position: "Sticky Bottom",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000 * 60).toISOString(),
        viewsCount: 1240,
        clicksCount: 92,
        ctr: 0.074,
        enabled: true,
        priority: "High",
        targeting: {
          categories: [],
          devices: ["Mobile"],
          countries: [],
        },
      }
    ];

    for (const ad of ads) {
      await setDoc(doc(db, "Advertisements", ad.id), ad);
    }

    // 9. Seed Visitor Data for past 30 days (for dashboard metrics)
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const dayStr = date.toISOString().split("T")[0];
      // Generate realistic daily visitors count
      const visitorsCount = 120 + Math.floor(Math.random() * 80) + (i === 0 ? 45 : 0);
      const pageViewsCount = visitorsCount * (2 + Math.floor(Math.random() * 3));
      
      await setDoc(doc(db, "Visitors", dayStr), {
        date: dayStr,
        visitors: visitorsCount,
        pageViews: pageViewsCount,
        devices: {
          Desktop: Math.floor(visitorsCount * 0.65),
          Tablet: Math.floor(visitorsCount * 0.10),
          Mobile: Math.floor(visitorsCount * 0.25),
        },
        countries: {
          US: Math.floor(visitorsCount * 0.45),
          GB: Math.floor(visitorsCount * 0.15),
          DE: Math.floor(visitorsCount * 0.12),
          IN: Math.floor(visitorsCount * 0.18),
          Other: Math.floor(visitorsCount * 0.10),
        },
        browsers: {
          Chrome: Math.floor(visitorsCount * 0.60),
          Safari: Math.floor(visitorsCount * 0.22),
          Firefox: Math.floor(visitorsCount * 0.12),
          Edge: Math.floor(visitorsCount * 0.06),
        },
        sources: {
          Direct: Math.floor(visitorsCount * 0.30),
          Search: Math.floor(visitorsCount * 0.45),
          Social: Math.floor(visitorsCount * 0.18),
          Referral: Math.floor(visitorsCount * 0.07),
        }
      });
    }

    console.log("Database seeded successfully with beautiful starter resources!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
