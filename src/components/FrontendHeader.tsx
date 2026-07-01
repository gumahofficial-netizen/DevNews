import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "./ThemeContext";
import { useSettings } from "./SettingsContext";
import { useAuth } from "../hooks/useAuth";
import { LucideIcon } from "./LucideIcon";
import { Category, BreakingNews } from "../types";
import { db, collection, getDocs } from "../services/firebase";
import { DateTimeWidget, WeatherWidget, PrayerTimesWidget } from "./Widgets";
import { 
  Sun, 
  Moon, 
  Search, 
  LogIn, 
  LogOut, 
  Bookmark, 
  X,
  UserCheck,
  TrendingUp,
  Cpu,
  Mail,
  Lock,
  User
} from "lucide-react";

export function FrontendHeader() {
  const { theme, toggleTheme } = useTheme();
  const { settings } = useSettings();
  const { user, logout, loginWithEmail, registerWithEmail, resetPassword } = useAuth();
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [breakingNews, setBreakingNews] = useState<BreakingNews[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  // Auth Form State
  const [isSignUp, setIsSignUp] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [forgotPasswordActive, setForgotPasswordActive] = useState(false);

  useEffect(() => {
    // Fetch Categories
    const fetchCats = async () => {
      try {
        const snap = await getDocs(collection(db, "Categories"));
        const fetched: Category[] = [];
        snap.forEach((doc) => {
          fetched.push(doc.data() as Category);
        });
        fetched.sort((a, b) => a.sortOrder - b.sortOrder);
        setCategories(fetched);
      } catch (err) {
        console.error("Error fetching categories for header:", err);
      }
    };

    // Fetch Breaking News
    const fetchBreaking = async () => {
      try {
        const snap = await getDocs(collection(db, "BreakingNews"));
        const fetched: BreakingNews[] = [];
        snap.forEach((doc) => {
          const d = doc.data() as BreakingNews;
          if (d.active) fetched.push(d);
        });
        setBreakingNews(fetched);
      } catch (err) {
        console.error("Error fetching breaking news:", err);
      }
    };

    fetchCats();
    fetchBreaking();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    try {
      if (forgotPasswordActive) {
        await resetPassword(authEmail);
        setAuthSuccess("Password reset instructions have been sent to your email!");
        return;
      }

      if (isSignUp) {
        await registerWithEmail(authEmail, authPassword, authName, "User");
        setAuthSuccess("Account registered successfully!");
        setTimeout(() => setAuthModalOpen(false), 1500);
      } else {
        await loginWithEmail(authEmail, authPassword);
        setAuthSuccess("Logged in successfully!");
        setTimeout(() => setAuthModalOpen(false), 1500);
      }
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed. Please verify credentials.");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-white/5 bg-white/80 dark:bg-black/75 backdrop-blur-md">
      {/* 0. Top Info Strip (DateTime, Weather in Header, Prayer in Header) */}
      {(settings.dateTimeEnabled || (settings.weatherEnabled && settings.weatherPosition === "Header") || (settings.prayerTimesEnabled && settings.prayerTimesHeaderWidget)) && (
        <div className="bg-slate-50/50 dark:bg-black/30 border-b border-slate-200/40 dark:border-white/5 py-2 px-4 md:px-6 text-[11px] text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
            {settings.dateTimeEnabled && (
              <DateTimeWidget styleOverride="Minimal" />
            )}
            {settings.weatherEnabled && settings.weatherPosition === "Header" && (
              <div className="sm:border-l sm:border-slate-200/50 dark:sm:border-white/10 sm:pl-4">
                <WeatherWidget />
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {settings.prayerTimesEnabled && settings.prayerTimesHeaderWidget && (
              <div className="flex items-center gap-2 bg-emerald-500/10 dark:bg-emerald-500/5 px-2.5 py-0.5 rounded-full border border-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></span>
                <PrayerTimesWidget styleOverride="Minimal" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 1. Breaking News Bar */}
      {breakingNews.length > 0 && (
        <div className="bg-indigo-600/5 border-b border-indigo-500/10 py-2 px-6 flex items-center gap-4 overflow-hidden">
          <span className="bg-indigo-600 dark:bg-indigo-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded uppercase tracking-widest shrink-0 select-none shadow-xs font-mono">
            Breaking news
          </span>
          <div className="relative flex-1 overflow-hidden h-4">
            <div className="absolute flex gap-16 whitespace-nowrap animate-marquee">
              {breakingNews.map((news) => (
                <Link 
                  key={news.id} 
                  to={news.url || "#"} 
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold text-xs text-slate-700 dark:text-slate-200 transition-colors font-display"
                >
                  {news.title}
                </Link>
              ))}
            </div>
          </div>
          <div className="ml-auto hidden lg:flex items-center gap-4 text-[10px] font-mono text-slate-400 dark:text-slate-500 shrink-0">
            <span className="bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded">BTC +4.2%</span>
            <span className="bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded">ETH +2.1%</span>
            <span className="bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded">$DEV -0.4%</span>
          </div>
        </div>
      )}

      {/* 2. Main Navigation Controls */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          {settings.logo ? (
            <img src={settings.logo} className="h-8 max-w-[150px] object-contain shrink-0" alt={settings.websiteName} referrerPolicy="no-referrer" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-md border border-white/10 shrink-0">
              {settings.websiteName ? settings.websiteName.charAt(0).toUpperCase() : "D"}
            </div>
          )}
          <div>
            <span className="font-display font-black text-base tracking-tight text-slate-900 dark:text-white uppercase block leading-none">
              {settings.websiteName || "DEV NEWS PRO"}
            </span>
            <p className="text-[8px] uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 font-black mt-1">Architecting Information</p>
          </div>
        </Link>

        {/* Live Search */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Search premium tech reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-white/5 text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-[#030303] transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
        </form>

        {/* Action Toggles */}
        <div className="flex items-center gap-2">
          {/* Theme toggler */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Bookmarks */}
          {user && (
            <Link
              to="/bookmarks"
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 relative transition-colors"
              aria-label="Bookmarks"
            >
              <Bookmark className="w-4 h-4" />
              {user.bookmarks?.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-indigo-600 text-white font-mono font-bold text-[8px] w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs">
                  {user.bookmarks.length}
                </span>
              )}
            </Link>
          )}

          {/* Admin panel redirect */}
          {user && (user.role === "Admin" || user.role === "Editor" || user.role === "Writer") && (
            <Link
              to="/admin"
              className="hidden sm:flex items-center gap-2 bg-indigo-500/10 dark:bg-indigo-500/5 border border-indigo-500/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/15 transition-all"
            >
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
              <span>ADMIN TOWER</span>
            </Link>
          )}

          {/* Auth Trigger */}
          {user ? (
            <div className="flex items-center gap-3 pl-1">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-black text-slate-800 dark:text-slate-200">{user.displayName}</p>
                <span className="text-[9px] bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/15 text-slate-500 dark:text-slate-400 px-2 py-0.2 rounded-md font-bold tracking-wider font-mono uppercase">{user.role}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center justify-center p-2.5 rounded-xl hover:bg-rose-500/10 text-slate-600 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 transition-all cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/10 hover:shadow-indigo-500/25 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" /> Log In
            </button>
          )}
        </div>
      </div>

      {/* 3. Category Bar */}
      <div className="border-t border-slate-200/40 dark:border-white/5 bg-slate-50/40 dark:bg-[#020202]/55 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto flex items-center gap-1.5 h-11 scrollbar-none">
          <Link
            to="/"
            className="px-3.5 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all shrink-0 font-display"
          >
            Home
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all shrink-0 font-display"
            >
              <LucideIcon name={cat.icon} className="w-3.5 h-3.5 text-indigo-500" />
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* ==========================================
          AUTH MODAL WITH MOTION
         ========================================== */}
      <AnimatePresence>
        {authModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAuthModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            ></motion.div>

            {/* Dialog Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-[#080808] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-black text-slate-900 dark:text-white">
                    {forgotPasswordActive ? "Reset Credentials" : isSignUp ? "Create Account" : "Access Dev News Pro"}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Authorizing premium network credentials</p>
                </div>
                <button
                  onClick={() => setAuthModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body / Form */}
              <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
                {authError && (
                  <div className="p-3 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/50 rounded-xl font-mono">
                    {authError}
                  </div>
                )}
                {authSuccess && (
                  <div className="p-3 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/50 rounded-xl font-mono">
                    {authSuccess}
                  </div>
                )}

                {isSignUp && !forgotPasswordActive && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-indigo-500" /> Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="Sarah Jenkins"
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-[#030303] outline-none"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-indigo-500" /> Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-[#030303] outline-none"
                  />
                </div>

                {!forgotPasswordActive && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-indigo-500" /> Password
                    </label>
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-[#030303] outline-none"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {forgotPasswordActive ? "Send Reset Email" : isSignUp ? "Register Account" : "Authorize Session"}
                </button>

                <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex flex-col gap-2 text-center text-xs text-slate-500">
                  {!forgotPasswordActive && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setAuthError("");
                      }}
                      className="hover:underline text-indigo-500 dark:text-indigo-400 font-bold"
                    >
                      {isSignUp ? "Already have an account? Sign In" : "New member? Create free account"}
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => {
                      setForgotPasswordActive(!forgotPasswordActive);
                      setAuthError("");
                    }}
                    className="hover:underline text-indigo-500/70 dark:text-indigo-400/70 font-medium"
                  >
                    {forgotPasswordActive ? "Back to credentials login" : "Recover forgotten password"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
