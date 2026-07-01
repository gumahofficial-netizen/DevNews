import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { db, collection, getDocs } from "../../services/firebase";
import { NewsArticle, Category } from "../../types";
import { AdRenderer } from "../../components/AdRenderer";
import { useSettings } from "../../components/SettingsContext";
import { WeatherWidget, StocksWidget, CurrencyWidget, DateTimeWidget, PrayerTimesWidget } from "../../components/Widgets";
import { LucideIcon } from "../../components/LucideIcon";
import { 
  Eye, 
  ThumbsUp, 
  Calendar, 
  Clock, 
  Play, 
  ChevronRight, 
  TrendingUp, 
  Zap,
  Image,
  Volume2,
  Sparkles,
  Award,
  ArrowRight
} from "lucide-react";

const IMAGES = {
  react: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=600",
  ai: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=600",
  quantum: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600"
};

export function Homepage() {
  const { settings } = useSettings();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Podcast state
  const [playingPodcastId, setPlayingPodcastId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch articles
        const artSnap = await getDocs(collection(db, "News"));
        const arts: NewsArticle[] = [];
        artSnap.forEach((doc) => {
          const d = doc.data() as NewsArticle;
          if (d.status === "Published") {
            arts.push({ id: doc.id, ...d } as NewsArticle);
          }
        });

        // Sort by publish date descending
        arts.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
        setArticles(arts);

        // Fetch categories
        const catSnap = await getDocs(collection(db, "Categories"));
        const cats: Category[] = [];
        catSnap.forEach((doc) => {
          cats.push(doc.data() as Category);
        });
        cats.sort((a, b) => a.sortOrder - b.sortOrder);
        setCategories(cats);
      } catch (err) {
        console.error("Error loading homepage news:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Premium skeleton loader mockup
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-pulse">
        <div className="h-28 skeleton-loader rounded-2xl w-full"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="aspect-video skeleton-loader rounded-2xl w-full"></div>
            <div className="h-6 skeleton-loader rounded w-3/4"></div>
            <div className="h-4 skeleton-loader rounded w-1/2"></div>
          </div>
          <div className="space-y-4">
            <div className="h-5 skeleton-loader rounded w-1/3"></div>
            <div className="h-24 skeleton-loader rounded-xl w-full"></div>
            <div className="h-24 skeleton-loader rounded-xl w-full"></div>
            <div className="h-24 skeleton-loader rounded-xl w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  // Segment articles for premium portal bento layout
  const featuredArticle = articles.find(a => a.isFeatured) || articles[0];
  const editorsChoice = articles.filter(a => a.isEditorsChoice && a.id !== featuredArticle?.id).slice(0, 3);
  const latestArticles = articles.filter(a => a.id !== featuredArticle?.id).slice(0, 6);
  const trendingArticles = articles.filter(a => a.isTrending).slice(0, 5);

  const formatPublishDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <motion.main 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-7xl mx-auto px-4 py-6 space-y-10"
    >
      {/* 1. Header Banner Advertisement Placements */}
      <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/20 p-1">
        <AdRenderer position="Header" />
      </div>

      {/* 2. Top Portal Ticker & Sub-Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="bg-amber-500/10 text-amber-500 p-1.5 rounded-lg">
            <Zap className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="font-display font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white block">
              DEVELOPER INTELLIGENCE REPORT
            </span>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">Real-time technical broadcast & telemetry systems</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 dark:text-slate-500 bg-white dark:bg-[#0a0a0a] border border-slate-200/60 dark:border-white/5 px-3 py-1.5 rounded-full shadow-2xs">
          <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
          <span>FEED OK</span>
          <span className="text-slate-300 dark:text-white/10">|</span>
          <span>UTC: {new Date().toISOString().substring(11, 16)}</span>
        </div>
      </div>

      {/* 3. Hero & Editors Choice Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Large Featured Hero Article */}
        {featuredArticle && (
          <div className="lg:col-span-2 relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-[#080808] shadow-sm hover:shadow-xl transition-all duration-300">
            <Link to={`/news/${featuredArticle.id}`} className="block">
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={featuredArticle.featuredImage}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                {/* Category badge */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-indigo-600 text-white font-extrabold text-[9px] uppercase tracking-widest px-3 py-1 rounded-md shadow-lg flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" /> Featured Article
                  </span>
                  <span className="bg-slate-900/90 backdrop-blur-md text-slate-200 font-mono text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-md">
                    {featuredArticle.category}
                  </span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white space-y-3">
                <div className="flex items-center gap-4 text-[10px] text-slate-300 font-mono">
                  <span className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded"><Calendar className="w-3 h-3" /> {formatPublishDate(featuredArticle.publishDate)}</span>
                  <span className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded"><Clock className="w-3 h-3" /> {featuredArticle.readingTime} min read</span>
                </div>
                <h1 className="text-xl md:text-3xl font-display font-black leading-tight text-white group-hover:text-indigo-300 transition-colors drop-shadow-md">
                  {featuredArticle.title}
                </h1>
                <p className="text-slate-300 text-xs md:text-sm line-clamp-2 max-w-2xl leading-relaxed font-sans font-light">
                  {featuredArticle.summary}
                </p>
              </div>
            </Link>
          </div>
        )}

        {/* Editor's Choice Side Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2">
            <h3 className="font-display font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-500 animate-pulse" /> Editor's Choice
            </h3>
            <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-mono font-bold tracking-widest uppercase">Verified</span>
          </div>

          <div className="space-y-4">
            {editorsChoice.map((art) => (
              <div 
                key={art.id} 
                className="flex gap-4 p-3 rounded-xl hover:bg-white dark:hover:bg-[#0f0f0f] border border-transparent hover:border-slate-200/60 dark:hover:border-white/5 hover:shadow-sm transition-all duration-300"
              >
                <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-white/5 relative group-hover:opacity-90">
                  <img
                    src={art.featuredImage}
                    alt={art.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-1.5 self-center flex-1 min-w-0">
                  <span className="text-[9px] uppercase tracking-widest font-black text-indigo-600 dark:text-indigo-400 block font-mono">
                    {art.category}
                  </span>
                  <Link to={`/news/${art.id}`} className="block">
                    <h4 className="text-xs font-bold leading-snug text-slate-800 dark:text-slate-200 line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-display">
                      {art.title}
                    </h4>
                  </Link>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="truncate">{art.authorName}</span>
                    <span className="shrink-0">{art.readingTime} min</span>
                  </div>
                </div>
              </div>
            ))}
            {editorsChoice.length === 0 && (
              <p className="text-xs text-slate-400 py-6 text-center font-mono border border-dashed border-slate-100 dark:border-white/5 rounded-xl">No picks matching conditions currently.</p>
            )}
          </div>
        </div>
      </div>

      {/* 4. Latest News, Sidebars, Widgets & Sponsored Ads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2">
            <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-500" /> Latest Technical Reports
            </h3>
            <span className="text-xs text-indigo-500 font-bold flex items-center gap-0.5 hover:underline cursor-pointer">
              Browse Portal <ArrowRight className="w-4 h-4" />
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {latestArticles.map((art) => (
              <article 
                key={art.id} 
                className="group flex flex-col rounded-2xl overflow-hidden border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#080808] shadow-xs hover:shadow-lg transition-all duration-300"
              >
                <Link to={`/news/${art.id}`} className="block overflow-hidden relative aspect-video">
                  <img
                    src={art.featuredImage}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md">
                    {art.category}
                  </span>
                </Link>
                <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatPublishDate(art.publishDate)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {art.readingTime} min</span>
                    </div>
                    <Link to={`/news/${art.id}`} className="block">
                      <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        {art.title}
                      </h4>
                    </Link>
                    <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed">
                      {art.summary}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-3.5 text-[10px] font-mono text-slate-400">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Contributor: {art.authorName}</span>
                    <span className="flex items-center gap-3">
                      <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {art.views}</span>
                      <span className="flex items-center gap-0.5"><ThumbsUp className="w-3 h-3" /> {art.likes?.length || 0}</span>
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/20 p-1">
            <AdRenderer position="Inside Article" />
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Widgets Hub */}
          <div className="space-y-4">
            {settings.dateTimeEnabled && settings.dateTimeStyle !== "Minimal" && (
              <DateTimeWidget />
            )}
            {settings.weatherEnabled && settings.weatherPosition === "Sidebar" && (
              <WeatherWidget />
            )}
            {settings.prayerTimesEnabled && settings.prayerTimesSidebarWidget && (
              <PrayerTimesWidget styleOverride="Modern Card" />
            )}
            <StocksWidget />
            <CurrencyWidget />
          </div>

          {/* Sidebar Advertisement */}
          <div className="rounded-xl overflow-hidden shadow-xs border border-slate-100 dark:border-white/5 p-0.5 bg-white dark:bg-black/20">
            <AdRenderer position="Sidebar" />
          </div>

          {/* Trending Panel */}
          <div className="p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#080808] shadow-sm space-y-4">
            <h3 className="font-display font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200/50 dark:border-white/5 pb-2.5">
              <TrendingUp className="w-4 h-4 text-rose-500" /> Hot Trending News
            </h3>
            <div className="space-y-4">
              {trendingArticles.map((art, idx) => (
                <div key={art.id} className="flex gap-4 items-start group">
                  <span className="font-mono text-3xl font-black text-indigo-500/20 group-hover:text-indigo-500 transition-colors w-8 shrink-0 block leading-none">
                    {idx + 1}
                  </span>
                  <div className="space-y-1">
                    <Link to={`/news/${art.id}`} className="block">
                      <h4 className="text-xs font-bold leading-snug text-slate-800 dark:text-slate-200 line-clamp-2 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                        {art.title}
                      </h4>
                    </Link>
                    <span className="text-[9px] uppercase font-mono font-bold text-slate-400 dark:text-slate-500">Telemetry Views: {art.views}</span>
                  </div>
                </div>
              ))}
              {trendingArticles.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4 font-mono">No trending data registered.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Audio Podcast Section (Simulation / Interactive) */}
      <div className="p-8 rounded-2xl border border-indigo-200/30 dark:border-white/5 bg-gradient-to-r from-indigo-50/60 via-purple-50/20 to-slate-50 dark:from-[#0a0a0d] dark:to-[#050508] flex flex-col md:flex-row items-center justify-between gap-8 shadow-xs relative overflow-hidden">
        {/* Subtle decorative grid in bg */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>
        <div className="space-y-3 max-w-xl text-center md:text-left relative z-10">
          <span className="bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-extrabold text-[9px] uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-500/10 font-mono inline-block">
            Podcast Channel
          </span>
          <h2 className="font-display font-black text-xl md:text-2xl text-slate-900 dark:text-white leading-tight">
            Dev Chronicles Weekly: The Software Architect
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
            In this episode we sit down with industry leaders to discuss scaling full-stack React systems, deploying Firebase security rules, and optimizing high-performance edge servers.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-[#0c0c0c] p-4 rounded-2xl shadow-md border border-slate-200/60 dark:border-white/10 w-full max-w-xs shrink-0 justify-between relative z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setPlayingPodcastId(playingPodcastId ? null : "pod_1")}
              className="w-11 h-11 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              {playingPodcastId === "pod_1" ? (
                <span className="flex items-end gap-1 h-5">
                  <span className="w-1.5 bg-white rounded animate-sound-bar-1"></span>
                  <span className="w-1.5 bg-white rounded animate-sound-bar-2"></span>
                  <span className="w-1.5 bg-white rounded animate-sound-bar-3"></span>
                </span>
              ) : (
                <Play className="w-5 h-5 ml-1 fill-current" />
              )}
            </button>
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white">Episode #45</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Scaling Edge Servers</p>
            </div>
          </div>
          <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded">14:24</span>
        </div>
      </div>

      {/* 6. Video News Hub & Photo Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Embedded / YouTube Video Spot */}
        <div className="space-y-4">
          <h3 className="font-display font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-white/5 pb-2.5">
            <Play className="w-4 h-4 text-indigo-500" /> Dynamic Video Center
          </h3>
          <div className="relative rounded-2xl overflow-hidden aspect-video border border-slate-200/60 dark:border-white/10 shadow-lg bg-slate-950 flex items-center justify-center">
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/8pDqJVdNa44?si=e2T4PZ773b-e069t" 
              title="YouTube video player" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
            ></iframe>
          </div>
        </div>

        {/* Photo Gallery Grid */}
        <div className="space-y-4">
          <h3 className="font-display font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-white/5 pb-2.5">
            <Image className="w-4 h-4 text-indigo-500" /> Photo Gallery Grid
          </h3>
          <div className="grid grid-cols-2 gap-4 h-[250px]">
            <div className="relative group rounded-2xl overflow-hidden border border-slate-200/60 dark:border-white/5 shadow-xs">
              <img 
                src={IMAGES.react} 
                alt="Web development layout" 
                className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-md text-white text-[9px] px-2.5 py-1 rounded font-mono font-bold tracking-widest">React Core</span>
            </div>
            <div className="grid grid-rows-2 gap-4">
              <div className="relative group rounded-xl overflow-hidden border border-slate-200/60 dark:border-white/5 shadow-xs">
                <img 
                  src={IMAGES.ai} 
                  alt="Quantum nodes" 
                  className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-2.5 left-2.5 bg-slate-950/85 backdrop-blur-md text-white text-[9px] px-2.5 py-1 rounded font-mono font-bold tracking-widest">Quantum Lab</span>
              </div>
              <div className="relative group rounded-xl overflow-hidden border border-slate-200/60 dark:border-white/5 shadow-xs">
                <img 
                  src={IMAGES.quantum} 
                  alt="Microchips tech" 
                  className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-2.5 left-2.5 bg-slate-950/85 backdrop-blur-md text-white text-[9px] px-2.5 py-1 rounded font-mono font-bold tracking-widest">Microchips</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.main>
  );
}
