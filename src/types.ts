export type UserRole = "Admin" | "Editor" | "Writer" | "User";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  bookmarks: string[]; // news ids
  history: { articleId: string; viewedAt: string }[];
  savedArticles: string[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string; // Tailwind color class or hex (e.g., 'indigo-600')
  icon: string; // Lucide icon name
  sortOrder: number;
}

export type NewsStatus = "Draft" | "Published" | "Scheduled";

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  content: string; // Markdown or rich HTML
  summary?: string;
  aiSummary?: string;
  featuredImage: string; // Cloudinary URL
  galleryImages: string[]; // Cloudinary URLs
  youtubeUrl?: string;
  cloudinaryVideoUrl?: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  category: string; // category slug or id
  tags: string[];
  status: NewsStatus;
  publishDate: string; // ISO string
  updatedDate: string; // ISO string
  readingTime: number; // minutes
  views: number;
  likes: string[]; // user IDs
  commentsCount: number;
  isEditorsChoice: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  scheduledTime?: string; // ISO string if scheduled
  
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export interface Comment {
  id: string;
  articleId: string;
  parentId: string | null; // null for top-level, commentId for nested replies
  userId: string;
  userName: string;
  userAvatar?: string;
  userEmail: string;
  content: string;
  createdAt: string;
  likes: string[]; // user IDs
  reported: boolean;
  status: "Approved" | "Pending" | "Moderated";
  replies?: Comment[];
}

export interface BreakingNews {
  id: string;
  title: string;
  url?: string;
  active: boolean;
  createdAt: string;
  expiryDate?: string;
}

export type AdSize = 
  | "728x90" | "970x250" | "970x90" | "300x250" | "336x280" | "300x600" 
  | "160x600" | "120x600" | "320x100" | "320x50" | "468x60" | "250x250" | "200x200" | "Responsive";

export type AdPosition = 
  | "Header" | "Footer" | "Sidebar" | "Inside Article" | "Between Paragraphs" 
  | "Popup" | "Floating" | "Sticky Bottom" | "Sticky Sidebar" 
  | "Homepage Banner" | "Category Banner" | "Search Banner" | "404 Banner";

export interface Advertisement {
  id: string;
  title: string;
  imageUrl: string; // Cloudinary URL
  targetUrl: string;
  openInNewTab: boolean;
  size: AdSize;
  position: AdPosition;
  startDate: string;
  endDate: string;
  viewsCount: number;
  clicksCount: number;
  ctr: number;
  enabled: boolean;
  priority: "High" | "Medium" | "Low";
  
  // Targeting
  targeting: {
    categories: string[]; // array of category slugs, empty = all
    devices: ("Desktop" | "Tablet" | "Mobile")[];
    countries: string[]; // empty = all
  };
}

export interface WebSettings {
  websiteName: string;
  logo: string;
  favicon: string;
  theme: "Light" | "Dark" | "System";
  socialLinks: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
    youtube?: string;
    instagram?: string;
    whatsapp?: string;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    defaultKeywords: string;
    googleAnalyticsId?: string;
  };
  emailSettings: {
    senderEmail: string;
    senderName: string;
  };
  cloudinarySettings: {
    cloudName: string;
    apiKey: string;
  };
  maintenanceMode: boolean;

  // Website Custom Brand and Pages
  footerContent?: string;
  footerCopyrightText?: string;
  contactEmail?: string;
  contactPhone?: string;
  whatsappNumber?: string;
  aboutPageContent?: string;
  privacyPageContent?: string;
  termsPageContent?: string;
  customPages?: { id: string; title: string; slug: string; content: string; updatedAt: string }[];
  websiteColors?: {
    primary: string; // Tailwind class or hex
    secondary: string;
    accent: string;
    bgLight: string;
    bgDark: string;
  };
  
  // Weather Settings
  weatherEnabled?: boolean;
  weatherCity?: string;
  weatherCountry?: string;
  weatherPosition?: "Header" | "Sidebar" | "Footer" | "None";
  weatherStyle?: "Minimal" | "Standard" | "Detailed";
  weatherShowTemp?: boolean;
  weatherShowStatus?: boolean;
  weatherShowHumidity?: boolean;
  weatherShowWind?: boolean;
  weatherShowForecast?: boolean;

  // Date & Time System
  dateTimeEnabled?: boolean;
  dateTimeShowTime?: boolean;
  dateTimeShowDate?: boolean;
  dateTimeShowGregorian?: boolean;
  dateTimeShowHijri?: boolean;
  dateTimeStyle?: "Minimal" | "Standard" | "Detailed" | "Digital";

  // Prayer Times System
  prayerTimesEnabled?: boolean;
  prayerTimesCountry?: string;
  prayerTimesCity?: string;
  prayerTimesHeaderWidget?: boolean;
  prayerTimesSidebarWidget?: boolean;
  prayerTimesPageEnabled?: boolean;
  prayerTimesStyle?: "Standard" | "Modern Card" | "Detailed List";
  prayerTimesManual?: {
    fajr?: string;
    sunrise?: string;
    dhuhr?: string;
    asr?: string;
    maghrib?: string;
    isha?: string;
  };

  // Footer Builder
  footerSections?: {
    id: string;
    title: string;
    sortOrder: number;
    links: { title: string; url: string; icon?: string }[];
  }[];
}

export interface PageContent {
  id: string; // 'about' | 'privacy' | 'terms'
  title: string;
  content: string; // markdown or HTML
  updatedAt: string;
}

export interface VisitorLog {
  id: string;
  timestamp: string;
  ipHash?: string; // anonymized or general session token
  device: "Desktop" | "Tablet" | "Mobile";
  browser: string;
  country: string;
  referrer: string;
  articleId?: string; // if viewing article
}

export interface NewsletterSubscriber {
  email: string;
  subscribedAt: string;
  active: boolean;
}
