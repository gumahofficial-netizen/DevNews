import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { db, collection, getDocs } from "../../services/firebase";
import { useSettings } from "../../components/SettingsContext";
import { NewsArticle, Category } from "../../types";
import { AdRenderer } from "../../components/AdRenderer";
import { LucideIcon } from "../../components/LucideIcon";
import { 
  Calendar, 
  Clock, 
  Eye, 
  ThumbsUp, 
  ArrowLeft, 
  Sparkles,
  Inbox
} from "lucide-react";

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { settings } = useSettings();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const category = settings.categories?.find((c) => c.slug === slug);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "News"));
        const list: NewsArticle[] = [];
        snap.forEach((doc) => {
          const data = doc.data() as NewsArticle;
          if (data.category === slug && data.status === "Published") {
            list.push({ id: doc.id, ...data } as NewsArticle);
          }
        });
        
        // Sort chronological
        list.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
        setArticles(list);
      } catch (err) {
        console.error("Error fetching category news node feeds:", err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchArticles();
    }
  }, [slug]);

  const formatPublishDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center animate-pulse">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-mono mt-4">Streaming Category Node Assets...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 py-6 space-y-8"
    >
      {/* Banner Ad */}
      <AdRenderer position="Category Banner" currentCategory={slug} />

      {/* Header */}
      {category && (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-200/60 dark:border-white/5 pb-5 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl text-white bg-indigo-600 shadow-lg shadow-indigo-600/10 border border-white/10 shrink-0">
              <LucideIcon name={category.icon} className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-black text-2xl md:text-3xl text-slate-900 dark:text-white uppercase tracking-tight">
                {category.name}
              </h1>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-1 font-bold">
                Showing all compiled technical journalistic feeds inside {category.name}
              </p>
            </div>
          </div>
          <Link 
            to="/" 
            className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-400 font-black uppercase tracking-wider font-mono transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Portal
          </Link>
        </div>
      )}

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((art, idx) => (
          <motion.article 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            key={art.id} 
            className="group flex flex-col rounded-2xl overflow-hidden border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#080808] shadow-2xs hover:shadow-lg hover:border-slate-300 dark:hover:border-white/10 transition-all duration-300"
          >
            <Link to={`/news/${art.id}`} className="block overflow-hidden relative aspect-video bg-slate-100 dark:bg-slate-900">
              <img
                src={art.featuredImage}
                alt={art.title}
                className="w-full h-full object-cover group-hover:scale-101 transition-all duration-700 ease-out"
                referrerPolicy="no-referrer"
              />
            </Link>
            <div className="p-5 flex flex-col flex-1 justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 font-mono font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-indigo-500" /> {formatPublishDate(art.publishDate)}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-indigo-500" /> {art.readingTime} min</span>
                </div>
                <Link to={`/news/${art.id}`} className="block">
                  <h4 className="font-display font-black text-sm text-slate-900 dark:text-white line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors leading-snug">
                    {art.title}
                  </h4>
                </Link>
                <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed font-sans font-light">
                  {art.summary}
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-3 text-[10px] font-mono text-slate-400 dark:text-slate-500 font-bold uppercase">
                <span>BY: {art.authorName.split("@")[0]}</span>
                <span className="flex items-center gap-2.5">
                  <span className="flex items-center gap-0.5"><Eye className="w-3.5 h-3.5 text-indigo-500" /> {art.views}</span>
                  <span className="flex items-center gap-0.5"><ThumbsUp className="w-3.5 h-3.5 text-indigo-500" /> {art.likes?.length || 0}</span>
                </span>
              </div>
            </div>
          </motion.article>
        ))}

        {articles.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400 border border-dashed border-slate-200 dark:border-white/5 rounded-2xl bg-slate-50/20 dark:bg-[#080808]/40">
            <Inbox className="w-8 h-8 text-indigo-500/80 mx-auto mb-2 animate-bounce" />
            <p className="text-xs font-mono">No published articles found inside this category currently.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
