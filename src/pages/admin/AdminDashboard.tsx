import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { 
  AdminOverview, 
  AdminNewsManager, 
  AdminCategoryManager, 
  AdminAdManager, 
  AdminCommentsManager, 
  AdminSettingsManager,
  AdminRssImporter
} from "./AdminPanels";
import { 
  LayoutDashboard, 
  FileText, 
  FolderEdit, 
  Megaphone, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Globe, 
  Lock, 
  UserCheck, 
  UserX,
  Menu,
  X,
  Rss
} from "lucide-react";

export function AdminDashboard() {
  const { user, logout, loginWithEmail, registerWithEmail } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<"overview" | "news" | "categories" | "ads" | "comments" | "settings" | "rss">("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Pre-configured staff credentials for the admin dashboard
  const [testEmail, setTestEmail] = useState("admin@gumah.com");
  const [testPassword, setTestPassword] = useState("heba2006");
  const [testName, setTestName] = useState("Admin Supervisor");
  const [testError, setTestError] = useState("");
  const [testSuccess, setTestSuccess] = useState("");

  const handleTestLogin = async (e: React.FormEvent, type: "login" | "signup") => {
    e.preventDefault();
    setTestError("");
    setTestSuccess("");
    try {
      if (type === "signup") {
        await registerWithEmail(testEmail, testPassword, testName, "Admin");
        setTestSuccess("Administrative Account created! Refreshing...");
      } else {
        await loginWithEmail(testEmail, testPassword);
        setTestSuccess("Administrative access authorized! Redirecting...");
      }
    } catch (err: any) {
      setTestError(err.message || "Credential verification failed.");
    }
  };

  // Role Access Guard: Users must have Admin, Editor, or Writer roles
  const hasAccess = user && (user.role === "Admin" || user.role === "Editor" || user.role === "Writer");

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0a0a0a] rounded-2xl border border-white/10 p-8 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mx-auto text-3xl">
            <Lock className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h1 className="font-sans font-black text-xl text-white uppercase tracking-wider">لوحة التحكم مقفلة</h1>
            <h2 className="font-sans font-bold text-sm text-gray-300">Administrative Portal Locked</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              هذه اللوحة مخصصة للمشرفين المعتمدين فقط. الرجاء استخدام البريد الإلكتروني وكلمة السر المعتمدة لتسجيل الدخول.
            </p>
          </div>

          <form className="bg-black/40 p-5 rounded-xl border border-white/5 text-left space-y-4">
            <h3 className="text-xs font-bold text-blue-500 font-mono uppercase tracking-wider text-center">بوابة تسجيل الدخول الآمنة</h3>
            {testError && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded text-center">
                <p className="text-[10px] text-rose-400 font-medium">{testError}</p>
              </div>
            )}
            {testSuccess && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-center">
                <p className="text-[10px] text-emerald-400 font-medium">{testSuccess}</p>
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 font-mono uppercase tracking-wider">البريد الإلكتروني / Email</label>
              <input 
                type="email" 
                value={testEmail} 
                onChange={(e) => setTestEmail(e.target.value)}
                dir="ltr"
                className="w-full text-xs p-2.5 rounded bg-[#050505] border border-white/10 text-white outline-none focus:border-blue-500 transition-colors" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 font-mono uppercase tracking-wider">كلمة السر / Password</label>
              <input 
                type="password" 
                value={testPassword} 
                onChange={(e) => setTestPassword(e.target.value)}
                dir="ltr"
                className="w-full text-xs p-2.5 rounded bg-[#050505] border border-white/10 text-white outline-none focus:border-blue-500 transition-colors" 
              />
            </div>

            <div className="flex flex-col gap-2 pt-1.5">
              <button 
                type="button" 
                onClick={(e) => handleTestLogin(e, "login")}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)]"
              >
                تسجيل الدخول كمشرف | Log In As Admin
              </button>
              
              <button 
                type="button" 
                onClick={(e) => handleTestLogin(e, "signup")}
                className="w-full py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-medium text-[10px] rounded transition-all"
              >
                إنشاء حساب جديد كمسؤول | Register New Admin
              </button>
            </div>
          </form>

          <div className="border-t border-white/5 pt-4">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:underline">
              <Globe className="w-4 h-4" /> العودة للموقع الرئيسي | Return to Public Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "overview": return <AdminOverview />;
      case "news": return <AdminNewsManager />;
      case "rss": return <AdminRssImporter />;
      case "categories": return <AdminCategoryManager />;
      case "ads": return <AdminAdManager />;
      case "comments": return <AdminCommentsManager />;
      case "settings": return <AdminSettingsManager />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* 1. Dashboard Sidebar */}
      <aside className={`w-full md:w-64 bg-slate-900 border-r border-slate-800 shrink-0 md:flex flex-col justify-between ${mobileMenuOpen ? "block" : "hidden md:flex"}`}>
        <div>
          {/* Sidebar Brand Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black">
                D
              </div>
              <div>
                <span className="font-sans font-extrabold text-sm text-white">DevNews Pro</span>
                <p className="text-[8px] font-mono tracking-widest text-slate-500 uppercase">Control Tower</p>
              </div>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 rounded bg-slate-800 text-slate-400 md:hidden hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => { setActiveTab("overview"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "overview" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-4.5 h-4.5" /> Overview & Metrics
            </button>

            <button
              onClick={() => { setActiveTab("news"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "news" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <FileText className="w-4.5 h-4.5" /> News Articles
            </button>

            <button
              onClick={() => { setActiveTab("rss"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "rss" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <Rss className="w-4.5 h-4.5" /> RSS Ingestion
            </button>

            <button
              onClick={() => { setActiveTab("categories"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "categories" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <FolderEdit className="w-4.5 h-4.5" /> Categories
            </button>

            <button
              onClick={() => { setActiveTab("ads"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "ads" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <Megaphone className="w-4.5 h-4.5" /> Ads Manager
            </button>

            <button
              onClick={() => { setActiveTab("comments"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "comments" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <MessageSquare className="w-4.5 h-4.5" /> Comment Mod
            </button>

            <button
              onClick={() => { setActiveTab("settings"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "settings" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <Settings className="w-4.5 h-4.5" /> Settings
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-950/30 rounded-xl border border-slate-800/40">
            <div className="w-8 h-8 rounded bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold font-sans text-xs">
              {user.displayName.charAt(0)}
            </div>
            <div className="truncate">
              <span className="text-[11px] font-bold block text-white">{user.displayName}</span>
              <span className="text-[9px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded font-semibold uppercase">{user.role}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] uppercase text-center rounded-lg transition-colors border border-slate-700/50"
            >
              Public Site
            </Link>
            <button
              onClick={logout}
              className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg transition-all"
              title="Log Out"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Top Header Mobile Navigation */}
      <header className="md:hidden p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm">
            D
          </div>
          <span className="font-sans font-bold text-sm text-white">DevNews Admin</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded bg-slate-800 text-slate-300"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* 3. Main Dynamic Panel Area */}
      <section className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-950">
        {renderContent()}
      </section>
    </div>
  );
}
