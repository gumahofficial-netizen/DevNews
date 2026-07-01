import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useSettings } from "./SettingsContext";
import { db, doc, setDoc } from "../services/firebase";
import { 
  Mail, 
  Github, 
  Twitter, 
  Linkedin, 
  Facebook, 
  Youtube, 
  CheckCircle2, 
  Phone, 
  MessageSquare, 
  Compass, 
  Sun,
  Globe,
  Heart,
  ShieldCheck,
  Zap,
  Activity
} from "lucide-react";
import { LucideIcon } from "./LucideIcon";

export function FrontendFooter() {
  const { settings } = useSettings();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [newsletterError, setNewsletterError] = useState("");
  
  // Cookie Consent state
  const [cookieConsentOpen, setCookieConsentOpen] = useState(false);

  useEffect(() => {
    // Check cookie consent
    const consent = localStorage.getItem("cookie_consent_accepted");
    if (!consent) {
      setCookieConsentOpen(true);
    }
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterError("");
    if (!newsletterEmail.trim()) return;

    try {
      // Register subscriber in Firestore
      const emailRef = doc(db, "Newsletter", newsletterEmail.toLowerCase().trim());
      await setDoc(emailRef, {
        email: newsletterEmail.toLowerCase().trim(),
        subscribedAt: new Date().toISOString(),
        active: true
      });
      setSubscribed(true);
      setNewsletterEmail("");
    } catch (err: any) {
      console.error("Error subscribing to newsletter:", err);
      setNewsletterError("Failed to subscribe. Please try again later.");
    }
  };

  const acceptCookies = () => {
    localStorage.setItem("cookie_consent_accepted", "true");
    setCookieConsentOpen(false);
  };

  const sortedSections = settings.footerSections 
    ? [...settings.footerSections].sort((a, b) => a.sortOrder - b.sortOrder)
    : [];

  return (
    <footer className="w-full bg-[#050505] text-slate-300 border-t border-slate-200 dark:border-white/5 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-10 mb-16">
        
        {/* Info Column - 4 cols */}
        <div className="md:col-span-4 space-y-5">
          <div className="flex items-center gap-3">
            {settings.logo ? (
              <img src={settings.logo} className="h-8 max-w-[150px] object-contain" alt={settings.websiteName} referrerPolicy="no-referrer" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-base shadow-lg border border-white/10 shrink-0">
                {settings.websiteName ? settings.websiteName.charAt(0).toUpperCase() : "D"}
              </div>
            )}
            <div>
              <span className="font-display font-black text-base text-white uppercase tracking-tight block">
                {settings.websiteName || "DEV NEWS PRO"}
              </span>
              <p className="text-[8px] uppercase tracking-[0.2em] text-indigo-400 font-bold mt-0.5">Information Tower</p>
            </div>
          </div>
          
          <p className="text-xs text-slate-400 leading-relaxed font-light">
            {settings.footerContent || "The premium developer-focused news website providing the absolute truth on software systems, quantum computation, internet models, and cloud-native practices."}
          </p>

          {/* Contact details */}
          <div className="space-y-2 text-xs text-slate-400 pt-1 font-mono">
            {settings.contactEmail && (
              <div className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <a href={`mailto:${settings.contactEmail}`} className="hover:text-indigo-400 transition-colors">{settings.contactEmail}</a>
              </div>
            )}
            {settings.contactPhone && (
              <div className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                <a href={`tel:${settings.contactPhone}`} className="hover:text-indigo-400 transition-colors">{settings.contactPhone}</a>
              </div>
            )}
            {settings.whatsappNumber && (
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                <a 
                  href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-indigo-400 transition-colors"
                >
                  WhatsApp: {settings.whatsappNumber}
                </a>
              </div>
            )}
          </div>

          {/* Social Links with Premium Icons and Hover Borders */}
          <div className="flex items-center gap-2.5 pt-1">
            {settings.socialLinks?.github && (
              <a href={settings.socialLinks.github} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:border-white/10 flex items-center justify-center transition-all" aria-label="GitHub">
                <Github className="w-4 h-4" />
              </a>
            )}
            {settings.socialLinks?.twitter && (
              <a href={settings.socialLinks.twitter} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:border-white/10 flex items-center justify-center transition-all" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {settings.socialLinks?.linkedin && (
              <a href={settings.socialLinks.linkedin} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:border-white/10 flex items-center justify-center transition-all" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {settings.socialLinks?.facebook && (
              <a href={settings.socialLinks.facebook} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:border-white/10 flex items-center justify-center transition-all" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
            )}
            {settings.socialLinks?.youtube && (
              <a href={settings.socialLinks.youtube} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:border-white/10 flex items-center justify-center transition-all" aria-label="YouTube">
                <Youtube className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Dynamic Builder Sections - 4 cols total */}
        <div className="md:col-span-4 grid grid-cols-2 gap-6">
          {sortedSections.length > 0 ? (
            sortedSections.map((section) => (
              <div key={section.id} className="space-y-4">
                <h4 className="font-display font-black text-xs text-white uppercase tracking-wider font-mono border-b border-white/5 pb-2">
                  {section.title}
                </h4>
                <ul className="space-y-2.5 text-xs text-slate-400 font-light">
                  {section.links.map((link, idx) => {
                    const isExternal = link.url.startsWith("http");
                    return (
                      <li key={idx}>
                        {isExternal ? (
                          <a href={link.url} target="_blank" rel="noreferrer" className="hover:text-indigo-400 transition-colors flex items-center gap-2">
                            {link.icon && <LucideIcon name={link.icon} className="w-3.5 h-3.5 text-indigo-500" />}
                            {link.title}
                          </a>
                        ) : (
                          <Link to={link.url} className="hover:text-indigo-400 transition-colors flex items-center gap-2">
                            {link.icon && <LucideIcon name={link.icon} className="w-3.5 h-3.5 text-indigo-500" />}
                            {link.title}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          ) : (
            <>
              {/* Fallback default navigation if empty */}
              <div className="space-y-4">
                <h4 className="font-display font-black text-xs text-white uppercase tracking-wider font-mono border-b border-white/5 pb-2">Navigation</h4>
                <ul className="space-y-2.5 text-xs text-slate-400 font-light">
                  <li><Link to="/" className="hover:text-indigo-400 transition-colors">Home Portal</Link></li>
                  <li><Link to="/search" className="hover:text-indigo-400 transition-colors">Advanced Search</Link></li>
                  <li><Link to="/about" className="hover:text-indigo-400 transition-colors">About Us</Link></li>
                  <li><Link to="/admin" className="hover:text-indigo-400 transition-colors">Admin Panel</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-display font-black text-xs text-white uppercase tracking-wider font-mono border-b border-white/5 pb-2">Legal</h4>
                <ul className="space-y-2.5 text-xs text-slate-400 font-light">
                  <li><Link to="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Newsletter Column - 4 cols */}
        <div className="md:col-span-4 space-y-4">
          <h4 className="font-display font-black text-xs text-white uppercase tracking-wider font-mono border-b border-white/5 pb-2">Technical Digest</h4>
          <p className="text-xs text-slate-400 leading-relaxed font-light">
            Join 45,000+ software engineers who receive weekly technical digests and premium dev analysis reports.
          </p>

          {subscribed ? (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-mono">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Telemetry: Subscription Confirmed</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2.5">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="sarah.jenkins@gmail.com"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full text-xs p-3.5 pl-10 rounded-xl bg-white/5 text-slate-100 outline-none border border-white/10 focus:border-indigo-500 focus:bg-black transition-all font-mono"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-4" />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/15 hover:shadow-indigo-500/25 transition-all cursor-pointer"
              >
                Join Broadcast
              </button>
              {newsletterError && (
                <span className="text-[10px] text-rose-400 mt-1 font-mono">{newsletterError}</span>
              )}
            </form>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <p className="tracking-wide">{settings.footerCopyrightText || "© 2026 DEV NEWS PRO INC. ALL RIGHTS RESERVED."}</p>
          <p className="font-mono text-[9px] tracking-[0.25em] text-slate-600 uppercase flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 animate-pulse" /> Security Integrity Handshake OK
          </p>
        </div>
        <div className="flex items-center gap-6 shrink-0 font-mono text-[10px]">
          <div className="flex items-center gap-2 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></div>
            <span className="text-slate-400">8.2k Nodes Online</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-400">4.1ms Telemetry Delay</span>
          </div>
        </div>
      </div>

      {/* Cookie Consent Banner */}
      <AnimatePresence>
        {cookieConsentOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed bottom-4 left-4 right-4 md:right-auto md:max-w-sm z-50 p-5 rounded-2xl border border-white/10 bg-black/95 backdrop-blur-md text-white shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-2 text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
              <h5 className="font-display font-black text-xs uppercase tracking-wider text-white">
                Cookie Telemetry preferences
              </h5>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-light">
              We use technical cookies and security telemetry to optimize performance, run real-time analytics, and display tailored sponsored advertisements.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={acceptCookies}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-[10px] font-black text-white transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                Accept All
              </button>
              <button
                onClick={() => setCookieConsentOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black text-slate-300 transition-all cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}
