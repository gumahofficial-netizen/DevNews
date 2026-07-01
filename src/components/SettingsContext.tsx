import React, { createContext, useContext, useEffect, useState } from "react";
import { db, doc, getDoc, setDoc, onSnapshot } from "../services/firebase";
import { WebSettings } from "../types";

interface SettingsContextType {
  settings: WebSettings;
  loading: boolean;
  updateSettings: (newSettings: Partial<WebSettings>) => Promise<void>;
}

const DEFAULT_SETTINGS: WebSettings = {
  websiteName: "Dev News Pro",
  logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150",
  favicon: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=32",
  theme: "Dark",
  socialLinks: {
    facebook: "https://facebook.com/devnewspro",
    twitter: "https://twitter.com/devnewspro",
    linkedin: "https://linkedin.com/company/devnewspro",
    github: "https://github.com/devnewspro",
    youtube: "https://youtube.com/devnewspro",
    instagram: "https://instagram.com/devnewspro",
    whatsapp: "https://wa.me/971501234567"
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

  // Extra brand details
  footerContent: "The premium developer-focused news website providing the absolute truth on software systems, quantum computation, internet models, and cloud-native practices.",
  footerCopyrightText: "© 2026 DEV NEWS PRO INC. ALL RIGHTS RESERVED.",
  contactEmail: "contact@devnewspro.com",
  contactPhone: "+971 4 123 4567",
  whatsappNumber: "+971 50 123 4567",
  aboutPageContent: `## Who We Are\n\nDev News Pro is a premium tech publication focused on providing high-quality, comprehensive, and up-to-date insights into the world of software development, engineering best practices, artificial intelligence, and quantum sciences.\n\nWe strive to keep developers, technology leaders, and tech enthusiasts informed about trends that shape the global tech workspace. Our core focus spans React development, cloud architectures, advanced AI model training, and web performance optimization.`,
  privacyPageContent: `## Privacy Policy\n\nAt Dev News Pro, we value your privacy. This privacy policy describes what personal data we collect, how we store and process it, and what rights you have under GDPR, CCPA, and general security directives.\n\n### 1. Data Collection\nWe only collect user information such as email addresses for our newsletter sublist and active user accounts to provide bookmarks, personalized history tracker tools, and custom commenting layouts.`,
  termsPageContent: `## Terms and Conditions\n\nWelcome to Dev News Pro. By accessing or using our premium news platform, you agree to comply with and be bound by these Terms of Service. Please review them carefully. Any content generated or posted inside comments sections remains the user's responsibility, and is subject to active admin moderation and spam filtration.`,
  customPages: [],
  websiteColors: {
    primary: "indigo-600",
    secondary: "slate-800",
    accent: "blue-500",
    bgLight: "slate-50",
    bgDark: "slate-950"
  },

  // Weather Settings
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

  // Date & Time System
  dateTimeEnabled: true,
  dateTimeShowTime: true,
  dateTimeShowDate: true,
  dateTimeShowGregorian: true,
  dateTimeShowHijri: true,
  dateTimeStyle: "Standard",

  // Prayer Times System
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

  // Footer Builder
  footerSections: [
    {
      id: "nav",
      title: "Navigation",
      sortOrder: 1,
      links: [
        { title: "Home Portal", url: "/" },
        { title: "Advanced Search", url: "/search" },
        { title: "About Us", url: "/about" },
        { title: "Admin Panel", url: "/admin" }
      ]
    },
    {
      id: "legal",
      title: "Legal Policies",
      sortOrder: 2,
      links: [
        { title: "Privacy Policy", url: "/privacy" },
        { title: "Terms of Service", url: "/terms" }
      ]
    }
  ]
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<WebSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up a real-time listener on Settings / general
    const docRef = doc(db, "Settings", "general");
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          // Merge defaults to handle cases where some fields are missing from legacy data
          setSettings({
            ...DEFAULT_SETTINGS,
            ...data,
            socialLinks: {
              ...DEFAULT_SETTINGS.socialLinks,
              ...(data.socialLinks || {})
            },
            seo: {
              ...DEFAULT_SETTINGS.seo,
              ...(data.seo || {})
            },
            emailSettings: {
              ...DEFAULT_SETTINGS.emailSettings,
              ...(data.emailSettings || {})
            },
            cloudinarySettings: {
              ...DEFAULT_SETTINGS.cloudinarySettings,
              ...(data.cloudinarySettings || {})
            }
          });
        } else {
          // If the document doesn't exist, create it with the defaults
          setDoc(docRef, DEFAULT_SETTINGS).catch((err) =>
            console.error("Error creating default settings:", err)
          );
          setSettings(DEFAULT_SETTINGS);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to settings:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Sync favicon dynamically when settings change
  useEffect(() => {
    if (settings.favicon) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = settings.favicon;
    }
    if (settings.websiteName) {
      document.title = settings.seo?.defaultTitle || settings.websiteName;
    }
  }, [settings]);

  const updateSettings = async (newSettings: Partial<WebSettings>) => {
    try {
      const docRef = doc(db, "Settings", "general");
      const updated = {
        ...settings,
        ...newSettings
      };
      await setDoc(docRef, updated);
    } catch (err) {
      console.error("Failed to update settings in Firestore:", err);
      throw err;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
