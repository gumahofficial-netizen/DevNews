import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { db, doc, getDoc, collection, getDocs } from "../../services/firebase";
import { useAuth } from "../../hooks/useAuth";
import { useSettings } from "../../components/SettingsContext";
import { PageContent, NewsArticle } from "../../types";
import { renderMarkdown } from "../../utils/markdown";
import { DateTimeWidget, PrayerTimesWidget } from "../../components/Widgets";
import { 
  Info, 
  Shield, 
  HelpCircle, 
  Bookmark, 
  Trash2, 
  ArrowRight, 
  Home, 
  Inbox, 
  Compass, 
  Clock, 
  MapPin, 
  Calendar,
  Volume2,
  FileText
} from "lucide-react";

// ==========================================
// DYNAMIC STATIC PAGES (About, Privacy, Terms & Custom Pages)
// ==========================================
export function StaticPage({ pageId }: { pageId?: string }) {
  const { slug } = useParams<{ slug?: string }>();
  const { settings } = useSettings();
  
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [loading, setLoading] = useState(true);

  // Determine active page
  const activeId = pageId || slug || "about";

  useEffect(() => {
    setLoading(true);
    
    // 1. Check default core pages
    if (activeId === "about") {
      setTitle("About Us - من نحن");
      setBody(settings.aboutPageContent || "");
      setUpdatedAt(new Date().toISOString());
      setLoading(false);
      return;
    }
    if (activeId === "privacy") {
      setTitle("Privacy Policy - سياسة الخصوصية");
      setBody(settings.privacyPageContent || "");
      setUpdatedAt(new Date().toISOString());
      setLoading(false);
      return;
    }
    if (activeId === "terms") {
      setTitle("Terms and Conditions - الشروط والأحكام");
      setBody(settings.termsPageContent || "");
      setUpdatedAt(new Date().toISOString());
      setLoading(false);
      return;
    }

    // 2. Custom Pages
    const customPage = settings.customPages?.find(p => p.id === activeId || p.slug === activeId);
    if (customPage) {
      setTitle(customPage.title);
      setBody(customPage.content);
      setUpdatedAt(customPage.updatedAt);
      setLoading(false);
      return;
    }

    // 3. Fallback database page
    const fetchFromDb = async () => {
      try {
        const snap = await getDoc(doc(db, "Pages", activeId));
        if (snap.exists()) {
          const data = snap.data() as PageContent;
          setTitle(data.title);
          setBody(data.content);
          setUpdatedAt(data.updatedAt);
        } else {
          setTitle("Page Not Found");
          setBody("The requested custom page could not be located on our news network.");
        }
      } catch (err) {
        console.error("Error loading page:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFromDb();
  }, [activeId, settings]);

  const getPageIcon = () => {
    if (activeId === "about") return <Info className="w-8 h-8 text-indigo-500 animate-pulse" />;
    if (activeId === "privacy") return <Shield className="w-8 h-8 text-indigo-500 animate-pulse" />;
    if (activeId === "terms") return <HelpCircle className="w-8 h-8 text-indigo-500 animate-pulse" />;
    return <FileText className="w-8 h-8 text-indigo-500 animate-pulse" />;
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-xs text-slate-400 font-mono animate-pulse">
        Retrieving Policy Document Frame...
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 py-12 space-y-8"
    >
      <div className="flex items-center gap-3 border-b border-slate-200/60 dark:border-white/5 pb-5">
        {getPageIcon()}
        <div>
          <h1 className="font-display font-black text-2xl text-slate-900 dark:text-white uppercase tracking-tight">{title}</h1>
          <p className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider mt-1">Last synchronized: {new Date(updatedAt).toLocaleDateString()}</p>
        </div>
      </div>
      <div 
        className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm leading-relaxed font-sans font-light"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }}
      />
    </motion.div>
  );
}

// ==========================================
// PRAYER TIMES DEDICATED PAGE
// ==========================================
export function PrayerTimesPage() {
  const { settings } = useSettings();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 py-12 space-y-8"
    >
      {/* Page Header banner */}
      <div className="relative rounded-3xl overflow-hidden p-8 md:p-10 bg-gradient-to-r from-indigo-900 to-slate-950 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 text-center md:text-left relative z-10">
          <span className="text-[10px] font-black tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-full uppercase font-mono">
            PRAYER TIMINGS HUB
          </span>
          <h1 className="text-2xl md:text-3.5xl font-display font-black uppercase leading-none">مواقيت الصلاة الرسمية اليوم</h1>
          <p className="text-xs text-slate-300 leading-relaxed max-w-md font-sans font-light">
            احصل على مواقيت دقيقة لبلدتك المحدثة آلياً مباشرة من مراكز الأرصاد والبحوث الإسلامية.
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs pt-2">
            <span className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold">
              <MapPin className="w-4 h-4" /> {settings.prayerTimesCity || "Dubai"}, {settings.prayerTimesCountry || "UAE"}
            </span>
            <span className="flex items-center gap-1.5 text-slate-300 font-mono">
              <Calendar className="w-4 h-4" /> {new Date().toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
        </div>
        <div className="shrink-0 relative z-10">
          <Compass className="w-24 h-24 text-white/10 animate-spin-slow hidden md:block" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Full-size prayer card system */}
        <div className="md:col-span-2">
          <PrayerTimesWidget styleOverride="Modern Card" />
        </div>

        {/* Informative sidebar */}
        <div className="space-y-6">
          <DateTimeWidget styleOverride="Digital" />

          <div className="p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#080808] shadow-sm space-y-4">
            <h4 className="text-xs font-black font-display text-slate-900 dark:text-white uppercase flex items-center gap-1.5 border-b border-slate-100 dark:border-white/5 pb-2.5 tracking-wider">
              <Volume2 className="w-4 h-4 text-indigo-500" /> تنبيهات الصلاة والأذان
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans font-light">
              يتم تحديث مواقيت الصلاة في هذا القسم آلياً طبقاً للموقع الجغرافي المسجل في إعدادات لوحة التحكم. يمكنك تفعيل أو تعطيل تنبيهات الصلاة وأجهزة الأذان في لوحة الإدارة.
            </p>
            <div className="p-3.5 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-xs">
              <span className="font-bold text-indigo-600 dark:text-indigo-400 block font-sans">طريقة الحساب المعتمدة:</span>
              <span className="text-slate-500 dark:text-slate-400 block mt-1 font-mono text-[10px]">الهيئة العامة المصرية للمساحة (أو طريقة البلد الافتراضية)</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ==========================================
// BOOKMARKS PAGE
// ==========================================
export function BookmarksPage() {
  const { user, updateProfileFields } = useAuth();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user || !user.bookmarks || user.bookmarks.length === 0) {
        setArticles([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "News"));
        const fetched: NewsArticle[] = [];
        snap.forEach((doc) => {
          if (user.bookmarks.includes(doc.id)) {
            fetched.push({ id: doc.id, ...doc.data() } as NewsArticle);
          }
        });
        setArticles(fetched);
      } catch (err) {
        console.error("Error loading bookmarked news:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [user]);

  const removeBookmark = async (articleId: string) => {
    if (!user) return;
    const filtered = (user.bookmarks || []).filter(id => id !== articleId);
    try {
      await updateProfileFields({ bookmarks: filtered });
      setArticles(articles.filter(a => a.id !== articleId));
    } catch (err) {
      console.error("Error removing bookmark:", err);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-display font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight">Bookmark Safehouse</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">Please authenticate using the header log-in portal to synchronize and inspect your personalized bookmarks drawer.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 py-12 space-y-6"
    >
      <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-white/5 pb-4">
        <Bookmark className="w-6 h-6 text-indigo-500 animate-pulse" />
        <h1 className="font-display font-black text-xl text-slate-900 dark:text-white uppercase tracking-tight">Your Bookmarked Articles</h1>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400 font-mono animate-pulse">Synchronizing bookmarks database...</div>
      ) : articles.length > 0 ? (
        <div className="space-y-4">
          {articles.map((art) => (
            <div 
              key={art.id} 
              className="p-4 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#080808] flex flex-col sm:flex-row items-center gap-4 justify-between shadow-2xs hover:border-slate-300 dark:hover:border-white/10 transition-all duration-350"
            >
              <div className="flex items-center gap-4 w-full">
                <img src={art.featuredImage} className="w-16 h-16 rounded-xl overflow-hidden object-cover shrink-0 border border-slate-200/60 dark:border-white/10" alt={art.title} referrerPolicy="no-referrer" />
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-mono font-bold text-indigo-500 tracking-wider block">{art.category}</span>
                  <Link to={`/news/${art.id}`} className="block">
                    <h4 className="text-xs md:text-sm font-display font-black text-slate-900 dark:text-white hover:text-indigo-500 transition-colors line-clamp-2 leading-tight">{art.title}</h4>
                  </Link>
                </div>
              </div>
              <button
                onClick={() => removeBookmark(art.id)}
                className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl hover:text-rose-600 transition-all text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-slate-400 border border-dashed border-slate-200 dark:border-white/5 rounded-3xl bg-slate-50/25 dark:bg-[#080808]/40">
          <Inbox className="w-8 h-8 text-indigo-500/80 mx-auto mb-2" />
          <p className="text-xs font-mono">Your bookmark shelf is currently empty.</p>
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-indigo-500 font-black uppercase tracking-wider font-mono hover:underline mt-4">
            Explore Articles <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </motion.div>
  );
}

// ==========================================
// 404 NOT FOUND PAGE
// ==========================================
export function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-5">
      <h1 className="font-mono text-5xl font-black text-indigo-500 animate-pulse tracking-widest">404</h1>
      <h2 className="font-display font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight">Route frame out of scope</h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto font-sans font-light">
        The requested URL parameter does not resolve to an active news article collection or dashboard node in our portal.
      </p>
      <Link 
        to="/" 
        className="inline-flex items-center gap-1.5 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/25 transition-all uppercase tracking-wider font-mono cursor-pointer"
      >
        <Home className="w-4 h-4" /> Return to Portal
      </Link>
    </div>
  );
}
