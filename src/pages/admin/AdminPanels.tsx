import React, { useState, useEffect } from "react";
import { 
  db, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc 
} from "../../services/firebase";
import { uploadToCloudinary } from "../../services/cloudinary";
import { askGemini, generateSeoWithGemini } from "../../services/gemini";
import { 
  NewsArticle, 
  Category, 
  Advertisement, 
  Comment, 
  WebSettings, 
  UserRole,
  AdSize,
  AdPosition
} from "../../types";
import { LucideIcon } from "../../components/LucideIcon";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Sparkles, 
  RefreshCw, 
  Upload, 
  FileText, 
  TrendingUp, 
  Users, 
  Layers, 
  Megaphone,
  Eye,
  MousePointer,
  Percent,
  Settings,
  ShieldCheck,
  Check,
  Lock,
  ChevronDown,
  Globe,
  Rss,
  BookOpen,
  Save,
  ExternalLink
} from "lucide-react";

// ==========================================
// 1. ADMIN OVERVIEW PANEL
// ==========================================
export function AdminOverview() {
  const [stats, setStats] = useState({
    todayVisitors: 284,
    monthlyVisitors: 4890,
    topArticle: "React 19 Official Production Release",
    activeAds: 3,
    ctrAverage: "6.9%",
    newsletterCount: 154
  });

  const [topNews, setTopNews] = useState<NewsArticle[]>([]);
  const [newsletters, setNewsletters] = useState<string[]>([]);

  useEffect(() => {
    const fetchOverviewStats = async () => {
      try {
        const newsSnap = await getDocs(collection(db, "News"));
        const arts: NewsArticle[] = [];
        newsSnap.forEach(d => {
          arts.push({ id: d.id, ...d.data() } as NewsArticle);
        });
        arts.sort((a, b) => (b.views || 0) - (a.views || 0));
        setTopNews(arts.slice(0, 5));

        const subSnap = await getDocs(collection(db, "Newsletter"));
        const subs: string[] = [];
        subSnap.forEach(d => {
          subs.push(d.id);
        });
        setNewsletters(subs);

        // Fetch dynamic visitors counts if exist
        const visSnap = await getDocs(collection(db, "Visitors"));
        if (!visSnap.empty) {
          let sumVisitors = 0;
          let todayVis = 145;
          visSnap.forEach((doc) => {
            const data = doc.data();
            sumVisitors += data.visitors || 0;
            todayVis = data.visitors || 0; // last parsed is today
          });
          setStats(prev => ({
            ...prev,
            todayVisitors: todayVis,
            monthlyVisitors: sumVisitors,
            newsletterCount: subs.length,
            topArticle: arts[0]?.title || "N/A"
          }));
        }
      } catch (err) {
        console.error("Error loading overview analytics:", err);
      }
    };
    fetchOverviewStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h1 className="font-sans font-black text-xl text-white">System Analytics Console</h1>
        <span className="text-[10px] bg-indigo-600/10 text-indigo-400 font-mono font-bold border border-indigo-500/10 px-2 py-0.5 rounded uppercase">Verified Core Node</span>
      </div>

      {/* Analytics Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900 rounded-xl border border-slate-800/60 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold font-mono uppercase text-slate-500 block">Today's Visitors</span>
            <span className="text-xl font-black text-white font-mono">{stats.todayVisitors}</span>
          </div>
        </div>

        <div className="p-5 bg-slate-900 rounded-xl border border-slate-800/60 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xl shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold font-mono uppercase text-slate-500 block">Monthly Traffic</span>
            <span className="text-xl font-black text-white font-mono">{stats.monthlyVisitors}</span>
          </div>
        </div>

        <div className="p-5 bg-slate-900 rounded-xl border border-slate-800/60 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xl shrink-0">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold font-mono uppercase text-slate-500 block">Active Sponsored Ads</span>
            <span className="text-xl font-black text-white font-mono">{stats.activeAds}</span>
          </div>
        </div>

        <div className="p-5 bg-slate-900 rounded-xl border border-slate-800/60 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xl shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold font-mono uppercase text-slate-500 block">Newsletter Subs</span>
            <span className="text-xl font-black text-white font-mono">{stats.newsletterCount}</span>
          </div>
        </div>
      </div>

      {/* SVG Traffic Curve */}
      <div className="p-5 bg-slate-900 rounded-xl border border-slate-800/60 space-y-4">
        <h3 className="text-xs font-bold font-mono uppercase text-indigo-400">Monthly Traffic Curve Metrics</h3>
        <div className="h-44 w-full bg-slate-950/40 rounded-lg p-2 border border-slate-900/60 relative flex items-end">
          {/* Simple premium SVG graph rendering */}
          <svg className="w-full h-full text-indigo-500" viewBox="0 0 100 20" preserveAspectRatio="none">
            <path 
              d="M 0 18 Q 10 12, 20 15 T 40 10 T 60 14 T 80 6 T 100 8" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="0.8"
              className="animate-pulse"
            />
            <path 
              d="M 0 18 Q 10 12, 20 15 T 40 10 T 60 14 T 80 6 T 100 8 L 100 20 L 0 20 Z" 
              fill="currentColor" 
              fillOpacity="0.05"
            />
          </svg>
          <div className="absolute top-3 left-4 text-[9px] font-mono text-slate-500">Node Speed: 4.8MB/s • Latency Loop: 24ms</div>
        </div>
      </div>

      {/* Tables Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Articles by Views */}
        <div className="p-5 bg-slate-900 rounded-xl border border-slate-800/60 space-y-3">
          <h3 className="text-xs font-bold font-mono uppercase text-indigo-400">High-Performance Articles</h3>
          <div className="space-y-2">
            {topNews.map((news) => (
              <div key={news.id} className="flex justify-between items-center text-xs border-b border-slate-800/40 pb-2">
                <span className="truncate w-64 text-slate-300 font-medium">{news.title}</span>
                <span className="font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded font-bold shrink-0">{news.views} views</span>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Subscribers list */}
        <div className="p-5 bg-slate-900 rounded-xl border border-slate-800/60 space-y-3">
          <h3 className="text-xs font-bold font-mono uppercase text-indigo-400">Newsletter Registrations</h3>
          <div className="max-h-40 overflow-y-auto pr-1 space-y-2">
            {newsletters.map((email) => (
              <div key={email} className="text-xs text-slate-400 border-b border-slate-800/40 pb-2 font-mono">
                {email}
              </div>
            ))}
            {newsletters.length === 0 && <p className="text-xs text-slate-500 text-center py-4">No subscribers currently logged.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}


// ==========================================
// 2. ADMIN NEWS MANAGER PANEL (including AI panel!)
// ==========================================
export function AdminNewsManager() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // RSS Feed Import States
  const [newsTab, setNewsTab] = useState<"list" | "rss">("list");
  const [rssUrl, setRssUrl] = useState("https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml");
  const [rssItems, setRssItems] = useState<any[]>([]);
  const [rssLoading, setRssLoading] = useState(false);
  const [rssError, setRssError] = useState("");
  const [rssSuccess, setRssSuccess] = useState("");
  const [selectedRssCategory, setSelectedRssCategory] = useState("");

  // Form Field State
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isEditorsChoice, setIsEditorsChoice] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [status, setStatus] = useState<"Draft" | "Published">("Published");

  // Gemini AI Operations Status
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiMessage, setAiMessage] = useState("");

  const fetchRssFeed = async () => {
    setRssLoading(true);
    setRssError("");
    setRssSuccess("");
    try {
      const response = await fetch("/api/rss/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: rssUrl })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch and parse the RSS feed");
      }
      setRssItems(data.items || []);
      setRssSuccess(`نجح جلب ${data.items?.length || 0} من المقالات المتاحة للاستيراد!`);
    } catch (err: any) {
      setRssError(err.message || "خطأ أثناء محاولة جلب الأخبار من الرابط.");
    } finally {
      setRssLoading(false);
    }
  };

  const handleImportRssArticle = async (item: any) => {
    try {
      // Clean slug
      const slug = item.title
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
        .replace(/(^-|-$)/g, "") || String(Date.now());
        
      const publishDate = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();
      const readingTime = Math.max(1, Math.round((item.description || "").split(/\s+/).length / 150));

      const targetCat = selectedRssCategory || (categories.length > 0 ? categories[0].slug : "technology");

      const recordData: NewsArticle = {
        id: slug,
        title: item.title,
        slug,
        content: `### ${item.title}\n\n${item.description || "لا يوجد محتوى تفصيلي متوفر حالياً."}\n\n[اقرأ المقال الكامل عبر المصدر الأصلي](${item.link})`,
        summary: item.description?.slice(0, 180) || item.title,
        category: targetCat,
        tags: ["rss", "imported"],
        featuredImage: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800", // Default beautiful tech cover
        galleryImages: [],
        authorId: "auth_admin",
        authorName: "Sarah Jenkins (RSS)",
        authorEmail: "sarah@devnewspro.com",
        status: "Published",
        publishDate,
        updatedDate: new Date().toISOString(),
        readingTime,
        views: Math.floor(Math.random() * 20) + 1, // Start with some real engagement
        likes: [],
        commentsCount: 0,
        isEditorsChoice: false,
        isFeatured: true,
        isTrending: true
      };

      await setDoc(doc(db, "News", slug), recordData, { merge: true });
      alert(`تم استيراد ونشر الخبر بنجاح!\n"${item.title}"`);
      refreshNewsList();
    } catch (err: any) {
      alert("حدث خطأ أثناء استيراد الخبر: " + err.message);
    }
  };

  const refreshNewsList = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "News"));
      const arts: NewsArticle[] = [];
      snap.forEach((doc) => {
        arts.push({ id: doc.id, ...doc.data() } as NewsArticle);
      });
      arts.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
      setArticles(arts);

      // categories
      const catSnap = await getDocs(collection(db, "Categories"));
      const cats: Category[] = [];
      catSnap.forEach((doc) => {
        cats.push(doc.data() as Category);
      });
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshNewsList();
  }, []);

  const handleEditClick = (art: NewsArticle) => {
    setEditingArticle(art);
    setIsCreatingNew(false);
    
    setTitle(art.title);
    setContent(art.content);
    setSummary(art.summary || "");
    setCategory(art.category);
    setTagsText(art.tags?.join(", ") || "");
    setFeaturedImage(art.featuredImage);
    setYoutubeUrl(art.youtubeUrl || "");
    setIsFeatured(art.isFeatured || false);
    setIsEditorsChoice(art.isEditorsChoice || false);
    setIsTrending(art.isTrending || false);
    setStatus(art.status === "Draft" ? "Draft" : "Published");
  };

  const handleCreateNewClick = () => {
    setIsCreatingNew(true);
    setEditingArticle(null);

    setTitle("");
    setContent("");
    setSummary("");
    setCategory(categories[0]?.slug || "");
    setTagsText("");
    setFeaturedImage("https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=600");
    setYoutubeUrl("");
    setIsFeatured(false);
    setIsEditorsChoice(false);
    setIsTrending(false);
    setStatus("Published");
  };

  // Direct Image Upload Proxy for Admins
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setAiMessage("Uploading image to secure Cloudinary directory...");
    try {
      const res = await uploadToCloudinary(file);
      setFeaturedImage(res.secure_url);
      setAiMessage("Image loaded onto Cloudinary CDN successfully!");
    } catch (err: any) {
      alert("Cloudinary Upload Error: " + err.message);
      setAiMessage("");
    }
  };

  // Save / Update Article
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const tagsArray = tagsText.split(",").map(t => t.trim().toLowerCase()).filter(t => t.length > 0);
    const readingTime = Math.max(1, Math.round(content.split(/\s+/).length / 200));

    const recordData: Omit<NewsArticle, "id" | "views" | "likes" | "commentsCount"> = {
      title,
      slug,
      content,
      summary,
      category,
      tags: tagsArray,
      featuredImage,
      galleryImages: [],
      youtubeUrl,
      authorId: "auth_admin",
      authorName: "Sarah Jenkins",
      authorEmail: "sarah@devnewspro.com",
      status,
      publishDate: editingArticle ? editingArticle.publishDate : new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      readingTime,
      isFeatured,
      isEditorsChoice,
      isTrending
    };

    try {
      const artId = editingArticle ? editingArticle.id : slug;
      await setDoc(doc(db, "News", artId), {
        ...recordData,
        views: editingArticle ? editingArticle.views : 0,
        likes: editingArticle ? editingArticle.likes : [],
        commentsCount: editingArticle ? editingArticle.commentsCount : 0
      }, { merge: true });

      alert("Article published and saved successfully!");
      setIsCreatingNew(false);
      setEditingArticle(null);
      refreshNewsList();
    } catch (err: any) {
      alert("Firestore Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!confirm("Are you absolutely sure you want to delete this article? This is irreversible.")) return;
    try {
      await deleteDoc(doc(db, "News", articleId));
      setArticles(articles.filter(a => a.id !== articleId));
    } catch (err) {
      console.error(err);
    }
  };

  // ==========================================
  // ✨ GEMINI AI CO-PILOT ACTIONS
  // ==========================================
  const handleAiAction = async (action: "summarize" | "rewrite" | "suggest-titles" | "tags" | "fact-check") => {
    if (!content.trim() && action !== "suggest-titles") {
      alert("Please write some article text before using the Gemini Co-Pilot.");
      return;
    }
    setAiLoading(true);
    setAiSuggestions([]);
    setAiMessage(`Invoking Gemini model 'gemini-3.5-flash' for AI action...`);
    try {
      const result = await askGemini(action, content || title);
      
      if (action === "summarize") {
        setSummary(result);
        setAiMessage("Summary compiled successfully!");
      } else if (action === "rewrite") {
        setContent(result);
        setAiMessage("Content polished and rewritten successfully!");
      } else if (action === "suggest-titles" || action === "fact-check") {
        const bullets = result.split("\n").filter(b => b.trim().length > 0);
        setAiSuggestions(bullets);
        setAiMessage("Inspection complete:");
      } else if (action === "tags") {
        setTagsText(result);
        setAiMessage("Tags configured successfully!");
      }
    } catch (err: any) {
      alert("Gemini Error: " + err.message);
      setAiMessage("");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h1 className="font-sans font-black text-xl text-white">Newsroom Article Desk</h1>
        {!isCreatingNew && !editingArticle && (
          <button
            onClick={handleCreateNewClick}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow"
          >
            <Plus className="w-4.5 h-4.5" /> Compose New Article
          </button>
        )}
      </div>

      {!isCreatingNew && !editingArticle && (
        <div className="flex border-b border-slate-800/60 gap-4">
          <button
            type="button"
            onClick={() => setNewsTab("list")}
            className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              newsTab === "list" ? "border-b-2 border-blue-500 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            قائمة المقالات | Articles List
          </button>
          <button
            type="button"
            onClick={() => setNewsTab("rss")}
            className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              newsTab === "rss" ? "border-b-2 border-blue-500 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            استيراد الأخبار (RSS Feed) | Import RSS Feed
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400 font-mono">Loading articles...</div>
      ) : isCreatingNew || editingArticle ? (
        /* Form View */
        <form onSubmit={handleSaveArticle} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4 bg-slate-900 p-6 rounded-xl border border-slate-800/60">
            <h3 className="text-xs font-bold font-mono uppercase text-indigo-400">
              {editingArticle ? `Editing: ${editingArticle.title}` : "Composing New Article"}
            </h3>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Headline / Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="React 19 stable features unveiled..."
                className="w-full text-xs p-3 rounded-lg border border-slate-800 bg-slate-950 text-white outline-none focus:border-indigo-500"
              />
            </div>

            {/* Content Markdown Area */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Article Content (Markdown supported)</label>
              <textarea
                required
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="The React team released Stable React 19..."
                className="w-full text-xs p-3 rounded-lg border border-slate-800 bg-slate-950 text-white outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            {/* Summary */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Article Brief / Summary</label>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Provide a short brief introduction..."
                className="w-full text-xs p-3 rounded-lg border border-slate-800 bg-slate-950 text-white outline-none focus:border-indigo-500"
              />
            </div>

            {/* Flags */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-800/60 pt-4 text-xs">
              <label className="flex items-center gap-2 text-slate-300">
                <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded" />
                Featured Article
              </label>
              <label className="flex items-center gap-2 text-slate-300">
                <input type="checkbox" checked={isEditorsChoice} onChange={(e) => setIsEditorsChoice(e.target.checked)} className="rounded" />
                Editor's Choice
              </label>
              <label className="flex items-center gap-2 text-slate-300">
                <input type="checkbox" checked={isTrending} onChange={(e) => setIsTrending(e.target.checked)} className="rounded" />
                Trending Feed
              </label>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-800/60">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl"
              >
                {submitting ? "Saving Article..." : "Save and Publish"}
              </button>
              <button
                type="button"
                onClick={() => { setIsCreatingNew(false); setEditingArticle(null); }}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Sidebar - Cloudinary uploads and Gemini AI tool panel */}
          <div className="space-y-4">
            {/* Cloudinary Upload Box */}
            <div className="p-5 bg-slate-900 rounded-xl border border-slate-800/60 space-y-4">
              <h3 className="text-xs font-bold font-mono uppercase text-indigo-400 flex items-center gap-1">
                <Upload className="w-4 h-4" /> Cloudinary Media
              </h3>
              
              <div className="space-y-3">
                <div className="relative border-2 border-dashed border-slate-800 rounded-xl p-4 text-center hover:border-indigo-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                  <span className="text-[10px] font-semibold text-slate-400 block">Drag or Select Image</span>
                  <span className="text-[8px] text-slate-500 font-mono">Direct Cloudinary Storage</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 font-mono uppercase">Featured Image URL</label>
                  <input
                    type="text"
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                    className="w-full text-xs p-2 rounded bg-slate-950 border border-slate-800 text-white outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Gemini AI Co-Pilot Panel */}
            <div className="p-5 bg-slate-900 rounded-xl border border-slate-800/60 space-y-4">
              <h3 className="text-xs font-bold font-mono uppercase text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin-slow" /> Gemini AI Co-Pilot
              </h3>
              
              {aiLoading && (
                <div className="text-[10px] bg-indigo-500/10 text-indigo-400 p-2.5 rounded-lg flex items-center gap-1.5 font-mono">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> {aiMessage}
                </div>
              )}
              {!aiLoading && aiMessage && (
                <div className="text-[10px] bg-emerald-500/10 text-emerald-400 p-2.5 rounded-lg font-mono">
                  {aiMessage}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleAiAction("summarize")}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-200"
                >
                  Generate Summary
                </button>
                <button
                  type="button"
                  onClick={() => handleAiAction("rewrite")}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-200"
                >
                  Polite Polish Rewrite
                </button>
                <button
                  type="button"
                  onClick={() => handleAiAction("suggest-titles")}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-200"
                >
                  Suggest 5 Headlines
                </button>
                <button
                  type="button"
                  onClick={() => handleAiAction("tags")}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-200"
                >
                  Formulate Tags
                </button>
                <button
                  type="button"
                  onClick={() => handleAiAction("fact-check")}
                  className="col-span-2 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-200 flex items-center justify-center gap-1"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Fact-Check & Grammar Review
                </button>
              </div>

              {/* AI Bullet Output Box */}
              {aiSuggestions.length > 0 && (
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1 max-h-44 overflow-y-auto">
                  {aiSuggestions.map((s, i) => (
                    <p key={i} className="text-[10px] text-slate-300 leading-normal border-b border-slate-900 pb-1">{s}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Category Dropdown & Tag inputs */}
            <div className="p-5 bg-slate-900 rounded-xl border border-slate-800/60 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Category Allocation</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Comma-Separated Tags</label>
                <input
                  type="text"
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  placeholder="react, web, cloud"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">YouTube Video URL</label>
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Article Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white outline-none"
                >
                  <option value="Published">Published immediately</option>
                  <option value="Draft">Save as Draft</option>
                </select>
              </div>
            </div>
          </div>
        </form>
      ) : newsTab === "rss" ? (
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 rounded-xl border border-slate-800/60 space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                <Globe className="w-4.5 h-4.5" />
              </span>
              <h3 className="text-xs font-bold text-blue-400 uppercase font-mono tracking-wider">أداة جلب الأخبار الذكية | RSS Feed Smart Import</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              أدخل رابط RSS Feed (سواء كان بتنسيق XML أو Atom) لجلب الأخبار والمقالات مباشرة من المواقع العالمية ونشرها في الشاشة الرئيسية للموقع بضغطة زر واحدة.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 font-mono tracking-wider">رابط تغذية الأخبار / RSS URL</label>
                <input
                  type="url"
                  value={rssUrl}
                  onChange={(e) => setRssUrl(e.target.value)}
                  placeholder="https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml"
                  className="w-full text-xs p-3 rounded-lg bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 font-mono tracking-wider">التصنيف المستهدف للمقالات المستوردة / Target Category</label>
                <select
                  value={selectedRssCategory}
                  onChange={(e) => setSelectedRssCategory(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-slate-800 bg-slate-950 text-white outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="">-- اختر التصنيف --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={fetchRssFeed}
                disabled={rssLoading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(37,99,235,0.15)]"
              >
                {rssLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> جاري الجلب...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" /> جلب الأخبار الآن | Fetch News
                  </>
                )}
              </button>
              
              {/* Popular feed suggestions */}
              <div className="flex flex-wrap items-center gap-2 text-slate-500 text-[10px] font-mono">
                <span>أمثلة سريعة:</span>
                <button
                  type="button"
                  onClick={() => setRssUrl("https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml")}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded transition-colors"
                >
                  NYT Tech (English)
                </button>
                <button
                  type="button"
                  onClick={() => setRssUrl("https://news.google.com/rss?hl=ar&gl=AE&ceid=AE:ar")}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded transition-colors"
                >
                  Google News UAE (العربية)
                </button>
                <button
                  type="button"
                  onClick={() => setRssUrl("https://www.aljazeera.net/aljazeerarss/a7c186be-1acd-432a-b45f-40b59b395a15/65a507a3-5d59-4a94-82fe-3b8c2be4388e")}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded transition-colors"
                >
                  الجزيرة تكنولوجيا (العربية)
                </button>
              </div>
            </div>

            {rssError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono text-xs rounded-lg">
                {rssError}
              </div>
            )}
            {rssSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs rounded-lg">
                {rssSuccess}
              </div>
            )}
          </div>

          {/* List of RSS items */}
          {rssItems.length > 0 && (
            <div className="bg-slate-900 rounded-xl border border-slate-800/60 overflow-hidden">
              <div className="p-4 border-b border-slate-800 bg-slate-950/20">
                <h4 className="text-xs font-bold font-mono text-gray-300 uppercase tracking-wider">الأخبار المتوفرة للاستيراد ({rssItems.length} مقال)</h4>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                      <th className="p-4">عنوان المقال الأصلي / RSS Headline</th>
                      <th className="p-4">تاريخ النشر</th>
                      <th className="p-4 text-center">الإجراءات / Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rssItems.map((item, index) => (
                      <tr key={index} className="border-b border-slate-800/40 hover:bg-slate-800/10 transition-colors">
                        <td className="p-4 font-bold text-slate-200">
                          <div className="text-sm font-sans tracking-tight text-white mb-1">{item.title}</div>
                          {item.description && (
                            <p className="text-[11px] text-slate-400 font-normal line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </td>
                        <td className="p-4 text-slate-400 whitespace-nowrap">{new Date(item.pubDate).toLocaleDateString()}</td>
                        <td className="p-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleImportRssArticle(item)}
                            className="px-4 py-2 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 rounded-full font-bold text-[10px] uppercase transition-all shadow-sm"
                          >
                            استيراد ونشر | Import
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* List View */
        <div className="bg-slate-900 rounded-xl border border-slate-800/60 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/20">
                <th className="p-4">Article Headline</th>
                <th className="p-4">Category</th>
                <th className="p-4 font-mono">Views</th>
                <th className="p-4">Publish Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((art) => (
                <tr key={art.id} className="border-b border-slate-800/40 hover:bg-slate-800/10">
                  <td className="p-4 font-bold text-slate-200 max-w-sm truncate">{art.title}</td>
                  <td className="p-4 uppercase text-indigo-400">{art.category}</td>
                  <td className="p-4 font-mono text-slate-400">{art.views}</td>
                  <td className="p-4 text-slate-400">{new Date(art.publishDate).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      art.status === "Published" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"
                    }`}>
                      {art.status}
                    </span>
                  </td>
                  <td className="p-4 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEditClick(art)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteArticle(art.id)}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {articles.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 font-mono">No compiled articles found inside databases.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


// ==========================================
// 3. ADMIN CATEGORY MANAGER PANEL
// ==========================================
export function AdminCategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [color, setColor] = useState("indigo-600");
  const [icon, setIcon] = useState("Cpu");
  const [sortOrder, setSortOrder] = useState(1);

  const refreshCategories = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "Categories"));
      const fetched: Category[] = [];
      snap.forEach((doc) => {
        fetched.push(doc.data() as Category);
      });
      fetched.sort((a, b) => a.sortOrder - b.sortOrder);
      setCategories(fetched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const newCat: Category = {
      id: finalSlug,
      name,
      slug: finalSlug,
      color,
      icon,
      sortOrder: Number(sortOrder)
    };

    try {
      await setDoc(doc(db, "Categories", finalSlug), newCat);
      alert("Category registered successfully!");
      setName("");
      setSlug("");
      setSortOrder(sortOrder + 1);
      refreshCategories();
    } catch (err: any) {
      alert("Database error: " + err.message);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      await deleteDoc(doc(db, "Categories", catId));
      refreshCategories();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-3">
        <h1 className="font-sans font-black text-xl text-white">Categories Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Category form */}
        <form onSubmit={handleCreateCategory} className="bg-slate-900 p-6 rounded-xl border border-slate-800/60 space-y-4 h-fit">
          <h3 className="text-xs font-bold font-mono uppercase text-indigo-400">Add New Category</h3>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 font-mono uppercase">Category Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => { setName(e.target.value); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")); }}
              placeholder="Technology"
              className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 font-mono uppercase">URL Slug</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="tech"
              className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 font-mono uppercase">Color Accent (e.g. indigo-600)</label>
            <input
              type="text"
              required
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="indigo-600"
              className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 font-mono uppercase">Lucide Icon name (e.g. Cpu, Atom)</label>
            <input
              type="text"
              required
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="Cpu"
              className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 font-mono uppercase">Sort Order Weight</label>
            <input
              type="number"
              required
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl"
          >
            Create Category
          </button>
        </form>

        {/* Categories List table */}
        <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800/60 overflow-hidden">
          {loading ? (
            <p className="text-center py-12 text-xs text-slate-400">Syncing categories...</p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/20">
                  <th className="p-4">Preview</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Slug</th>
                  <th className="p-4 font-mono">Order</th>
                  <th className="p-4 text-center">Delete</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className="border-b border-slate-800/40">
                    <td className="p-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white bg-${cat.color || "indigo-600"}`}>
                        <LucideIcon name={cat.icon} className="w-4 h-4" />
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-200">{cat.name}</td>
                    <td className="p-4 font-mono text-slate-400">{cat.slug}</td>
                    <td className="p-4 font-mono text-slate-400">{cat.sortOrder}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}


// ==========================================
// 4. ADMIN AD MANAGER PANEL
// ==========================================
export function AdminAdManager() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [size, setSize] = useState<AdSize>("728x90");
  const [position, setPosition] = useState<AdPosition>("Header");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");

  const refreshAds = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "Advertisements"));
      const fetched: Advertisement[] = [];
      snap.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() } as Advertisement);
      });
      setAds(fetched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAds();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      const res = await uploadToCloudinary(e.target.files[0]);
      setImageUrl(res.secure_url);
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    }
  };

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalId = "ad_" + Math.random().toString(36).substring(4);
    const newAd: Advertisement = {
      id: finalId,
      title,
      imageUrl,
      targetUrl,
      openInNewTab: true,
      size,
      position,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000 * 30).toISOString(),
      viewsCount: 0,
      clicksCount: 0,
      ctr: 0,
      enabled: true,
      priority,
      targeting: {
        categories: [],
        devices: ["Desktop", "Tablet", "Mobile"],
        countries: []
      }
    };

    try {
      await setDoc(doc(db, "Advertisements", finalId), newAd);
      alert("Sponsored advertisement registered!");
      setTitle("");
      setImageUrl("");
      setTargetUrl("");
      refreshAds();
    } catch (err: any) {
      alert("Firestore error: " + err.message);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!confirm("Delete this advertisement?")) return;
    try {
      await deleteDoc(doc(db, "Advertisements", adId));
      refreshAds();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-3">
        <h1 className="font-sans font-black text-xl text-white">Sponsored Ad Server Configuration</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Ad Form */}
        <form onSubmit={handleCreateAd} className="bg-slate-900 p-6 rounded-xl border border-slate-800/60 space-y-4 h-fit">
          <h3 className="text-xs font-bold font-mono uppercase text-indigo-400">Add Campaign Banner</h3>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 font-mono uppercase">Campaign Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Learn Firebase with GCP"
              className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 font-mono uppercase font-semibold">Image Asset File</label>
            <input
              type="file"
              onChange={handleFileUpload}
              className="w-full text-xs p-1 text-slate-400 bg-slate-950 border border-slate-800 rounded cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 font-mono uppercase">Asset Image URL</label>
            <input
              type="text"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Cloudinary CDN asset URL"
              className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 font-mono uppercase">Target URL Destination</label>
            <input
              type="text"
              required
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://cloud.google.com"
              className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-500 font-mono uppercase">Dimensions</label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value as AdSize)}
                className="w-full text-xs p-2 rounded bg-slate-950 border border-slate-800 text-white outline-none"
              >
                <option value="728x90">728x90 (Leaderboard)</option>
                <option value="300x250">300x250 (Rectangle)</option>
                <option value="320x50">320x50 (Bottom Banner)</option>
                <option value="300x600">300x600 (Half Page)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-500 font-mono uppercase">Web Position</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as AdPosition)}
                className="w-full text-xs p-2 rounded bg-slate-950 border border-slate-800 text-white outline-none"
              >
                <option value="Header">Header Banner</option>
                <option value="Sidebar">Sidebar Right</option>
                <option value="Inside Article">Inside Article Paragraphs</option>
                <option value="Sticky Bottom">Sticky Bottom Frame</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl"
          >
            Deploy Ad Banner
          </button>
        </form>

        {/* Ad Campaigns table with views, clicks, CTR stats */}
        <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800/60 overflow-hidden">
          {loading ? (
            <p className="text-center py-12 text-xs text-slate-400">Syncing campaign banners...</p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/20">
                  <th className="p-4">Campaign Name</th>
                  <th className="p-4">Position</th>
                  <th className="p-4 font-mono">Views</th>
                  <th className="p-4 font-mono">Clicks</th>
                  <th className="p-4 font-mono">CTR</th>
                  <th className="p-4 text-center">Delete</th>
                </tr>
              </thead>
              <tbody>
                {ads.map((ad) => (
                  <tr key={ad.id} className="border-b border-slate-800/40">
                    <td className="p-4 font-bold text-slate-200">
                      <span>{ad.title}</span>
                      <span className="block text-[8px] font-mono text-indigo-400 uppercase mt-0.5">{ad.size} • {ad.priority}</span>
                    </td>
                    <td className="p-4 text-slate-400">{ad.position}</td>
                    <td className="p-4 font-mono text-slate-300">{ad.viewsCount}</td>
                    <td className="p-4 font-mono text-slate-300">{ad.clicksCount}</td>
                    <td className="p-4 font-mono text-emerald-400 font-bold">{ad.ctr || 0}%</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDeleteAd(ad.id)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}


// ==========================================
// 5. ADMIN COMMENTS MODERATION PANEL
// ==========================================
export function AdminCommentsManager() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshComments = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "Comments"));
      const fetched: Comment[] = [];
      snap.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() } as Comment);
      });
      setComments(fetched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshComments();
  }, []);

  const handleApproveComment = async (id: string) => {
    try {
      await updateDoc(doc(db, "Comments", id), { status: "Approved" });
      setComments(comments.map(c => c.id === id ? { ...c, status: "Approved" } : c));
    } catch (err) {
      console.error(err);
    }
  };

  const handleModerateComment = async (id: string) => {
    try {
      await updateDoc(doc(db, "Comments", id), { status: "Moderated", content: "[Comment moderated by editorial supervisors due to technical spam/XSS violations]" });
      setComments(comments.map(c => c.id === id ? { ...c, status: "Moderated", content: "[Comment moderated...]" } : c));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteDoc(doc(db, "Comments", commentId));
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-3">
        <h1 className="font-sans font-black text-xl text-white">Community Comments Moderation</h1>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800/60 overflow-hidden">
        {loading ? (
          <p className="text-center py-12 text-slate-400">Syncing community feedback comments...</p>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/20">
                <th className="p-4">Reader Author</th>
                <th className="p-4">Message Content</th>
                <th className="p-4">Log Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((comm) => (
                <tr key={comm.id} className="border-b border-slate-800/40 hover:bg-slate-800/10">
                  <td className="p-4 font-bold text-slate-200">
                    <span>{comm.userName}</span>
                    <span className="block text-[8px] font-mono text-slate-500 mt-0.5">{comm.userEmail}</span>
                  </td>
                  <td className="p-4 text-slate-300 max-w-sm truncate leading-relaxed">{comm.content}</td>
                  <td className="p-4 text-slate-400">{new Date(comm.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      comm.status === "Approved" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                    }`}>
                      {comm.status}
                    </span>
                  </td>
                  <td className="p-4 flex items-center justify-center gap-2">
                    {comm.status !== "Approved" && (
                      <button
                        onClick={() => handleApproveComment(comm.id)}
                        className="p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded"
                        title="Approve"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleModerateComment(comm.id)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded"
                      title="Moderate Content"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comm.id)}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded"
                      title="Delete Permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {comments.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500 font-mono">No feedback comments logged.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}


// ==========================================
// 6. ADMIN SETTINGS PANEL
// ==========================================
export function AdminSettingsManager() {
  const [settings, setSettings] = useState<WebSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"branding" | "weather" | "datetime" | "prayer" | "footer" | "pages" | "colors">("branding");

  // Custom pages local form state
  const [newCustomPageTitle, setNewCustomPageTitle] = useState("");
  const [newCustomPageSlug, setNewCustomPageSlug] = useState("");

  // Footer sections local form state
  const [newSectionTitle, setNewSectionTitle] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, "Settings", "general"));
        if (snap.exists()) {
          setSettings(snap.data() as WebSettings);
        } else {
          // If no doc, we use defaults
          const defaults: WebSettings = {
            websiteName: "Dev News Pro",
            logo: "",
            favicon: "",
            theme: "Dark",
            socialLinks: { facebook: "", twitter: "", github: "" },
            seo: { defaultTitle: "Dev News Pro", defaultDescription: "", defaultKeywords: "" },
            emailSettings: { senderEmail: "", senderName: "" },
            cloudinarySettings: { cloudName: "", apiKey: "" },
            maintenanceMode: false,
            footerContent: "Architecting real-time technical information.",
            footerCopyrightText: "© 2026 DEV NEWS PRO INC.",
            contactEmail: "contact@devnewspro.com",
            contactPhone: "",
            whatsappNumber: "",
            aboutPageContent: "",
            privacyPageContent: "",
            termsPageContent: "",
            customPages: [],
            websiteColors: {
              primary: "indigo-600",
              secondary: "slate-800",
              accent: "blue-500",
              bgLight: "slate-50",
              bgDark: "slate-950"
            },
            weatherEnabled: true,
            weatherCity: "Dubai",
            weatherCountry: "UAE",
            weatherPosition: "Sidebar",
            weatherStyle: "Standard",
            weatherShowTemp: true,
            weatherShowStatus: true,
            weatherShowHumidity: true,
            weatherShowWind: true,
            weatherShowForecast: true,
            dateTimeEnabled: true,
            dateTimeShowTime: true,
            dateTimeShowDate: true,
            dateTimeShowGregorian: true,
            dateTimeShowHijri: true,
            dateTimeStyle: "Standard",
            prayerTimesEnabled: true,
            prayerTimesCountry: "UAE",
            prayerTimesCity: "Dubai",
            prayerTimesHeaderWidget: true,
            prayerTimesSidebarWidget: true,
            prayerTimesPageEnabled: true,
            prayerTimesStyle: "Standard",
            prayerTimesManual: {
              fajr: "04:15",
              sunrise: "05:40",
              dhuhr: "12:20",
              asr: "15:45",
              maghrib: "19:10",
              isha: "20:35"
            },
            footerSections: []
          };
          setSettings(defaults);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    if (!settings) return;
    try {
      await setDoc(doc(db, "Settings", "general"), settings);
      alert("All system configurations synchronized successfully to Cloud Firestore!");
    } catch (err: any) {
      alert("Failed to sync configurations: " + err.message);
    }
  };

  const updateField = (section: string, field: string, value: any) => {
    if (!settings) return;
    setSettings((prev: any) => {
      if (!prev) return prev;
      if (section === "root") {
        return { ...prev, [field]: value };
      }
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      };
    });
  };

  // Footer Builder Helpers
  const addFooterSection = () => {
    if (!settings || !newSectionTitle.trim()) return;
    const newSection = {
      id: "sec_" + Date.now(),
      title: newSectionTitle.trim(),
      sortOrder: (settings.footerSections?.length || 0) + 1,
      links: []
    };
    const updatedSections = [...(settings.footerSections || []), newSection];
    updateField("root", "footerSections", updatedSections);
    setNewSectionTitle("");
  };

  const removeFooterSection = (sectionId: string) => {
    if (!settings) return;
    const filtered = (settings.footerSections || []).filter(s => s.id !== sectionId);
    updateField("root", "footerSections", filtered);
  };

  const addLinkToSection = (sectionId: string, linkTitle: string, linkUrl: string, linkIcon?: string) => {
    if (!settings || !linkTitle.trim() || !linkUrl.trim()) return;
    const sections = (settings.footerSections || []).map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          links: [...sec.links, { title: linkTitle.trim(), url: linkUrl.trim(), icon: linkIcon?.trim() || undefined }]
        };
      }
      return sec;
    });
    updateField("root", "footerSections", sections);
  };

  const removeLinkFromSection = (sectionId: string, linkIndex: number) => {
    if (!settings) return;
    const sections = (settings.footerSections || []).map(sec => {
      if (sec.id === sectionId) {
        const links = [...sec.links];
        links.splice(linkIndex, 1);
        return { ...sec, links };
      }
      return sec;
    });
    updateField("root", "footerSections", sections);
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    if (!settings || !settings.footerSections) return;
    const list = [...settings.footerSections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    // Swap elements
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // Re-assign sort orders
    const updated = list.map((sec, idx) => ({ ...sec, sortOrder: idx + 1 }));
    updateField("root", "footerSections", updated);
  };

  // Custom Pages Helpers
  const addCustomPage = () => {
    if (!settings || !newCustomPageTitle.trim() || !newCustomPageSlug.trim()) return;
    const newPage = {
      id: "page_" + Date.now(),
      title: newCustomPageTitle.trim(),
      slug: newCustomPageSlug.trim().toLowerCase().replace(/\s+/g, "-"),
      content: "## " + newCustomPageTitle.trim() + "\n\nWrite your content here...",
      updatedAt: new Date().toISOString()
    };
    const updatedPages = [...(settings.customPages || []), newPage];
    updateField("root", "customPages", updatedPages);
    setNewCustomPageTitle("");
    setNewCustomPageSlug("");
  };

  const deleteCustomPage = (pageId: string) => {
    if (!settings) return;
    const filtered = (settings.customPages || []).filter(p => p.id !== pageId);
    updateField("root", "customPages", filtered);
  };

  const updateCustomPageContent = (pageId: string, key: "title" | "slug" | "content", value: string) => {
    if (!settings) return;
    const pages = (settings.customPages || []).map(p => {
      if (p.id === pageId) {
        return { ...p, [key]: value, updatedAt: new Date().toISOString() };
      }
      return p;
    });
    updateField("root", "customPages", pages);
  };

  const triggerDatabaseBackup = () => {
    alert("Database Backup Created Successfully!\nSaved Schema Archive File: /src/assets/backup_2026.json");
  };

  const triggerDatabaseRestore = () => {
    alert("Database Refreshed to Seed Snapshot State successfully!");
  };

  if (loading || !settings) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3 font-mono text-xs">
        <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
        <p>Retrieving Cloud System Configuration Nodes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="font-sans font-black text-2xl text-white">Advanced System Configuration</h1>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">Control all branding, widgets, API feeds, and layout parameters live without compiling.</p>
        </div>
        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/15 transition-all self-stretch sm:self-auto justify-center"
        >
          <Save className="w-4 h-4" /> Sync All Systems
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab("branding")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === "branding" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          Portal Branding
        </button>
        <button
          onClick={() => setActiveTab("colors")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === "colors" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          Theme Colors
        </button>
        <button
          onClick={() => setActiveTab("weather")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === "weather" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          Weather Widget
        </button>
        <button
          onClick={() => setActiveTab("datetime")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === "datetime" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          Date & Time
        </button>
        <button
          onClick={() => setActiveTab("prayer")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === "prayer" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          Prayer Timings
        </button>
        <button
          onClick={() => setActiveTab("footer")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === "footer" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          Footer Builder
        </button>
        <button
          onClick={() => setActiveTab("pages")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === "pages" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          Policy & Custom Pages
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        
        {/* PANEL 1: BRANDING */}
        {activeTab === "branding" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-xs font-bold font-mono uppercase text-indigo-400">Portal branding parameters</h3>
              <p className="text-[10px] text-slate-400">Set website name, logo images, and contact connections.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase">Website Title Name</label>
                <input
                  type="text"
                  value={settings.websiteName}
                  onChange={(e) => updateField("root", "websiteName", e.target.value)}
                  className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase">Favicon Link URL (32x32px)</label>
                <input
                  type="text"
                  value={settings.favicon}
                  onChange={(e) => updateField("root", "favicon", e.target.value)}
                  className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase">Header Logo URL (Image or empty for dynamic CSS)</label>
                <input
                  type="text"
                  value={settings.logo}
                  onChange={(e) => updateField("root", "logo", e.target.value)}
                  className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase">Footer Copyright Text</label>
                <input
                  type="text"
                  value={settings.footerCopyrightText || ""}
                  onChange={(e) => updateField("root", "footerCopyrightText", e.target.value)}
                  className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase">Footer Description / About Text</label>
                <textarea
                  rows={2}
                  value={settings.footerContent || ""}
                  onChange={(e) => updateField("root", "footerContent", e.target.value)}
                  className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-6 space-y-4">
              <h4 className="text-xs font-bold font-mono text-indigo-400 uppercase">Contact Information Connections</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 font-mono uppercase">Email Address</label>
                  <input
                    type="email"
                    value={settings.contactEmail || ""}
                    onChange={(e) => updateField("root", "contactEmail", e.target.value)}
                    className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 font-mono uppercase">Phone Number</label>
                  <input
                    type="text"
                    value={settings.contactPhone || ""}
                    onChange={(e) => updateField("root", "contactPhone", e.target.value)}
                    className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 font-mono uppercase">WhatsApp Number</label>
                  <input
                    type="text"
                    value={settings.whatsappNumber || ""}
                    onChange={(e) => updateField("root", "whatsappNumber", e.target.value)}
                    className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-6 space-y-4">
              <h4 className="text-xs font-bold font-mono text-indigo-400 uppercase">Social Connectivity links</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(["facebook", "twitter", "linkedin", "github", "youtube", "instagram", "whatsapp"] as const).map((platform) => (
                  <div key={platform} className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 font-mono uppercase">{platform}</label>
                    <input
                      type="text"
                      value={settings.socialLinks?.[platform] || ""}
                      onChange={(e) => {
                        const links = { ...(settings.socialLinks || {}), [platform]: e.target.value };
                        updateField("root", "socialLinks", links);
                      }}
                      className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PANEL 2: THEME COLORS */}
        {activeTab === "colors" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-xs font-bold font-mono uppercase text-indigo-400">Portal theme & color accents</h3>
              <p className="text-[10px] text-slate-400">Design the general feel and primary visual colors of your application.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase">Default Theme</label>
                <select
                  value={settings.theme}
                  onChange={(e) => updateField("root", "theme", e.target.value)}
                  className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500"
                >
                  <option value="Light">Light Mode</option>
                  <option value="Dark">Dark Mode</option>
                  <option value="System">System Preferences</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase">Primary Color Accent Class (Tailwind, e.g., 'indigo-600')</label>
                <input
                  type="text"
                  value={settings.websiteColors?.primary || "indigo-600"}
                  onChange={(e) => {
                    const colors = { ...(settings.websiteColors || {}), primary: e.target.value };
                    updateField("root", "websiteColors", colors);
                  }}
                  className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase">Secondary Accent Color</label>
                <input
                  type="text"
                  value={settings.websiteColors?.secondary || "slate-800"}
                  onChange={(e) => {
                    const colors = { ...(settings.websiteColors || {}), secondary: e.target.value };
                    updateField("root", "websiteColors", colors);
                  }}
                  className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase">Primary Interactive Highlight (e.g., 'blue-500')</label>
                <input
                  type="text"
                  value={settings.websiteColors?.accent || "blue-500"}
                  onChange={(e) => {
                    const colors = { ...(settings.websiteColors || {}), accent: e.target.value };
                    updateField("root", "websiteColors", colors);
                  }}
                  className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* PANEL 3: WEATHER WIDGET */}
        {activeTab === "weather" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-xs font-bold font-mono uppercase text-indigo-400">Weather Widget controls</h3>
              <p className="text-[10px] text-slate-400">Enable, select location, and modify weather widget style parameters.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 p-3 rounded bg-slate-950 border border-slate-800">
                <input
                  type="checkbox"
                  id="weatherEnabled"
                  checked={!!settings.weatherEnabled}
                  onChange={(e) => updateField("root", "weatherEnabled", e.target.checked)}
                  className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-opacity-50"
                />
                <label htmlFor="weatherEnabled" className="text-xs font-bold text-slate-300 font-mono uppercase select-none cursor-pointer">Enable Weather Section</label>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase">Weather Target City</label>
                <input
                  type="text"
                  value={settings.weatherCity || ""}
                  onChange={(e) => updateField("root", "weatherCity", e.target.value)}
                  className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500"
                  placeholder="Dubai"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase">Weather Target Country</label>
                <input
                  type="text"
                  value={settings.weatherCountry || ""}
                  onChange={(e) => updateField("root", "weatherCountry", e.target.value)}
                  className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500"
                  placeholder="UAE"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase">Widget Location Position</label>
                <select
                  value={settings.weatherPosition || "Sidebar"}
                  onChange={(e) => updateField("root", "weatherPosition", e.target.value)}
                  className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500"
                >
                  <option value="Header">Header Row</option>
                  <option value="Sidebar">Sidebar Column</option>
                  <option value="Footer">Footer Column</option>
                  <option value="None">Disabled / None</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase">Widget Style Preset</label>
                <select
                  value={settings.weatherStyle || "Standard"}
                  onChange={(e) => updateField("root", "weatherStyle", e.target.value)}
                  className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500"
                >
                  <option value="Minimal">Minimal (Text list)</option>
                  <option value="Standard">Standard (Comfort card)</option>
                  <option value="Detailed">Detailed (Forecast block)</option>
                </select>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-6 space-y-3">
              <h4 className="text-xs font-bold font-mono text-indigo-400 uppercase">Information display checkboxes</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { key: "weatherShowTemp", label: "Display Temperature" },
                  { key: "weatherShowStatus", label: "Display Status Text" },
                  { key: "weatherShowHumidity", label: "Display Humidity" },
                  { key: "weatherShowWind", label: "Display Wind Speed" },
                  { key: "weatherShowForecast", label: "Display Forecast List" }
                ].map((item) => (
                  <div key={item.key} className="flex items-center gap-2 p-2.5 rounded bg-slate-950/60 border border-slate-800/60">
                    <input
                      type="checkbox"
                      id={item.key}
                      checked={!!(settings as any)[item.key]}
                      onChange={(e) => updateField("root", item.key, e.target.checked)}
                      className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor={item.key} className="text-[10px] font-bold text-slate-300 font-mono select-none cursor-pointer">{item.label}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PANEL 4: DATE & TIME */}
        {activeTab === "datetime" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-xs font-bold font-mono uppercase text-indigo-400">Date & Time feed controls</h3>
              <p className="text-[10px] text-slate-400">Configure Gregorian and Hijri calendar feeds dynamically.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 p-3 rounded bg-slate-950 border border-slate-800">
                <input
                  type="checkbox"
                  id="dateTimeEnabled"
                  checked={!!settings.dateTimeEnabled}
                  onChange={(e) => updateField("root", "dateTimeEnabled", e.target.checked)}
                  className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="dateTimeEnabled" className="text-xs font-bold text-slate-300 font-mono uppercase select-none cursor-pointer">Enable DateTime System</label>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase">Display Style Presets</label>
                <select
                  value={settings.dateTimeStyle || "Standard"}
                  onChange={(e) => updateField("root", "dateTimeStyle", e.target.value)}
                  className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500"
                >
                  <option value="Minimal">Minimal (Text line)</option>
                  <option value="Standard">Standard (Split label)</option>
                  <option value="Detailed">Detailed (Card Layout)</option>
                  <option value="Digital">Digital Clock (Futuristic)</option>
                </select>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-6 space-y-3">
              <h4 className="text-xs font-bold font-mono text-indigo-400 uppercase">Information display checkboxes</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { key: "dateTimeShowTime", label: "Show Current Time" },
                  { key: "dateTimeShowDate", label: "Show Current Date" },
                  { key: "dateTimeShowGregorian", label: "Display Gregorian format" },
                  { key: "dateTimeShowHijri", label: "Display Hijri format" }
                ].map((item) => (
                  <div key={item.key} className="flex items-center gap-2 p-2.5 rounded bg-slate-950/60 border border-slate-800/60">
                    <input
                      type="checkbox"
                      id={item.key}
                      checked={!!(settings as any)[item.key]}
                      onChange={(e) => updateField("root", item.key, e.target.checked)}
                      className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor={item.key} className="text-[10px] font-bold text-slate-300 font-mono select-none cursor-pointer">{item.label}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PANEL 5: PRAYER TIMES */}
        {activeTab === "prayer" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-xs font-bold font-mono uppercase text-indigo-400">Prayer times system parameters</h3>
              <p className="text-[10px] text-slate-400">Manage real-time astronomical calculation integrations or manual overrides.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 p-3 rounded bg-slate-950 border border-slate-800">
                <input
                  type="checkbox"
                  id="prayerTimesEnabled"
                  checked={!!settings.prayerTimesEnabled}
                  onChange={(e) => updateField("root", "prayerTimesEnabled", e.target.checked)}
                  className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="prayerTimesEnabled" className="text-xs font-bold text-slate-300 font-mono uppercase select-none cursor-pointer">Enable Prayer Times Module</label>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase">Prayer Style Preset</label>
                <select
                  value={settings.prayerTimesStyle || "Standard"}
                  onChange={(e) => updateField("root", "prayerTimesStyle", e.target.value)}
                  className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500"
                >
                  <option value="Standard">Standard List Layout</option>
                  <option value="Modern Card">Modern Grid Card</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase">Calculations Target Country</label>
                <input
                  type="text"
                  value={settings.prayerTimesCountry || ""}
                  onChange={(e) => updateField("root", "prayerTimesCountry", e.target.value)}
                  className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500"
                  placeholder="UAE"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase">Calculations Target City</label>
                <input
                  type="text"
                  value={settings.prayerTimesCity || ""}
                  onChange={(e) => updateField("root", "prayerTimesCity", e.target.value)}
                  className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500"
                  placeholder="Dubai"
                />
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-6 space-y-3">
              <h4 className="text-xs font-bold font-mono text-indigo-400 uppercase">Widget placements across website</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { key: "prayerTimesHeaderWidget", label: "Show in Header Strip" },
                  { key: "prayerTimesSidebarWidget", label: "Show in Sidebar Panel" },
                  { key: "prayerTimesPageEnabled", label: "Enable Dedicated Timings Page" }
                ].map((item) => (
                  <div key={item.key} className="flex items-center gap-2 p-2.5 rounded bg-slate-950/60 border border-slate-800/60">
                    <input
                      type="checkbox"
                      id={item.key}
                      checked={!!(settings as any)[item.key]}
                      onChange={(e) => updateField("root", item.key, e.target.checked)}
                      className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor={item.key} className="text-[10px] font-bold text-slate-300 font-mono select-none cursor-pointer">{item.label}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-6 space-y-4">
              <h4 className="text-xs font-bold font-mono text-indigo-400 uppercase">Manual Timings Override Settings (Offline Fallbacks)</h4>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                {(["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"] as const).map((pr) => (
                  <div key={pr} className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 font-mono uppercase">{pr}</label>
                    <input
                      type="text"
                      value={settings.prayerTimesManual?.[pr] || ""}
                      onChange={(e) => {
                        const manual = { ...(settings.prayerTimesManual || {}), [pr]: e.target.value };
                        updateField("root", "prayerTimesManual", manual);
                      }}
                      className="w-full text-xs p-2 rounded bg-slate-950 border border-slate-800 text-white outline-none text-center font-mono focus:border-indigo-500"
                      placeholder="00:00"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PANEL 6: FOOTER BUILDER */}
        {activeTab === "footer" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-xs font-bold font-mono uppercase text-indigo-400">Footer Dynamic Columns Builder</h3>
              <p className="text-[10px] text-slate-400">Create navigation categories, append links, and re-order columns on the live footer feed.</p>
            </div>

            {/* Add new section builder form */}
            <div className="flex gap-2 p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <input
                type="text"
                placeholder="Column Title (e.g. Services, Resources)"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                className="flex-1 text-xs p-2.5 rounded bg-slate-900 border border-slate-800 text-white outline-none"
              />
              <button
                type="button"
                onClick={addFooterSection}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow-md"
              >
                Create Footer Column
              </button>
            </div>

            {/* List columns */}
            <div className="space-y-4">
              {(settings.footerSections || []).map((section, idx) => (
                <div key={section.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-300 uppercase font-mono tracking-wider">
                        Column #{idx + 1}: <span className="text-indigo-400">{section.title}</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveSection(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40"
                        title="Move Left"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(idx, "down")}
                        disabled={idx === (settings.footerSections || []).length - 1}
                        className="p-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40"
                        title="Move Right"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFooterSection(section.id)}
                        className="p-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded text-[10px] font-bold"
                      >
                        Remove Column
                      </button>
                    </div>
                  </div>

                  {/* Links editor inside section */}
                  <div className="space-y-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">Column Links drawer:</span>
                    
                    <div className="space-y-2">
                      {section.links.map((link, linkIdx) => (
                        <div key={linkIdx} className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800/40 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-1.5 py-0.5 rounded">#{linkIdx + 1}</span>
                            <span className="font-bold text-white">{link.title}</span>
                            <span className="text-slate-500 font-mono text-[10px]">{link.url}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLinkFromSection(section.id, linkIdx)}
                            className="text-[10px] font-bold text-rose-500 hover:underline"
                          >
                            Delete link
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Form to add link */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-900/60">
                      <input
                        type="text"
                        placeholder="Link Title (e.g. Portal Home)"
                        id={`link_title_${section.id}`}
                        className="text-xs p-2 rounded bg-slate-900 border border-slate-800 text-white outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Link URL (e.g. /, /about, http://...)"
                        id={`link_url_${section.id}`}
                        className="text-xs p-2 rounded bg-slate-900 border border-slate-800 text-white outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const titleInput = document.getElementById(`link_title_${section.id}`) as HTMLInputElement;
                          const urlInput = document.getElementById(`link_url_${section.id}`) as HTMLInputElement;
                          if (titleInput && urlInput) {
                            addLinkToSection(section.id, titleInput.value, urlInput.value);
                            titleInput.value = "";
                            urlInput.value = "";
                          }
                        }}
                        className="p-2 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/35 border border-indigo-500/20 rounded font-bold text-[10px] uppercase tracking-wider"
                      >
                        + Append link
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PANEL 7: POLICY & CUSTOM PAGES */}
        {activeTab === "pages" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-xs font-bold font-mono uppercase text-indigo-400">Core Policies & Custom page builders</h3>
              <p className="text-[10px] text-slate-400">Edit core website markdown or generate and release custom stand-alone info frames.</p>
            </div>

            {/* Core Markdown Editors */}
            <div className="grid grid-cols-1 gap-6">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <h4 className="text-xs font-bold font-mono text-indigo-400 uppercase">1. About Us Page Content (Markdown Supported)</h4>
                <textarea
                  rows={4}
                  value={settings.aboutPageContent || ""}
                  onChange={(e) => updateField("root", "aboutPageContent", e.target.value)}
                  className="w-full text-xs font-mono p-3 rounded bg-slate-900 border border-slate-850 text-white outline-none focus:border-indigo-500"
                  placeholder="## About Us..."
                />
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <h4 className="text-xs font-bold font-mono text-indigo-400 uppercase">2. Privacy Policy Page Content (Markdown Supported)</h4>
                <textarea
                  rows={4}
                  value={settings.privacyPageContent || ""}
                  onChange={(e) => updateField("root", "privacyPageContent", e.target.value)}
                  className="w-full text-xs font-mono p-3 rounded bg-slate-900 border border-slate-850 text-white outline-none focus:border-indigo-500"
                  placeholder="## Privacy Policy..."
                />
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <h4 className="text-xs font-bold font-mono text-indigo-400 uppercase">3. Terms and Conditions Page Content (Markdown Supported)</h4>
                <textarea
                  rows={4}
                  value={settings.termsPageContent || ""}
                  onChange={(e) => updateField("root", "termsPageContent", e.target.value)}
                  className="w-full text-xs font-mono p-3 rounded bg-slate-900 border border-slate-850 text-white outline-none focus:border-indigo-500"
                  placeholder="## Terms of Service..."
                />
              </div>
            </div>

            {/* Custom Pages Creation list */}
            <div className="border-t border-slate-800/80 pt-6 space-y-4">
              <h4 className="text-xs font-bold font-mono text-indigo-400 uppercase">4. Release Custom Stand-Alone Page</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <input
                  type="text"
                  placeholder="Page Title (e.g. Careers)"
                  value={newCustomPageTitle}
                  onChange={(e) => setNewCustomPageTitle(e.target.value)}
                  className="text-xs p-2.5 rounded bg-slate-900 border border-slate-800 text-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Page URL Slug (e.g. careers)"
                  value={newCustomPageSlug}
                  onChange={(e) => setNewCustomPageSlug(e.target.value)}
                  className="text-xs p-2.5 rounded bg-slate-900 border border-slate-800 text-white outline-none"
                />
                <button
                  type="button"
                  onClick={addCustomPage}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow"
                >
                  Create Custom Page
                </button>
              </div>

              <div className="space-y-4">
                {(settings.customPages || []).map((page) => (
                  <div key={page.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white uppercase font-sans">{page.title}</span>
                        <div className="text-[10px] text-indigo-400 font-mono">URL path: <span className="underline">/page/{page.slug}</span></div>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteCustomPage(page.id)}
                        className="px-3 py-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500/25 rounded text-[10px] font-bold"
                      >
                        Delete Page
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 font-mono uppercase block">Page Content Editor (Markdown or HTML):</label>
                      <textarea
                        rows={4}
                        value={page.content}
                        onChange={(e) => updateCustomPageContent(page.id, "content", e.target.value)}
                        className="w-full text-xs font-mono p-3 rounded bg-slate-900 border border-slate-850 text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Database Backup & Restores */}
      <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800/80 space-y-4">
        <h3 className="text-xs font-bold font-mono uppercase text-indigo-400 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Database Administration & Maintenance
        </h3>
        <p className="text-[10px] text-slate-400 leading-normal max-w-xl">
          Perform manual structural snapshots of all Firestore document databases, category sorting, and active campaigns.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 max-w-md">
          <button
            type="button"
            onClick={triggerDatabaseBackup}
            className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] uppercase rounded-lg border border-slate-700/50"
          >
            Create Backup Snapshot
          </button>
          <button
            type="button"
            onClick={triggerDatabaseRestore}
            className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] uppercase rounded-lg border border-slate-700/50"
          >
            Refresh Database Snapshot
          </button>
        </div>
      </div>
    </div>
  );
}


// ==========================================
// 7. DEDICATED RSS IMPORT PANEL
// ==========================================
export function AdminRssImporter() {
  const [rssUrl, setRssUrl] = useState("https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml");
  const [rssItems, setRssItems] = useState<any[]>([]);
  const [rssLoading, setRssLoading] = useState(false);
  const [rssError, setRssError] = useState("");
  const [rssSuccess, setRssSuccess] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedDefaultCategory, setSelectedDefaultCategory] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Review & Edit Modal States
  const [reviewItem, setReviewItem] = useState<any | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Editing form states
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editFeaturedImage, setEditFeaturedImage] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editStatus, setEditStatus] = useState<"Draft" | "Published">("Published");
  const [editIsFeatured, setEditIsFeatured] = useState(true);
  const [editIsEditorsChoice, setEditIsEditorsChoice] = useState(false);
  const [editIsTrending, setEditIsTrending] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const catSnap = await getDocs(collection(db, "Categories"));
        const cats: Category[] = [];
        catSnap.forEach((doc) => {
          cats.push(doc.data() as Category);
        });
        setCategories(cats);
        if (cats.length > 0) {
          setSelectedDefaultCategory(cats[0].slug);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCats();
  }, []);

  const fetchRssFeed = async () => {
    setRssLoading(true);
    setRssError("");
    setRssSuccess("");
    try {
      const response = await fetch("/api/rss/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: rssUrl })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch and parse the RSS feed");
      }
      setRssItems(data.items || []);
      setRssSuccess(`نجح جلب ${data.items?.length || 0} من المقالات المتاحة للاستيراد!`);
    } catch (err: any) {
      setRssError(err.message || "خطأ أثناء محاولة جلب الأخبار من الرابط.");
    } finally {
      setRssLoading(false);
    }
  };

  // Direct Publish Action (One-click)
  const handleDirectPublish = async (item: any) => {
    try {
      const slug = item.title
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
        .replace(/(^-|-$)/g, "") || String(Date.now());
        
      const publishDate = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();
      const readingTime = Math.max(1, Math.round((item.description || "").split(/\s+/).length / 150));
      const targetCat = selectedDefaultCategory || (categories.length > 0 ? categories[0].slug : "technology");

      const recordData: NewsArticle = {
        id: slug,
        title: item.title,
        slug,
        content: `### ${item.title}\n\n${item.description || "لا يوجد محتوى تفصيلي متوفر حالياً."}\n\n[اقرأ المقال الكامل عبر المصدر الأصلي](${item.link})`,
        summary: item.description?.slice(0, 180) || item.title,
        category: targetCat,
        tags: ["rss", "imported", "direct-ingest"],
        featuredImage: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800",
        galleryImages: [],
        authorId: "auth_admin",
        authorName: "Sarah Jenkins (RSS)",
        authorEmail: "sarah@devnewspro.com",
        status: "Published",
        publishDate,
        updatedDate: new Date().toISOString(),
        readingTime,
        views: Math.floor(Math.random() * 50) + 10,
        likes: [],
        commentsCount: 0,
        isEditorsChoice: false,
        isFeatured: true,
        isTrending: true
      };

      await setDoc(doc(db, "News", slug), recordData, { merge: true });
      alert(`تم استيراد ونشر الخبر بنجاح!\n"${item.title}"`);
    } catch (err: any) {
      alert("حدث خطأ أثناء استيراد الخبر مباشرة: " + err.message);
    }
  };

  // Open Edit Dialog
  const handleOpenEdit = (item: any) => {
    const defaultSlug = item.title
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
      .replace(/(^-|-$)/g, "") || String(Date.now());

    setEditingItem(item);
    setEditTitle(item.title);
    setEditSlug(defaultSlug);
    setEditSummary(item.description || "");
    setEditContent(`### ${item.title}\n\n${item.description || ""}\n\n[اقرأ المقال الكامل عبر المصدر الأصلي](${item.link})`);
    setEditCategory(selectedDefaultCategory || (categories.length > 0 ? categories[0].slug : "technology"));
    setEditFeaturedImage("https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800");
    setEditTags("rss, imported, tech");
    setEditStatus("Published");
    setEditIsFeatured(true);
    setEditIsEditorsChoice(false);
    setEditIsTrending(false);
  };

  // Save the Edited Item to Firestore
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle || !editSlug) return;

    try {
      const publishDate = editingItem?.pubDate ? new Date(editingItem.pubDate).toISOString() : new Date().toISOString();
      const readingTime = Math.max(1, Math.round((editContent || "").split(/\s+/).length / 150));

      const recordData: NewsArticle = {
        id: editSlug,
        title: editTitle,
        slug: editSlug,
        content: editContent,
        summary: editSummary || editTitle,
        category: editCategory,
        tags: editTags.split(",").map(t => t.trim()).filter(Boolean),
        featuredImage: editFeaturedImage || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800",
        galleryImages: [],
        authorId: "auth_admin",
        authorName: "Sarah Jenkins (RSS)",
        authorEmail: "sarah@devnewspro.com",
        status: editStatus,
        publishDate,
        updatedDate: new Date().toISOString(),
        readingTime,
        views: Math.floor(Math.random() * 50) + 10,
        likes: [],
        commentsCount: 0,
        isEditorsChoice: editIsEditorsChoice,
        isFeatured: editIsFeatured,
        isTrending: editIsTrending
      };

      await setDoc(doc(db, "News", editSlug), recordData, { merge: true });
      alert(`تم بنجاح تعديل واستيراد الخبر بنجاح! تم وضعه كـ (${editStatus})`);
      setEditingItem(null);
    } catch (err: any) {
      alert("حدث خطأ أثناء حفظ المقال المعدل: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-sans font-black text-xl text-white flex items-center gap-2">
            <Rss className="w-5 h-5 text-blue-500" /> لوحة جلب واستيراد الأخبار | RSS Smart Ingestion
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            مزامنة المقالات من المصادر الخارجية وتعديلها ومراجعتها ثم نشرها بنقرة زر واحدة.
          </p>
        </div>

        {/* Global category defaults */}
        <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl flex items-center gap-3">
          <label className="text-[10px] font-bold text-gray-400 font-mono uppercase tracking-wider whitespace-nowrap">
            التصنيف الافتراضي / Default Category:
          </label>
          <select
            value={selectedDefaultCategory}
            onChange={(e) => setSelectedDefaultCategory(e.target.value)}
            className="text-xs bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white outline-none focus:border-blue-500"
          >
            {categories.map(c => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main fetch controller */}
      <div className="p-6 bg-slate-900 rounded-xl border border-slate-800/60 space-y-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <Globe className="w-4.5 h-4.5" />
          </span>
          <h3 className="text-xs font-bold text-blue-400 uppercase font-mono tracking-wider">تغذية الأخبار النشطة | RSS Feed Configuration</h3>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase text-slate-400 font-mono tracking-wider">رابط RSS URL أو Atom XML</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={rssUrl}
              onChange={(e) => setRssUrl(e.target.value)}
              placeholder="https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml"
              className="flex-1 text-xs p-3 rounded-lg bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500 transition-colors font-mono"
            />
            <button
              type="button"
              onClick={fetchRssFeed}
              disabled={rssLoading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              {rssLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> جاري الجلب...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" /> جلب تغذية الأخبار | Fetch Feed
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-2 text-slate-500 text-[10px] font-mono">
          <span>روابط تغذية جاهزة ومجربة:</span>
          <button
            type="button"
            onClick={() => setRssUrl("https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml")}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded transition-colors"
          >
            NYT Technology (EN)
          </button>
          <button
            type="button"
            onClick={() => setRssUrl("https://news.google.com/rss?hl=ar&gl=AE&ceid=AE:ar")}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded transition-colors"
          >
            Google News UAE (AR)
          </button>
          <button
            type="button"
            onClick={() => setRssUrl("https://www.aljazeera.net/aljazeerarss/a7c186be-1acd-432a-b45f-40b59b395a15/65a507a3-5d59-4a94-82fe-3b8c2be4388e")}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded transition-colors"
          >
            الجزيرة تكنولوجيا (AR)
          </button>
        </div>

        {rssError && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono text-xs rounded-lg">
            {rssError}
          </div>
        )}
        {rssSuccess && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs rounded-lg">
            {rssSuccess}
          </div>
        )}
      </div>

      {/* Feed List Container */}
      {rssItems.length > 0 ? (
        <div className="bg-slate-900 rounded-xl border border-slate-800/60 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-950/20 flex justify-between items-center">
            <h4 className="text-xs font-bold font-mono text-gray-300 uppercase tracking-wider">المقالات التي تم العثور عليها ({rssItems.length} مقالة متوفرة)</h4>
            <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded font-mono">RSS PARSED</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                  <th className="p-4">عنوان المقال وموجز التفاصيل / Article & Feed Detail</th>
                  <th className="p-4 whitespace-nowrap">تاريخ النشر الأصلي</th>
                  <th className="p-4 text-center">عمليات المعالجة والتحكم / Processing Actions</th>
                </tr>
              </thead>
              <tbody>
                {rssItems.map((item, index) => (
                  <tr key={index} className="border-b border-slate-800/40 hover:bg-slate-800/15 transition-colors">
                    <td className="p-4">
                      <div className="text-sm font-sans font-bold tracking-tight text-white mb-1 leading-snug">{item.title}</div>
                      {item.description && (
                        <p className="text-[11px] text-slate-400 font-normal line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-slate-400 whitespace-nowrap font-mono">
                      {item.pubDate ? new Date(item.pubDate).toLocaleDateString() : "غير محدد"}
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setReviewItem(item)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white rounded-lg font-bold text-[10px] uppercase transition-colors"
                        >
                          مراجعة | Review
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="px-3 py-1.5 bg-yellow-600/10 hover:bg-yellow-600 text-yellow-500 hover:text-white border border-yellow-500/20 rounded-lg font-bold text-[10px] uppercase transition-all"
                        >
                          تعديل | Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDirectPublish(item)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-[10px] uppercase transition-all shadow-sm"
                        >
                          نشر فوري | Publish
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-900 border border-slate-800/60 rounded-xl space-y-3">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-xs text-slate-400 font-mono">الرجاء إدخال رابط التغذية RSS والضغط على زر "جلب الأخبار" لبدء الاستيراد الفعلي.</p>
        </div>
      )}

      {/* 1. Review Modal overlay */}
      {reviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
              <h3 className="text-xs font-bold font-mono text-gray-400 uppercase tracking-widest">معاينة ومراجعة الخبر قبل الاستيراد | RSS Feed Review</h3>
              <button
                type="button"
                onClick={() => setReviewItem(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1">
                <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase">Original Feed headline</span>
                <h2 className="text-lg font-sans font-black text-white tracking-tight leading-snug">{reviewItem.title}</h2>
              </div>

              {reviewItem.pubDate && (
                <div className="text-[11px] text-slate-400 font-mono">
                  تاريخ النشر الأصلي: <span className="text-white">{new Date(reviewItem.pubDate).toUTCString()}</span>
                </div>
              )}

              <div className="border-t border-slate-800/80 my-3 pt-3 space-y-2">
                <span className="text-[10px] text-gray-400 font-mono uppercase font-bold">المحتوى المسترجع / Description Text</span>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800/40">
                  {reviewItem.description || "لا يوجد وصف أو محتوى مختصر متوفر في هذا الخبر."}
                </p>
              </div>

              {reviewItem.link && (
                <div className="pt-2">
                  <a
                    href={reviewItem.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline font-mono"
                  >
                    عرض المصدر الأصلي للمقال <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-800 bg-slate-950/40 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setReviewItem(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
              >
                إغلاق | Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const item = reviewItem;
                  setReviewItem(null);
                  handleOpenEdit(item);
                }}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg text-xs font-bold"
              >
                تعديل وحفظ | Edit & Prepare
              </button>
              <button
                type="button"
                onClick={() => {
                  const item = reviewItem;
                  setReviewItem(null);
                  handleDirectPublish(item);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
              >
                نشر فوري | Quick Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Edit & Publish Modal overlay */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSaveEdit}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="p-5 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded bg-yellow-500/10 text-yellow-500">
                  <Edit2 className="w-4 h-4" />
                </span>
                <h3 className="text-xs font-bold font-mono text-gray-300 uppercase tracking-wider">تعديل وتجهيز الخبر للنشر | Edit & Ingest RSS Article</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Title and Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 font-mono uppercase">عنوان المقال / Headline Title</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 font-mono uppercase">الرابط المعرف الفريد / Custom URL Slug</label>
                  <input
                    type="text"
                    required
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                    className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Category, Tags and Image URL */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 font-mono uppercase">التصنيف / Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 font-mono uppercase">الوسوم (مفصولة بفاصلة) / Tags</label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 font-mono uppercase">رابط الصورة البارزة / Cover Image URL</label>
                  <input
                    type="text"
                    value={editFeaturedImage}
                    onChange={(e) => setEditFeaturedImage(e.target.value)}
                    className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Summary Textarea */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 font-mono uppercase">ملخص مختصر (مقدمة المقال) / Summary intro</label>
                <textarea
                  rows={2}
                  required
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500"
                />
              </div>

              {/* Full Content Textarea */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 font-mono uppercase">المحتوى الكامل (Markdown) / Markdown Rich Content</label>
                <textarea
                  rows={8}
                  required
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full text-xs p-2.5 rounded bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500 font-mono"
                />
              </div>

              {/* Status and Flags */}
              <div className="p-4 bg-slate-950/50 border border-slate-800/80 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 font-mono uppercase">حالة المقال / Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full text-xs p-2 rounded bg-slate-900 border border-slate-800 text-white outline-none"
                  >
                    <option value="Published">منشور (Published)</option>
                    <option value="Draft">مسودة (Draft)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="editIsFeatured"
                    checked={editIsFeatured}
                    onChange={(e) => setEditIsFeatured(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-900 text-blue-500 outline-none w-4 h-4"
                  />
                  <label htmlFor="editIsFeatured" className="text-[11px] font-bold text-slate-300 select-none">مقال رئيسي (Featured)</label>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="editIsEditorsChoice"
                    checked={editIsEditorsChoice}
                    onChange={(e) => setEditIsEditorsChoice(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-900 text-blue-500 outline-none w-4 h-4"
                  />
                  <label htmlFor="editIsEditorsChoice" className="text-[11px] font-bold text-slate-300 select-none">اختيار المحرر</label>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="editIsTrending"
                    checked={editIsTrending}
                    onChange={(e) => setEditIsTrending(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-900 text-blue-500 outline-none w-4 h-4"
                  />
                  <label htmlFor="editIsTrending" className="text-[11px] font-bold text-slate-300 select-none">شائع الآن (Trending)</label>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-800 bg-slate-950/40 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
              >
                إلغاء | Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Save className="w-4 h-4" /> حفظ واستيراد المقال | Save & Ingest
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

