import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { db, collection, getDocs } from "../../services/firebase";
import { NewsArticle, Category } from "../../types";
import { AdRenderer } from "../../components/AdRenderer";
import { 
  Search, 
  Calendar, 
  Clock, 
  ThumbsUp, 
  Eye, 
  Filter, 
  SlidersHorizontal,
  Inbox
} from "lucide-react";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  const [allArticles, setAllArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  // Search Filters
  const [searchText, setSearchText] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSort, setSelectedSort] = useState("newest"); // newest, views, likes
  const [selectedTag, setSelectedTag] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch all published articles
        const artSnap = await getDocs(collection(db, "News"));
        const arts: NewsArticle[] = [];
        artSnap.forEach((doc) => {
          const d = doc.data() as NewsArticle;
          if (d.status === "Published") {
            arts.push({ id: doc.id, ...d } as NewsArticle);
          }
        });
        setAllArticles(arts);

        // Fetch categories
        const catSnap = await getDocs(collection(db, "Categories"));
        const cats: Category[] = [];
        catSnap.forEach((doc) => {
          cats.push(doc.data() as Category);
        });
        setCategories(cats);
      } catch (err) {
        console.error("Error loading search page content:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Set Search Text from Query Param on load
  useEffect(() => {
    setSearchText(queryParam);
  }, [queryParam]);

  // Handle Search Filtering
  useEffect(() => {
    let results = [...allArticles];

    // Filter by text search (title, content, summary, tag, or author)
    if (searchText.trim()) {
      const txt = searchText.toLowerCase().trim();
      results = results.filter(
        (a) =>
          a.title.toLowerCase().includes(txt) ||
          a.content.toLowerCase().includes(txt) ||
          (a.summary && a.summary.toLowerCase().includes(txt)) ||
          a.authorName.toLowerCase().includes(txt) ||
          a.tags.some((t) => t.toLowerCase().includes(txt))
      );
    }

    // Filter by Category
    if (selectedCategory) {
      results = results.filter((a) => a.category === selectedCategory);
    }

    // Filter by Tag
    if (selectedTag) {
      results = results.filter((a) => a.tags.includes(selectedTag));
    }

    // Sorting
    if (selectedSort === "newest") {
      results.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
    } else if (selectedSort === "views") {
      results.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (selectedSort === "likes") {
      results.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
    }

    setFilteredArticles(results);
  }, [allArticles, searchText, selectedCategory, selectedSort, selectedTag]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: searchText.trim() });
  };

  const allTags = Array.from(
    new Set(allArticles.flatMap((a) => a.tags || []))
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 py-8 space-y-8"
    >
      <AdRenderer position="Search Banner" />

      {/* Search Input Box */}
      <div className="p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#080808] shadow-sm space-y-6">
        <div className="space-y-1.5">
          <h1 className="font-display font-black text-xl md:text-2xl text-slate-900 dark:text-white flex items-center gap-2.5 uppercase tracking-tight">
            <Search className="w-6 h-6 text-indigo-500" /> Advanced Search Desk
          </h1>
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">Query the full text index, category nodes, or authors in real-time</p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2.5">
          <input
            type="text"
            placeholder="Type search terms (e.g. React 19, Google, quantum)..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full text-xs p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-black focus:border-indigo-500 outline-none transition-all font-mono"
          />
          <button
            type="submit"
            className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest shrink-0 transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            Find Articles
          </button>
        </form>

        {/* Filter Selection Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 border-t border-slate-100 dark:border-white/5 pt-5 text-xs">
          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" /> Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/35 text-slate-700 dark:text-slate-300 outline-none font-mono cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Sort Order
            </label>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="w-full text-xs p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/35 text-slate-700 dark:text-slate-300 outline-none font-mono cursor-pointer"
            >
              <option value="newest">Newest Updates</option>
              <option value="views">Most Viewed</option>
              <option value="likes">Most Liked</option>
            </select>
          </div>

          {/* Popular Tags */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" /> Tags
            </label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full text-xs p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/35 text-slate-700 dark:text-slate-300 outline-none font-mono cursor-pointer"
            >
              <option value="">All Tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>#{tag}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results grid */}
      <div className="space-y-4">
        <h2 className="font-display font-black text-xs uppercase text-slate-400 tracking-wider font-mono">
          Search Results ({filteredArticles.length})
        </h2>

        {loading ? (
          <div className="py-20 text-center text-slate-400 font-mono text-xs">Searching archive databases...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((art, idx) => (
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
                    className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-700 ease-out"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-3.5 left-3.5 bg-black/80 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border border-white/5">
                    {art.category}
                  </span>
                </Link>
                <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 font-mono font-bold uppercase tracking-wider">
                      <span>{new Date(art.publishDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      <span>•</span>
                      <span>{art.readingTime} min</span>
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
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-3.5 text-[10px] font-mono text-slate-400 dark:text-slate-500 font-bold uppercase">
                    <span>By: {art.authorName.split("@")[0]}</span>
                    <span className="flex items-center gap-2.5">
                      <span className="flex items-center gap-0.5"><Eye className="w-3.5 h-3.5 text-indigo-500" /> {art.views}</span>
                      <span className="flex items-center gap-0.5"><ThumbsUp className="w-3.5 h-3.5 text-indigo-500" /> {art.likes?.length || 0}</span>
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}

            {filteredArticles.length === 0 && (
              <div className="col-span-full py-16 text-center text-slate-400 border border-dashed border-slate-200 dark:border-white/5 rounded-2xl bg-slate-50/25 dark:bg-[#080808]/40">
                <Inbox className="w-8 h-8 text-indigo-500/80 mx-auto mb-2 animate-bounce" />
                <p className="text-xs font-mono">No matching articles found inside this search filter parameters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
