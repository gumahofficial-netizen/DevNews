import React, { useEffect, useState } from "react";
import { Advertisement, AdPosition } from "../types";
import { db, doc, updateDoc, collection, getDocs } from "../services/firebase";

interface AdRendererProps {
  position: AdPosition;
  currentCategory?: string;
  className?: string;
}

export function AdRenderer({ position, currentCategory, className = "" }: AdRendererProps) {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [activeAd, setActiveAd] = useState<Advertisement | null>(null);
  const [device, setDevice] = useState<"Desktop" | "Tablet" | "Mobile">("Desktop");

  // Detect device size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setDevice("Mobile");
      else if (width < 1024) setDevice("Tablet");
      else setDevice("Desktop");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch advertisements
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const snap = await getDocs(collection(db, "Advertisements"));
        const fetched: Advertisement[] = [];
        snap.forEach((doc) => {
          fetched.push({ id: doc.id, ...doc.data() } as Advertisement);
        });
        setAds(fetched);
      } catch (err) {
        console.error("Error fetching ads for renderer:", err);
      }
    };
    fetchAds();
  }, [position]);

  // Filter and select advertisement
  useEffect(() => {
    if (ads.length === 0) return;

    const now = new Date().toISOString();
    const filtered = ads.filter((ad) => {
      // 1. Basic flags
      if (!ad.enabled) return false;
      if (ad.position !== position) return false;
      
      // 2. Dates
      if (ad.startDate && ad.startDate > now) return false;
      if (ad.endDate && ad.endDate < now) return false;

      // 3. Device targeting
      if (ad.targeting?.devices && ad.targeting.devices.length > 0) {
        if (!ad.targeting.devices.includes(device)) return false;
      }

      // 4. Category targeting
      if (ad.targeting?.categories && ad.targeting.categories.length > 0 && currentCategory) {
        if (!ad.targeting.categories.includes(currentCategory)) return false;
      }

      return true;
    });

    if (filtered.length === 0) {
      setActiveAd(null);
      return;
    }

    // Weight and select ad based on priority (High, Medium, Low)
    const priorityWeight = (p: string) => {
      if (p === "High") return 3;
      if (p === "Medium") return 2;
      return 1;
    };

    const totalWeight = filtered.reduce((acc, ad) => acc + priorityWeight(ad.priority), 0);
    let rand = Math.random() * totalWeight;
    
    let chosen: Advertisement | null = null;
    for (const ad of filtered) {
      const weight = priorityWeight(ad.priority);
      if (rand <= weight) {
        chosen = ad;
        break;
      }
      rand -= weight;
    }

    const selected = chosen || filtered[0];
    setActiveAd(selected);

    // Track View Counter in firestore (de-bounded or straight forward update)
    if (selected) {
      const adDocRef = doc(db, "Advertisements", selected.id);
      updateDoc(adDocRef, {
        viewsCount: (selected.viewsCount || 0) + 1,
        // re-calculate CTR
        ctr: Number((((selected.clicksCount || 0) / ((selected.viewsCount || 0) + 1)) * 100).toFixed(2)) || 0
      }).catch(err => console.error("Error updating ad view stats:", err));
    }
  }, [ads, device, position, currentCategory]);

  const handleAdClick = () => {
    if (!activeAd) return;
    const adDocRef = doc(db, "Advertisements", activeAd.id);
    updateDoc(adDocRef, {
      clicksCount: (activeAd.clicksCount || 0) + 1,
      // re-calculate CTR
      ctr: Number(((((activeAd.clicksCount || 0) + 1) / (activeAd.viewsCount || 1)) * 100).toFixed(2)) || 0
    }).catch(err => console.error("Error updating ad click stats:", err));
  };

  if (!activeAd) {
    // Return a beautiful empty placeholder if no ads loaded, so the template alignment doesn't collapse
    return null;
  }

  // Map position to styling constraints
  const getAdSizeStyles = (size: string) => {
    switch (size) {
      case "728x90": return "w-full max-w-[728px] h-[90px]";
      case "970x250": return "w-full max-w-[970px] h-[250px]";
      case "970x90": return "w-full max-w-[970px] h-[90px]";
      case "300x250": return "w-[300px] h-[250px]";
      case "336x280": return "w-[336px] h-[280px]";
      case "300x600": return "w-[300px] h-[600px]";
      case "160x600": return "w-[160px] h-[600px]";
      case "120x600": return "w-[120px] h-[600px]";
      case "320h100": return "w-[320px] h-[100px]";
      case "320x50": return "w-[320px] h-[50px]";
      case "468x60": return "w-[468px] h-[60px]";
      case "250x250": return "w-[250px] h-[250px]";
      case "200x200": return "w-[200px] h-[200px]";
      default: return "w-full h-auto max-h-[250px] object-contain";
    }
  };

  const isPopup = position === "Popup";
  const isFloating = position === "Floating" || position === "Sticky Bottom";

  return (
    <div 
      className={`relative flex flex-col items-center justify-center text-center mx-auto my-4 transition-all duration-300 ${getAdSizeStyles(activeAd.size)} ${className}`}
    >
      <span className="absolute -top-4 left-2 text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
        Sponsored Ad ({activeAd.size})
      </span>
      <a 
        href={activeAd.targetUrl}
        target={activeAd.openInNewTab ? "_blank" : "_self"}
        rel="noopener noreferrer"
        onClick={handleAdClick}
        className="w-full h-full block rounded overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 hover:opacity-95 transition-opacity"
      >
        <img 
          src={activeAd.imageUrl} 
          alt={activeAd.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </a>
    </div>
  );
}
