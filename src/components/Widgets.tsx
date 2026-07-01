import React, { useEffect, useState } from "react";
import { useSettings } from "./SettingsContext";
import { 
  Sun, 
  CloudRain, 
  Cloud, 
  CloudSnow, 
  Wind, 
  Clock, 
  Calendar, 
  Compass, 
  Moon, 
  Bell, 
  Volume2, 
  RefreshCw, 
  ChevronRight,
  MapPin,
  Cpu,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Info
} from "lucide-react";

// Helper for native Hijri Date calculation
export function getHijriDate(date: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  } catch (e) {
    return "١٤٤٧ هـ"; // fallback
  }
}

// Helper for Gregorian Date calculation
export function getGregorianDate(date: Date = new Date(), lang: "ar" | "en" = "ar"): string {
  try {
    return new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  } catch (e) {
    return date.toLocaleDateString();
  }
}

// ==========================================
// DATE & TIME WIDGET (DYNAMIC)
// ==========================================
export function DateTimeWidget({ styleOverride }: { styleOverride?: "Minimal" | "Standard" | "Detailed" | "Digital" }) {
  const { settings } = useSettings();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!settings.dateTimeEnabled) return null;

  const currentStyle = styleOverride || settings.dateTimeStyle || "Standard";

  const formattedTime = time.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
    second: currentStyle === "Digital" ? "2-digit" : undefined,
    hour12: true
  });

  const formattedGregorian = getGregorianDate(time, "ar");
  const formattedHijri = getHijriDate(time);

  if (currentStyle === "Minimal") {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono">
        <Clock className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
        <span>{time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
        {settings.dateTimeShowGregorian && (
          <span className="opacity-60">| {time.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
        )}
      </div>
    );
  }

  if (currentStyle === "Digital") {
    return (
      <div className="p-5 rounded-2xl border border-indigo-500/10 bg-gradient-to-br from-indigo-950/45 to-slate-950 text-white shadow-lg text-center space-y-2 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none"></div>
        <span className="text-[9px] font-bold text-indigo-400 font-mono tracking-widest uppercase block">TELEMETRY MASTER CLOCK</span>
        <div className="text-3xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-100 drop-shadow-xs">
          {formattedTime}
        </div>
        <div className="text-[10px] text-slate-400 flex justify-center gap-2.5 font-mono">
          {settings.dateTimeShowGregorian && <span>{time.toLocaleDateString("en-US")}</span>}
          {settings.dateTimeShowHijri && <span className="text-emerald-400 font-bold">{formattedHijri}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#080808] shadow-sm space-y-4">
      <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-white/5 pb-2.5">
        <Calendar className="w-4 h-4 text-indigo-500" />
        <span className="text-xs font-black font-display uppercase tracking-wider">التوقيت والتاريخ / Calendar</span>
      </div>

      <div className="space-y-2.5 font-sans">
        {settings.dateTimeShowTime && (
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 font-mono uppercase tracking-wider">الوقت الحالي:</span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono">{formattedTime}</span>
          </div>
        )}

        {settings.dateTimeShowGregorian && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-extrabold text-slate-400 font-mono uppercase tracking-wider">ميلادي:</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">{formattedGregorian}</span>
          </div>
        )}

        {settings.dateTimeShowHijri && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-extrabold text-slate-400 font-mono uppercase tracking-wider">هجري:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded-md text-[11px]">{formattedHijri}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// WEATHER WIDGET (DYNAMIC)
// ==========================================
interface WeatherData {
  city: string;
  country: string;
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast: { day: string; temp: number; condition: string }[];
}

export function WeatherWidget() {
  const { settings } = useSettings();
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async () => {
    if (!settings.weatherEnabled) return;
    setLoading(true);
    const city = settings.weatherCity || "Dubai";
    const country = settings.weatherCountry || "UAE";
    
    try {
      // Geolocating city roughly for latitude / longitude
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
      let lat = 25.2048;
      let lon = 55.2708;
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.results && geoData.results[0]) {
          lat = geoData.results[0].latitude;
          lon = geoData.results[0].longitude;
        }
      }

      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&relative_humidity_2m=true&daily=temperature_2m_max,weathercode&timezone=auto`
      );
      if (!res.ok) throw new Error();
      const raw = await res.json();
      
      const temp = Math.round(raw.current_weather.temperature);
      const windSpeed = raw.current_weather.windspeed;
      const humidity = raw.current_weather_relative_humidity || 55;
      const weatherCode = raw.current_weather.weathercode;

      let condition = "Clear";
      if (weatherCode > 0 && weatherCode <= 3) condition = "Partly Cloudy";
      else if (weatherCode >= 45 && weatherCode <= 48) condition = "Foggy";
      else if (weatherCode >= 51 && weatherCode <= 67) condition = "Rainy";
      else if (weatherCode >= 71 && weatherCode <= 77) condition = "Snowy";
      else if (weatherCode >= 80) condition = "Showers";

      // Simple forecast mock from daily codes
      const forecast = ["Mon", "Tue", "Wed"].map((day, idx) => {
        const dailyTemp = raw.daily?.temperature_2m_max?.[idx + 1] 
          ? Math.round(raw.daily.temperature_2m_max[idx + 1])
          : temp - idx - 1;
        return {
          day,
          temp: dailyTemp,
          condition: idx === 1 ? "Rainy" : "Clear"
        };
      });

      setData({
        city,
        country,
        temp,
        condition,
        humidity,
        windSpeed,
        forecast
      });
    } catch (e) {
      // Fallback
      setData({
        city,
        country,
        temp: 34,
        condition: "Clear",
        humidity: 50,
        windSpeed: 14.5,
        forecast: [
          { day: "غداً", temp: 35, condition: "Clear" },
          { day: "بعد غد", temp: 36, condition: "Clear" },
          { day: "الجمعة", temp: 33, condition: "Partly Cloudy" }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [settings.weatherCity, settings.weatherEnabled]);

  if (!settings.weatherEnabled) return null;

  const style = settings.weatherStyle || "Standard";

  const getWeatherIcon = (cond: string) => {
    switch (cond) {
      case "Clear": return <Sun className="w-9 h-9 text-amber-500 animate-spin-slow" />;
      case "Rainy":
      case "Showers": return <CloudRain className="w-9 h-9 text-indigo-400" />;
      case "Snowy": return <CloudSnow className="w-9 h-9 text-slate-300 animate-bounce" />;
      default: return <Cloud className="w-9 h-9 text-slate-400" />;
    }
  };

  if (style === "Minimal") {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono">
        {data ? (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
            <span>{data.city}: {data.temp}°C</span>
          </>
        ) : (
          <span>جاري تحميل الطقس...</span>
        )}
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#080808] shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2.5">
        <h3 className="font-display font-black text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2 uppercase tracking-wider">
          <Sun className="w-4 h-4 text-amber-500" /> أحوال الطقس / Weather
        </h3>
        <span className="text-[9px] text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded font-mono font-bold uppercase">{data?.city}</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin" />
        </div>
      ) : data ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              {settings.weatherShowTemp && (
                <p className="text-3xl font-black font-display text-slate-900 dark:text-white leading-none">{data.temp}°C</p>
              )}
              {settings.weatherShowStatus && (
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wide font-mono">{data.condition}</p>
              )}
              <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                {settings.weatherShowWind && (
                  <span className="flex items-center gap-0.5"><Wind className="w-3 h-3" /> {data.windSpeed} km/h</span>
                )}
                {settings.weatherShowHumidity && (
                  <span>الرطوبة: {data.humidity}%</span>
                )}
              </div>
            </div>
            <div className="p-2 bg-slate-50 dark:bg-black/40 rounded-xl border border-slate-100 dark:border-white/5">{getWeatherIcon(data.condition)}</div>
          </div>

          {/* Detailed Forecast list */}
          {style === "Detailed" && settings.weatherShowForecast && data.forecast && (
            <div className="border-t border-slate-100 dark:border-white/5 pt-3.5 space-y-2">
              <span className="text-[9px] font-black text-slate-400 font-mono block uppercase tracking-wider">التنبؤات الجوية لـ 3 أيام:</span>
              <div className="grid grid-cols-3 gap-2.5 text-center">
                {data.forecast.map((f, i) => (
                  <div key={i} className="p-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200/50 dark:border-white/5 shadow-2xs">
                    <span className="text-[9px] text-slate-400 font-extrabold block uppercase font-mono">{f.day}</span>
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 block mt-0.5">{f.temp}°C</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

// ==========================================
// PRAYER TIMES WIDGET (DYNAMIC WITH API & COUNTDOWN)
// ==========================================
interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export function PrayerTimesWidget({ styleOverride }: { styleOverride?: "Standard" | "Modern Card" | "Detailed List" | "Minimal" }) {
  const { settings } = useSettings();
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; countdown: string } | null>(null);
  const [activePrayer, setActivePrayer] = useState<string>("");

  const fetchPrayerTimes = async () => {
    if (!settings.prayerTimesEnabled) return;
    setLoading(true);
    const city = settings.prayerTimesCity || "Dubai";
    const country = settings.prayerTimesCountry || "UAE";

    try {
      const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=2`);
      if (!res.ok) throw new Error();
      const payload = await res.json();
      const t = payload.data.timings;
      const formatted: PrayerTimes = {
        Fajr: t.Fajr,
        Sunrise: t.Sunrise,
        Dhuhr: t.Dhuhr,
        Asr: t.Asr,
        Maghrib: t.Maghrib,
        Isha: t.Isha
      };
      setTimes(formatted);
    } catch (e) {
      // Use manual presets or fallback
      setTimes(settings.prayerTimesManual as PrayerTimes || {
        Fajr: "04:15",
        Sunrise: "05:40",
        Dhuhr: "12:20",
        Asr: "15:45",
        Maghrib: "19:10",
        Isha: "20:35"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrayerTimes();
  }, [settings.prayerTimesCity, settings.prayerTimesCountry, settings.prayerTimesEnabled]);

  // Live countdown and highlight calculations
  useEffect(() => {
    if (!times) return;

    const calculateCountdown = () => {
      const now = new Date();
      const prayers = [
        { name: "الفجر (Fajr)", timeStr: times.Fajr, id: "Fajr" },
        { name: "الشروق (Sunrise)", timeStr: times.Sunrise, id: "Sunrise" },
        { name: "الظهر (Dhuhr)", timeStr: times.Dhuhr, id: "Dhuhr" },
        { name: "العصر (Asr)", timeStr: times.Asr, id: "Asr" },
        { name: "المغرب (Maghrib)", timeStr: times.Maghrib, id: "Maghrib" },
        { name: "العشاء (Isha)", timeStr: times.Isha, id: "Isha" }
      ];

      // Convert each prayer time string to absolute Date object today
      const prayerDates = prayers.map((p) => {
        const [h, m] = p.timeStr.split(":").map(Number);
        const d = new Date();
        d.setHours(h, m, 0, 0);
        return { ...p, date: d };
      });

      // Find next prayer
      let target = prayerDates.find((p) => p.date > now);
      if (!target) {
        // If all prayers today have passed, tomorrow's Fajr
        const [h, m] = times.Fajr.split(":").map(Number);
        const tom = new Date();
        tom.setDate(tom.getDate() + 1);
        tom.setHours(h, m, 0, 0);
        target = { ...prayerDates[0], date: tom };
      }

      // Calculate countdown string
      const diffMs = target.date.getTime() - now.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);

      const formatNum = (num: number) => String(num).padStart(2, "0");
      const countdownStr = `${formatNum(diffHrs)}:${formatNum(diffMins)}:${formatNum(diffSecs)}`;

      setNextPrayer({
        name: target.name,
        time: target.timeStr,
        countdown: countdownStr
      });

      // Determine active highlighted prayer
      let activeId = "Isha"; // default if after Isha
      for (let i = 0; i < prayerDates.length; i++) {
        const current = prayerDates[i];
        const next = prayerDates[i + 1];
        if (now >= current.date && (!next || now < next.date)) {
          activeId = current.id;
          break;
        }
      }
      setActivePrayer(activeId);
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);
    return () => clearInterval(timer);
  }, [times]);

  if (!settings.prayerTimesEnabled) return null;

  const currentStyle = styleOverride || settings.prayerTimesStyle || "Standard";

  const prayerLabels: { [key: string]: string } = {
    Fajr: "الفجر / Fajr",
    Sunrise: "الشروق / Sunrise",
    Dhuhr: "الظهر / Dhuhr",
    Asr: "العصر / Asr",
    Maghrib: "المغرب / Maghrib",
    Isha: "العشاء / Isha"
  };

  if (loading) {
    return (
      <div className="p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#080808] flex items-center justify-center">
        <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!times) return null;

  if (currentStyle === "Minimal") {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono">
        <Compass className="w-3.5 h-3.5 text-emerald-500 animate-spin-slow" />
        {nextPrayer ? (
          <span>{nextPrayer.name.split(" (")[0]}: {nextPrayer.time} ({nextPrayer.countdown})</span>
        ) : (
          <span>جاري تحديث مواقيت الصلاة...</span>
        )}
      </div>
    );
  }

  if (currentStyle === "Modern Card") {
    return (
      <div className="p-6 rounded-2xl border border-indigo-500/10 bg-gradient-to-b from-indigo-950/40 to-slate-950 text-white shadow-xl space-y-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Compass className="w-32 h-32 text-white animate-spin-slow" />
        </div>

        <div className="flex items-center justify-between border-b border-white/5 pb-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/15">
              <Compass className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider font-mono">مواقيت الصلاة اليومية</h3>
              <p className="text-[9px] text-slate-400 font-mono">المدينة: {settings.prayerTimesCity}, {settings.prayerTimesCountry}</p>
            </div>
          </div>
          <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-md font-mono font-bold tracking-widest uppercase">REALTIME</span>
        </div>

        {nextPrayer && (
          <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-1.5 text-center relative z-10 shadow-xs">
            <span className="text-[9px] font-black text-indigo-400 font-mono uppercase tracking-widest block">متبقي على الأذان القادم</span>
            <div className="text-2xl font-black font-mono tracking-widest text-emerald-400">{nextPrayer.countdown}</div>
            <span className="text-[10px] text-slate-300 font-medium font-sans">{nextPrayer.name} الساعة {nextPrayer.time}</span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 relative z-10">
          {(Object.keys(times) as Array<keyof PrayerTimes>).map((key) => {
            const isActive = activePrayer === key;
            return (
              <div 
                key={key} 
                className={`p-3 rounded-xl border text-center transition-all ${
                  isActive 
                    ? "bg-indigo-600/20 border-indigo-500/60 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)] scale-102" 
                    : "bg-slate-900/40 border-slate-800/40 text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className="text-[9px] font-black block truncate font-sans text-slate-400">{prayerLabels[key].split(" / ")[0]}</span>
                <span className="text-xs font-black block font-mono mt-1">{times[key]}</span>
                {isActive && (
                  <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping mt-1.5"></span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#080808] shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2.5">
        <h3 className="font-sans font-black text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Compass className="w-4 h-4 text-emerald-500" /> مواقيت الصلاة / Prayer Times
        </h3>
        <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">{settings.prayerTimesCity}</span>
      </div>

      {nextPrayer && (
        <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center justify-between text-xs">
          <div>
            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-black font-mono uppercase tracking-wider block">الصلاة القادمة:</span>
            <span className="font-sans font-extrabold text-slate-800 dark:text-slate-200">{nextPrayer.name}</span>
          </div>
          <div className="text-right">
            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 block tracking-widest">{nextPrayer.countdown}</span>
            <span className="text-[9px] text-slate-400 font-mono uppercase font-bold">COUNTDOWN</span>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        {(Object.keys(times) as Array<keyof PrayerTimes>).map((key) => {
          const isActive = activePrayer === key;
          return (
            <div 
              key={key} 
              className={`flex items-center justify-between text-xs p-2.5 rounded-xl transition-all ${
                isActive 
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black border border-emerald-500/20 shadow-2xs" 
                  : "hover:bg-slate-50 dark:hover:bg-slate-800/15 text-slate-700 dark:text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bell className={`w-3.5 h-3.5 ${isActive ? "text-emerald-500 animate-bounce" : "text-slate-400"}`} />
                <span className="font-medium">{prayerLabels[key]}</span>
              </div>
              <span className="font-mono font-bold">{times[key]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// TECH STOCKS WIDGET
// ==========================================
export function StocksWidget() {
  const [stocks, setStocks] = useState([
    { symbol: "GOOGL", name: "Alphabet Inc.", price: 178.42, change: 1.25 },
    { symbol: "AAPL", name: "Apple Inc.", price: 214.36, change: -0.42 },
    { symbol: "MSFT", name: "Microsoft Corp.", price: 415.82, change: 0.84 },
    { symbol: "NVDA", name: "NVIDIA Corp.", price: 125.10, change: 3.12 }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setStocks((prev) =>
        prev.map((s) => {
          const delta = (Math.random() - 0.5) * 1.5;
          const newPrice = Number((s.price + delta).toFixed(2));
          const newChange = Number((s.change + (delta > 0 ? 0.05 : -0.05)).toFixed(2));
          return { ...s, price: newPrice, change: newChange };
        })
      );
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div id="stocks-widget" className="p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#080808] shadow-sm">
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-white/5 pb-2.5">
        <h3 className="font-display font-black text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2 uppercase tracking-wider">
          <Cpu className="w-4 h-4 text-indigo-500 animate-pulse" /> أسهم التكنولوجيا / Tech Stocks
        </h3>
        <span className="text-[8px] uppercase font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md font-bold tracking-widest animate-pulse">Live</span>
      </div>

      <div className="space-y-1.5">
        {stocks.map((s) => (
          <div key={s.symbol} className="flex items-center justify-between text-xs py-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl px-2 transition-colors">
            <div>
              <span className="font-mono font-bold text-slate-900 dark:text-white block">{s.symbol}</span>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate w-24 font-light mt-0.5">{s.name}</p>
            </div>
            <div className="text-right">
              <span className="font-mono font-black text-slate-900 dark:text-white">${s.price.toFixed(2)}</span>
              <p className={`text-[10px] flex items-center justify-end gap-0.5 font-bold font-mono mt-0.5 ${s.change >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                {s.change >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {s.change >= 0 ? "+" : ""}{s.change}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// FOREX RATES WIDGET
// ==========================================
export function CurrencyWidget() {
  const [currencies, setCurrencies] = useState([
    { pair: "USD / EUR", rate: 0.924, change: 0.12 },
    { pair: "USD / GBP", rate: 0.785, change: -0.05 },
    { pair: "USD / JPY", rate: 158.42, change: 0.35 },
    { pair: "USD / AED", rate: 3.673, change: 0.00 }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrencies((prev) =>
        prev.map((c) => {
          if (c.pair.includes("AED")) return c; // fixed peg
          const changeAmount = (Math.random() - 0.5) * 0.002 * c.rate;
          const newRate = Number((c.rate + changeAmount).toFixed(c.rate > 10 ? 2 : 4));
          const newChange = Number((c.change + (changeAmount > 0 ? 0.01 : -0.01)).toFixed(2));
          return { ...c, rate: newRate, change: newChange };
        })
      );
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div id="currency-widget" className="p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#080808] shadow-sm">
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-white/5 pb-2.5">
        <h3 className="font-display font-black text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2 uppercase tracking-wider">
          <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin-slow" /> أسعار العملات / Forex Rates
        </h3>
        <span className="text-[9px] text-slate-400 font-mono font-bold">UTC</span>
      </div>

      <div className="space-y-1.5">
        {currencies.map((c) => (
          <div key={c.pair} className="flex items-center justify-between text-xs py-2 px-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl">
            <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">{c.pair}</span>
            <div className="text-right flex items-center gap-2.5">
              <span className="font-mono font-black text-slate-900 dark:text-white">{c.rate}</span>
              <span className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded-md ${c.change >= 0 ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"}`}>
                {c.change >= 0 ? "▲" : "▼"}{Math.abs(c.change)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
