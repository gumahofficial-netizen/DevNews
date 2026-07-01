import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeContext";
import { SettingsProvider } from "./components/SettingsContext";
import { FrontendHeader } from "./components/FrontendHeader";
import { FrontendFooter } from "./components/FrontendFooter";
import { Homepage } from "./pages/frontend/Homepage";
import { CategoryPage } from "./pages/frontend/CategoryPage";
import { SearchPage } from "./pages/frontend/SearchPage";
import { NewsArticlePage } from "./pages/frontend/NewsArticlePage";
import { StaticPage, BookmarksPage, NotFoundPage, PrayerTimesPage } from "./pages/frontend/Pages";
import { AdminDashboard } from "./pages/admin/AdminDashboard";

function MainLayout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Conditionally hide public header/footer on admin panels */}
      {!isAdmin && <FrontendHeader />}
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/news/:id" element={<NewsArticlePage />} />
          <Route path="/about" element={<StaticPage pageId="about" />} />
          <Route path="/privacy" element={<StaticPage pageId="privacy" />} />
          <Route path="/terms" element={<StaticPage pageId="terms" />} />
          <Route path="/page/:slug" element={<StaticPage />} />
          <Route path="/prayer-times" element={<PrayerTimesPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {!isAdmin && <FrontendFooter />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <BrowserRouter>
          <MainLayout />
        </BrowserRouter>
      </SettingsProvider>
    </ThemeProvider>
  );
}
