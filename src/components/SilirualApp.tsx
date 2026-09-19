import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Accessibility,
  Activity,
  ArrowLeft,
  Bell,
  BookOpen,
  Brain,
  Camera,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Cloud,
  CloudOff,
  Gamepad2,
  HandHeart,
  Headphones,
  HeartHandshake,
  Home,
  Image as ImageIcon,
  Languages,
  LocateFixed,
  LogOut,
  MapPin,
  Menu,
  Mic,
  Pause,
  Phone,
  Play,
  Plus,
  RotateCcw,
  Settings,
  ShieldCheck,
  Sparkles,
  Square,
  Star,
  Sun,
  UserRound,
  Users,
  Volume2,
  X,
  Flower2,
  Shapes,
  Music,
  Footprints,
  TrendingUp,
  BarChart3,
  PieChart,
  Eye,
  Trophy,
} from "lucide-react";
import northeastWelcome from "@/assets/northeast-welcome.jpg";
import { supabaseAuth } from "@/lib/supabase/authService";
import { isSupabaseConfigured } from "@/lib/supabase/client";

type Role = "elder" | "family" | "caregiver";
type Stage = "welcome" | "role" | "auth" | "onboarding" | "app";
type ElderView =
  | "today"
  | "games"
  | "memories"
  | "help"
  | "activities"
  | "engagement"
  | "reminders"
  | "routine"
  | "care"
  | "location"
  | "settings";
type TextSize = "normal" | "large" | "extra";

const cn = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join(" ");

function ActionButton({
  children,
  onClick,
  variant = "primary",
  disabled,
  type = "button",
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "warm";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn("app-button", `app-button-${variant}`, className)}
    >
      {children}
    </button>
  );
}

function IconBadge({
  children,
  tone = "primary",
}: {
  children: ReactNode;
  tone?: "primary" | "green" | "gold" | "red";
}) {
  return <span className={cn("icon-badge", `icon-badge-${tone}`)}>{children}</span>;
}

function StatusStrip() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return (
    <div className={cn("status-strip", !online && "status-strip-offline")} role="status">
      {online ? <Cloud size={18} /> : <CloudOff size={18} />}
      <span>{online ? "Saved on this device · Online" : "Offline · Your information is safe"}</span>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand-lockup">
      <span className={cn("brand-mark", compact && "brand-mark-small")}>
        <HandHeart />
      </span>
      <div>
        <strong>SiliRual</strong>
        {!compact && <small>Memory Aid · Government of India Initiative</small>}
      </div>
    </div>
  );
}

function PageHeader({
  title,
  subtitle,
  onBack,
  action,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div className="page-header-row">
        {onBack && (
          <button className="icon-button" onClick={onBack} aria-label="Go back">
            <ArrowLeft />
          </button>
        )}
        <div className="min-w-0">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
    </header>
  );
}

function Welcome({ onNext }: { onNext: (mode: "using" | "helping") => void }) {
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(0);
  const languages = ["English", "हिन्दी", "অসমীয়া", "বাংলা", "नेपाली", "মৈতৈলোন्"];

  const handleLanguageSelect = (index: number) => {
    setSelectedLanguage(index);
    setShowLanguageMenu(false);
    console.log(`Language selected: ${languages[index]}`);
  };
  return (
    <main className="welcome-screen">
      <div className="welcome-photo">
        <img
          src={northeastWelcome}
          alt="Green hills, river and a traditional home in North East India"
          width={1200}
          height={900}
        />
        <div className="welcome-overlay">
          <div className="welcome-top">
            <Brand />
            <button
              className="language-pill"
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            >
              <Languages size={20} /> {languages[selectedLanguage]} <ChevronRight size={18} />
            </button>
          </div>
          {showLanguageMenu && (
            <div className="language-dropdown">
              {languages.map((lang, i) => (
                <button key={lang} onClick={() => handleLanguageSelect(i)}>
                  {lang}
                </button>
              ))}
            </div>
          )}
          <div className="welcome-message">
            <span className="official-label">
              <ShieldCheck size={18} /> Government of India · Ministry of Health & Family Welfare
            </span>
            <h1>SiliRual for Elderly Cognitive Health</h1>
            <p>
              A government initiative to support memory and cognitive wellness for elderly citizens,
              especially in North East India.
            </p>
          </div>
        </div>
      </div>
      <section className="welcome-actions" aria-label="Choose how you are using SILIRUAL">
        <ActionButton onClick={() => onNext("using")}>
          <UserRound /> I am an Elder (वृद्ध)
        </ActionButton>
        <ActionButton variant="secondary" onClick={() => onNext("helping")}>
          <HeartHandshake /> I am a Caregiver (देखभाल कर्ता)
        </ActionButton>
        <p className="privacy-note">
          <ShieldCheck size={17} /> Your information stays private and under your control.
        </p>
        <div className="government-footer">
          <div>
            <small>Government of India Initiative</small>
            <strong>Ministry of Health & Family Welfare</strong>
          </div>
          <div className="emergency-helpline">
            <Phone size={16} /> 104 - Health Helpline
          </div>
        </div>
      </section>
    </main>
  );
}

function RoleSelect({
  mode,
  onChoose,
  onBack,
}: {
  mode: "using" | "helping";
  onChoose: (r: Role) => void;
  onBack: () => void;
}) {
  const roles =
    mode === "using"
      ? [
          {
            id: "elder" as Role,
            title: "For myself",
            text: "Activities, reminders and familiar memories",
            icon: <UserRound />,
            tone: "primary" as const,
          },
          {
            id: "family" as Role,
            title: "As a family member",
            text: "Support someone you care about",
            icon: <HeartHandshake />,
            tone: "gold" as const,
          },
        ]
      : [
          {
            id: "family" as Role,
            title: "Family Member (परिवार सदस्य)",
            text: "Support elderly family members with cognitive care",
            icon: <HeartHandshake />,
            tone: "gold" as const,
          },
          {
            id: "caregiver" as Role,
            title: "Professional Caregiver (देखभाल कर्ता)",
            text: "Provide professional care and cognitive training support",
            icon: <Users />,
            tone: "green" as const,
          },
        ];
  return (
    <main className="simple-screen">
      <PageHeader
        title="How will you use SiliRual?"
        subtitle="Government of India Cognitive Health Initiative"
        onBack={onBack}
      />
      <div className="choice-list">
        {roles.map((r) => (
          <button className="choice-card" key={r.id} onClick={() => onChoose(r.id)}>
            <IconBadge tone={r.tone}>{r.icon}</IconBadge>
            <span>
              <strong>{r.title}</strong>
              <small>{r.text}</small>
            </span>
            <ChevronRight />
          </button>
        ))}
      </div>
      <div className="reassurance">
        <CircleHelp />
        <div>
          <strong>Not sure which to choose?</strong>
          <p>You can change this later in Settings.</p>
        </div>
      </div>
      <div className="government-footer">
        <div>
          <small>Government of India Initiative</small>
          <strong>Ministry of Health & Family Welfare</strong>
        </div>
        <div className="emergency-helpline">
          <Phone size={16} /> 104 - Health Helpline
        </div>
      </div>
    </main>
  );
}

function Auth({
  role,
  onContinue,
  onBack,
}: {
  role: Role;
  onContinue: () => void;
  onBack: () => void;
}) {
  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [sent, setSent] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isDemo = !isSupabaseConfigured();

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      if (mode === "phone" && !sent) {
        if (value.replace(/\D/g, "").length < 10) {
          setError("Please enter a valid phone number.");
          setLoading(false);
          return;
        }
        const result = await supabaseAuth.sendOTP(value);
        if (result.success) {
          setSent(true);
          setValue("");
        } else {
          setError(result.message);
        }
      } else if (mode === "phone" && sent) {
        const result = await supabaseAuth.verifyOTP(value, value, role);
        if (result.success) {
          onContinue();
        } else {
          setError(result.error || "Verification failed");
        }
      } else {
        // Email mode - continue as guest for now
        await supabaseAuth.continueAsGuest(role);
        onContinue();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      await supabaseAuth.continueAsGuest(role);
      onContinue();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="simple-screen">
      <PageHeader
        title={sent ? "Enter your code" : "Welcome back"}
        subtitle={
          sent
            ? "We sent a 6-digit code to your phone."
            : `Continue as ${role === "elder" ? "an elder" : role === "family" ? "a family member" : "a caregiver"}.`
        }
        onBack={onBack}
      />
      {isDemo && (
        <div className="demo-banner">
          <Sparkles /> Demo mode is on. Your information stays on this device.
        </div>
      )}
      {!sent && (
        <div className="segmented">
          <button
            className={mode === "phone" ? "active" : ""}
            onClick={() => {
              setMode("phone");
              setError("");
            }}
          >
            <Phone /> Phone
          </button>
          <button
            className={mode === "email" ? "active" : ""}
            onClick={() => {
              setMode("email");
              setError("");
            }}
          >
            <UserRound /> Email
          </button>
        </div>
      )}
      <form
        className="form-stack"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label>
          {sent ? "6-digit code" : mode === "phone" ? "Mobile number" : "Email address"}
          <input
            inputMode={sent || mode === "phone" ? "numeric" : "email"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={
              sent
                ? isDemo
                  ? "123456"
                  : "Enter code"
                : mode === "phone"
                  ? "+91 98765 43210"
                  : "you@example.com"
            }
            maxLength={sent ? 6 : undefined}
            disabled={loading}
          />
        </label>
        {mode === "email" && !sent && (
          <label>
            Password
            <input type="password" placeholder="At least 8 characters" disabled={loading} />
          </label>
        )}
        {error && (
          <div className="error-message">
            <X />
            {error}
          </div>
        )}
        <ActionButton type="submit" disabled={loading}>
          {loading ? (
            "Processing..."
          ) : sent ? (
            <>
              <Check /> Verify and continue
            </>
          ) : mode === "phone" ? (
            <>
              <Phone /> Send code
            </>
          ) : (
            <>
              <ShieldCheck /> Log in securely
            </>
          )}
        </ActionButton>
      </form>
      <div className="or-divider">
        <span>or</span>
      </div>
      <ActionButton variant="ghost" onClick={handleGuest} disabled={loading}>
        Continue without an account
      </ActionButton>
      <p className="support-copy">
        Need help? <button>Call a trusted person</button>
      </p>
    </main>
  );
}

function ToggleRow({
  icon,
  title,
  text,
  value,
  onChange,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  value: boolean;
  onChange: () => void;
}) {
  return (
    <div className="toggle-row">
      <IconBadge>{icon}</IconBadge>
      <div>
        <strong>{title}</strong>
        <small>{text}</small>
      </div>
      <button
        className={cn("switch", value && "switch-on")}
        role="switch"
        aria-checked={value}
        aria-label={title}
        onClick={onChange}
      >
        <span />
      </button>
    </div>
  );
}

function Onboarding({
  onDone,
  textSize,
  setTextSize,
}: {
  onDone: (name: string) => void;
  textSize: TextSize;
  setTextSize: (s: TextSize) => void;
}) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(0);
  const [settings, setSettings] = useState({
    sound: true,
    haptic: true,
    voice: false,
    contrast: false,
    motion: false,
    memories: true,
    reminders: true,
    location: false,
    recording: false,
  });
  const flip = (key: keyof typeof settings) => setSettings((v) => ({ ...v, [key]: !v[key] }));
  return (
    <main className="simple-screen onboarding-screen">
      <div className="progress-label">
        <span>Step {step} of 4</span>
        <strong>{step * 25}% complete</strong>
      </div>
      <div className="progress-track">
        <span style={{ width: `${step * 25}%` }} />
      </div>
      {step === 1 && (
        <>
          <PageHeader title="Choose your language" subtitle="You can change this at any time." />
          <div className="language-grid">
            {["English", "हिन्दी", "অসমীয়া", "বাংলা", "नेपाली", "মৈতৈলোন্"].map((l, i) => (
              <button
                className={cn("language-card", selectedLanguage === i && "selected")}
                key={l}
                onClick={() => setSelectedLanguage(i)}
              >
                {selectedLanguage === i && <Check />}
                <strong>{l}</strong>
                <small>
                  {["English", "Hindi", "Assamese", "Bengali", "Nepali", "Manipuri"][i]}
                </small>
              </button>
            ))}
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <PageHeader
            title="Make it comfortable"
            subtitle="Try each option. Changes happen right away."
          />
          <section className="settings-section">
            <h2>Text size</h2>
            <div className="size-picker">
              {(["normal", "large", "extra"] as TextSize[]).map((s) => (
                <button
                  key={s}
                  className={textSize === s ? "selected" : ""}
                  onClick={() => setTextSize(s)}
                >
                  <span className={`sample-${s}`}>Aa</span>
                  <small>{{ normal: "Normal", large: "Large", extra: "Extra Large" }[s]}</small>
                </button>
              ))}
            </div>
          </section>
          <section className="settings-section">
            {[
              ["sound", "Sound", "Hear helpful sounds", <Volume2 />],
              ["haptic", "Vibration", "Feel feedback after a tap", <Activity />],
              ["voice", "Voice instructions", "Hear instructions read aloud", <Mic />],
              ["contrast", "High contrast", "Make colours easier to see", <Accessibility />],
              ["motion", "Reduced motion", "Use fewer moving effects", <Sparkles />],
            ].map(([k, t, d, i]) => (
              <ToggleRow
                key={k as string}
                icon={i}
                title={t as string}
                text={d as string}
                value={settings[k as keyof typeof settings]}
                onChange={() => flip(k as keyof typeof settings)}
              />
            ))}
          </section>
        </>
      )}
      {step === 3 && (
        <>
          <PageHeader
            title="What should we call you?"
            subtitle="This helps us make SILIRUAL feel familiar."
          />
          <div className="profile-symbol">
            <UserRound />
          </div>
          <div className="form-stack">
            <label>
              Your name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="For example, Anima"
              />
            </label>
            <label>
              Age range (optional)
              <select>
                <option>Choose an age range</option>
                <option>60–69</option>
                <option>70–79</option>
                <option>80 or above</option>
              </select>
            </label>
          </div>
        </>
      )}
      {step === 4 && (
        <>
          <PageHeader
            title="You are in control"
            subtitle="Choose what SILIRUAL may use. You can change these later."
          />
          <section className="settings-section">
            {[
              ["memories", "Memories", "Show photos and stories shared with you", <ImageIcon />],
              ["reminders", "Reminders", "Notify you about your daily plan", <Bell />],
              [
                "location",
                "Location sharing",
                "Allow time-limited sharing when you choose",
                <MapPin />,
              ],
              ["recording", "Voice recording", "Use your voice for simple tasks", <Mic />],
            ].map(([k, t, d, i]) => (
              <ToggleRow
                key={k as string}
                icon={i}
                title={t as string}
                text={d as string}
                value={settings[k as keyof typeof settings]}
                onChange={() => flip(k as keyof typeof settings)}
              />
            ))}
          </section>
          <div className="reassurance">
            <ShieldCheck />
            <div>
              <strong>Your privacy matters</strong>
              <p>Nothing is shared without your permission.</p>
            </div>
          </div>
        </>
      )}
      <div className="onboarding-actions">
        {step > 1 && (
          <ActionButton variant="secondary" onClick={() => setStep(step - 1)}>
            <ArrowLeft /> Back
          </ActionButton>
        )}
        <ActionButton
          disabled={step === 3 && !name.trim()}
          onClick={() => (step < 4 ? setStep(step + 1) : onDone(name || "Friend"))}
        >
          {step === 4 ? "Finish setup" : "Continue"}
          <ChevronRight />
        </ActionButton>
      </div>
    </main>
  );
}

const games = [
  {
    name: "Picture Pairs",
    desc: "Find two pictures that match",
    icon: <Flower2 />,
    level: "Gentle · 3 rounds",
  },
  {
    name: "Pizza Memory",
    desc: "Rebuild the pizza from memory",
    icon: "🍕",
    level: "Gentle · 5 rounds",
  },
  {
    name: "3 Cups & 1 Ball",
    desc: "Follow the cup hiding the ball",
    icon: "🪄",
    level: "Gentle · Continuous",
  },
  {
    name: "Picture Puzzle",
    desc: "Rebuild a familiar picture",
    icon: <ImageIcon />,
    level: "Gentle · Continuous",
  },
  {
    name: "Remember the Pattern",
    desc: "Watch and repeat a sequence of lights",
    icon: <Brain />,
    level: "Gentle · Continuous",
  },
];

type SavedGameScore = {
  highScore: number;
  lastScore: number;
  lastPlayedAt: number;
};

type SavedGameProgress = {
  scores: Record<string, SavedGameScore>;
  recent: Array<{ gameName: string; score: number; playedAt: number; durationMinutes: number }>;
};

type EngagementRecord = {
  id: string;
  category: "game" | "activity" | "reminder" | "routine";
  name: string;
  completedAt: number;
  durationMinutes: number;
  scheduledFor?: number;
  onTime?: boolean;
  score?: number;
};

const GAME_PROGRESS_STORAGE_KEY = "silirual-game-progress";
const ENGAGEMENT_STORAGE_KEY = "silirual-engagement";

const loadEngagement = (): EngagementRecord[] => {
  if (typeof window === "undefined") return [];
  try {
    const saved = JSON.parse(localStorage.getItem(ENGAGEMENT_STORAGE_KEY) ?? "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

const saveEngagement = (
  record: Omit<EngagementRecord, "id" | "completedAt"> & { completedAt?: number },
) => {
  if (typeof window === "undefined") return;
  const item: EngagementRecord = {
    ...record,
    id: `${record.category}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    completedAt: record.completedAt ?? Date.now(),
  };
  localStorage.setItem(
    ENGAGEMENT_STORAGE_KEY,
    JSON.stringify([item, ...loadEngagement()].slice(0, 500)),
  );
};

const startOfDay = (value: Date | number) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

const scheduledTimeToday = (time: string) => {
  const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  const date = new Date();
  if (!match) {
    const twentyFourHour = time.match(/^(\d{1,2}):(\d{2})$/);
    if (!twentyFourHour) return date.getTime();
    date.setHours(Number(twentyFourHour[1]), Number(twentyFourHour[2]), 0, 0);
    return date.getTime();
  }
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === "PM") hour += 12;
  date.setHours(hour, Number(match[2]), 0, 0);
  return date.getTime();
};

const toTimeInput = (time: string) => {
  const match = time.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) return "09:00";
  let hour = Number(match[1]);
  if (match[3]) {
    hour %= 12;
    if (match[3].toUpperCase() === "PM") hour += 12;
  }
  return `${String(hour).padStart(2, "0")}:${match[2]}`;
};

const displayReminderTime = (time: string) => {
  const [hourText, minute] = toTimeInput(time).split(":");
  const hour = Number(hourText);
  return `${hour % 12 || 12}:${minute} ${hour >= 12 ? "PM" : "AM"}`;
};

type PersonalReminder = {
  id: string;
  title: string;
  desc: string;
  time: string;
  enabled: boolean;
};

type PersonalMemory = {
  id: string;
  title: string;
  story: string;
  photo?: string;
  createdAt: number;
};

type PersonalProfile = {
  photo?: string;
  memories: PersonalMemory[];
};

const DEFAULT_REMINDERS: PersonalReminder[] = [
  {
    id: "medicine",
    time: "9:00 AM",
    title: "Morning medicine",
    desc: "After breakfast",
    enabled: true,
  },
  {
    id: "call",
    time: "6:00 PM",
    title: "Call Priya",
    desc: "A friendly evening call",
    enabled: true,
  },
  {
    id: "memory",
    time: "2:00 PM",
    title: "Enjoy a memory",
    desc: "Look at a familiar photo or story",
    enabled: true,
  },
  {
    id: "game",
    time: "4:00 PM",
    title: "Play a daily game",
    desc: "Enjoy a gentle memory game",
    enabled: true,
  },
  {
    id: "activity",
    time: "5:00 PM",
    title: "Complete an activity",
    desc: "Take one small step in your daily plan",
    enabled: true,
  },
];

const REMINDER_PLAN_STORAGE_KEY = "silirual-reminder-plan";
const PERSONAL_PROFILE_STORAGE_KEY = "silirual-personal-profile";

const loadReminderPlan = (): PersonalReminder[] => {
  if (typeof window === "undefined") return DEFAULT_REMINDERS;
  try {
    const saved = JSON.parse(localStorage.getItem(REMINDER_PLAN_STORAGE_KEY) ?? "[]");
    return Array.isArray(saved) && saved.length
      ? saved.filter(
          (item) => item && typeof item.title === "string" && typeof item.time === "string",
        )
      : DEFAULT_REMINDERS;
  } catch {
    return DEFAULT_REMINDERS;
  }
};

const saveReminderPlan = (reminders: PersonalReminder[]) => {
  if (typeof window !== "undefined")
    localStorage.setItem(REMINDER_PLAN_STORAGE_KEY, JSON.stringify(reminders));
};

const loadPersonalProfile = (): PersonalProfile => {
  if (typeof window === "undefined") return { memories: [] };
  try {
    const saved = JSON.parse(localStorage.getItem(PERSONAL_PROFILE_STORAGE_KEY) ?? "{}");
    return {
      photo: typeof saved.photo === "string" ? saved.photo : undefined,
      memories: Array.isArray(saved.memories) ? saved.memories : [],
    };
  } catch {
    return { memories: [] };
  }
};

const savePersonalProfile = (profile: PersonalProfile) => {
  if (typeof window !== "undefined")
    localStorage.setItem(PERSONAL_PROFILE_STORAGE_KEY, JSON.stringify(profile));
};

const playGentleChime = () => {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.setValueAtTime(660, context.currentTime);
    oscillator.frequency.setValueAtTime(880, context.currentTime + 0.18);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.55);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.6);
  } catch {
    // Some devices block sound until a user interaction; the visual alert remains available.
  }
};

const showReminderNotification = (title: string, body: string) => {
  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    new Notification(title, { body, icon: "/favicon.png", tag: `silirual-${title}` });
  }
};

const loadGameProgress = (): SavedGameProgress => {
  if (typeof window === "undefined") return { scores: {}, recent: [] };
  try {
    const saved = JSON.parse(localStorage.getItem(GAME_PROGRESS_STORAGE_KEY) ?? "{}");
    return {
      scores: saved.scores && typeof saved.scores === "object" ? saved.scores : {},
      recent: Array.isArray(saved.recent) ? saved.recent : [],
    };
  } catch {
    return { scores: {}, recent: [] };
  }
};

const saveGameSession = (gameName: string, score: number, durationMinutes = 0) => {
  if (typeof window === "undefined") return;
  const current = loadGameProgress();
  const playedAt = Date.now();
  const previous = current.scores[gameName];
  const next: SavedGameProgress = {
    scores: {
      ...current.scores,
      [gameName]: {
        highScore: Math.max(previous?.highScore ?? 0, score),
        lastScore: score,
        lastPlayedAt: playedAt,
      },
    },
    recent: [{ gameName, score, playedAt, durationMinutes }, ...current.recent].slice(0, 6),
  };
  localStorage.setItem(GAME_PROGRESS_STORAGE_KEY, JSON.stringify(next));
  saveEngagement({
    category: "game",
    name: gameName,
    score,
    durationMinutes,
  });
};

const formatGameHistoryTime = (playedAt: number) => {
  const date = new Date(playedAt);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const CARD_EMOJIS = [
  "🍉",
  "🌸",
  "🎨",
  "🏠",
  "🌈",
  "🎭",
  "⭐",
  "🎪",
  "🦋",
  "🎵",
  "🍎",
  "🌺",
  "🎯",
  "🐱",
  "🌻",
  "🍕",
  "🎸",
  "🐶",
  "🌙",
  "🎂",
  "🦊",
  "🌴",
  "🎩",
  "🎲",
];

function HowToPlayModal({ onStart, onBack }: { onStart: () => void; onBack: () => void }) {
  const [slide, setSlide] = useState(0);
  const slides = [
    { text: "Tap two cards to flip them and reveal the pictures underneath." },
    { text: "If both cards match, they stay open! Try to find all pairs." },
    { text: "If the cards don't match, they flip back. Try to remember where each picture is!" },
    { text: "Match all pairs to complete the level. Use fewer moves for a better score!" },
  ];
  const total = slides.length;

  const renderIllustration = (idx: number) => {
    if (idx === 0)
      return (
        <div className="htp-illust">
          <div className="htp-stats-bar">
            <span className="htp-stat-pill">🎯 Moves: 0</span>
            <span className="htp-stat-pill">⭐ Pairs: 0/5</span>
          </div>
          <div className="htp-cards-demo">
            <span className="htp-demo-card htp-demo-back" />
            <span className="htp-demo-card htp-demo-back" />
            <span className="htp-demo-card htp-demo-back" />
            <span className="htp-demo-card htp-demo-back" />
            <span className="htp-demo-card htp-demo-front">🌸</span>
            <span className="htp-demo-card htp-demo-back" />
            <span className="htp-demo-card htp-demo-back" />
            <span className="htp-demo-card htp-demo-back" />
            <span className="htp-demo-card htp-demo-front">🎭</span>
          </div>
          <div className="htp-hand">👆</div>
        </div>
      );
    if (idx === 1)
      return (
        <div className="htp-illust">
          <div className="htp-stats-bar">
            <span className="htp-stat-pill">🎯 Moves: 1</span>
            <span className="htp-stat-pill">⭐ Pairs: 1/5</span>
          </div>
          <div className="htp-cards-demo">
            <span className="htp-demo-card htp-demo-back" />
            <span className="htp-demo-card htp-demo-back" />
            <span className="htp-demo-card htp-demo-back" />
            <span className="htp-demo-card htp-demo-match">🌸</span>
            <span className="htp-demo-card htp-demo-match">🌸</span>
            <span className="htp-demo-card htp-demo-back" />
            <span className="htp-demo-card htp-demo-back" />
            <span className="htp-demo-card htp-demo-back" />
            <span className="htp-demo-card htp-demo-back" />
          </div>
        </div>
      );
    if (idx === 2)
      return (
        <div className="htp-illust">
          <div className="htp-stats-bar">
            <span className="htp-stat-pill">🎯 Moves: 3</span>
            <span className="htp-stat-pill">⭐ Pairs: 1/5</span>
          </div>
          <div className="htp-cards-demo">
            <span className="htp-demo-card htp-demo-back" />
            <span className="htp-demo-card htp-demo-front">🎭</span>
            <span className="htp-demo-card htp-demo-back" />
            <span className="htp-demo-card htp-demo-back" />
            <span className="htp-demo-card htp-demo-back" />
            <span className="htp-demo-card htp-demo-back" />
            <span className="htp-demo-card htp-demo-back" />
            <span className="htp-demo-card htp-demo-front">🍉</span>
            <span className="htp-demo-card htp-demo-back" />
          </div>
          <div className="htp-hand">👆</div>
        </div>
      );
    return (
      <div className="htp-illust">
        <div className="htp-stats-bar">
          <span className="htp-stat-pill">🎯 Moves: 8</span>
          <span className="htp-stat-pill">⭐ Pairs: 5/5</span>
        </div>
        <div className="htp-cards-demo">
          <span className="htp-demo-card htp-demo-match">🍉</span>
        </div>
        <div className="htp-trophy">🏆</div>
      </div>
    );
  };

  return (
    <div className="htp-overlay">
      <div className="htp-modal">
        <h2 className="htp-title">HOW TO PLAY</h2>
        <div className="htp-slide">
          {renderIllustration(slide)}
          <p className="htp-text">{slides[slide].text}</p>
        </div>
        <div className="htp-dots">
          {slides.map((_, i) => (
            <span
              key={i}
              className={cn("htp-dot", i === slide && "htp-dot-active")}
              onClick={() => setSlide(i)}
            />
          ))}
        </div>
        <div className="htp-nav">
          <button
            className="htp-nav-btn"
            onClick={() => setSlide(Math.max(0, slide - 1))}
            aria-label="Previous slide"
          >
            ◀
          </button>
          <button className="htp-ok-btn" onClick={onStart}>
            OK
          </button>
          <button
            className="htp-nav-btn"
            onClick={() => setSlide(Math.min(total - 1, slide + 1))}
            aria-label="Next slide"
          >
            ▶
          </button>
        </div>
        <button className="htp-back-btn" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
}

function MemoryCardGame({ onClose }: { onClose: () => void }) {
  const sessionStartedAt = useRef(Date.now());
  const [phase, setPhase] = useState<"howToPlay" | "playing" | "levelComplete">("howToPlay");
  const [level, setLevel] = useState(1);
  const [cards, setCards] = useState<Array<{ id: number; emoji: string }>>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isHintActive, setIsHintActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [totalLevels, setTotalLevels] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);

  const pairsCount = level + 2;
  const sessionScore = Math.max(0, totalLevels * 100 + (matched.length / 2) * 10 - moves);
  const finishSession = () => {
    saveGameSession(
      "Picture Pairs",
      sessionScore,
      Math.max(1, Math.round((Date.now() - sessionStartedAt.current) / 60000)),
    );
    onClose();
  };

  const shuffleDeck = useCallback(() => {
    const count = level + 2;
    const emojis = CARD_EMOJIS.slice(0, count);
    const deck = [...emojis, ...emojis].map((emoji, idx) => ({ id: idx, emoji }));
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }, [level]);

  const startLevel = useCallback(() => {
    const deck = shuffleDeck();
    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setIsHintActive(false);
    setProcessing(false);
    setHintsUsed(0);
  }, [shuffleDeck]);

  useEffect(() => {
    if (phase === "playing") startLevel();
  }, [phase, level, startLevel]);

  // Check level complete
  useEffect(() => {
    if (cards.length > 0 && matched.length === cards.length && phase === "playing") {
      const t = setTimeout(() => {
        setTotalLevels((p) => p + 1);
        setPhase("levelComplete");
      }, 700);
      return () => clearTimeout(t);
    }
  }, [matched.length, cards.length, phase]);

  const handleCardClick = (id: number) => {
    if (processing || flipped.includes(id) || matched.includes(id) || flipped.length >= 2) return;
    if (isHintActive) setIsHintActive(false);

    const next = [...flipped, id];
    setFlipped(next);

    if (next.length === 2) {
      setMoves((m) => m + 1);
      setProcessing(true);
      setTimeout(() => {
        const [a, b] = next;
        if (cards[a].emoji === cards[b].emoji) {
          setMatched((prev) => [...prev, a, b]);
          setFlipped([]);
          setProcessing(false);
        } else {
          setFlipped([]);
          setProcessing(false);
        }
      }, 900);
    }
  };

  const useHint = () => {
    if (isHintActive || processing) return;
    const unmatchedCount = cards.length - matched.length;
    if (unmatchedCount === 0) return;

    setIsHintActive(true);
    setHintsUsed((prev) => prev + 1);
    setTimeout(() => setIsHintActive(false), 1500);
  };

  const getGridCols = () => {
    const total = cards.length;
    if (total <= 6) return 3;
    if (total <= 8) return 4;
    if (total <= 12) return 4;
    if (total <= 20) return 5;
    return 6;
  };

  if (phase === "howToPlay")
    return <HowToPlayModal onStart={() => setPhase("playing")} onBack={onClose} />;

  if (phase === "levelComplete") {
    const pairsFound = matched.length / 2;
    const stars = moves <= pairsCount ? 3 : moves <= pairsCount * 1.5 ? 2 : 1;
    return (
      <div className="mcg-screen">
        <div className="mcg-complete">
          <div className="mcg-complete-icon">🏆</div>
          <h1 className="mcg-complete-title">Level {level} Complete!</h1>
          <div className="mcg-stars">
            {"⭐".repeat(stars)}
            {"☆".repeat(3 - stars)}
          </div>
          <div className="mcg-complete-scores">
            <div className="mcg-cs-box">
              <strong>{pairsFound}</strong>
              <span>Pairs found</span>
            </div>
            <div className="mcg-cs-box">
              <strong>{moves}</strong>
              <span>Moves</span>
            </div>
          </div>
          <div className="mcg-complete-meta">
            <span>🏅 Levels done: {totalLevels}</span>
            <span>💡 Hints: {hintsUsed}</span>
          </div>
          <button
            className="mcg-btn mcg-btn-primary"
            onClick={() => {
              setLevel((l) => l + 1);
              setPhase("playing");
            }}
          >
            <Play /> Next Level → {level + 3} pairs
          </button>
          <button
            className="mcg-btn mcg-btn-replay"
            onClick={() => {
              setPhase("playing");
            }}
          >
            <RotateCcw /> Replay Level
          </button>
          <button className="mcg-btn mcg-btn-exit" onClick={finishSession}>
            <Home /> Exit to Games
          </button>
        </div>
      </div>
    );
  }

  const pairsFound = matched.length / 2;

  return (
    <div className="mcg-screen">
      <div className="mcg-topbar">
        <div className="mcg-stat">
          <span>🎯</span>
          <strong>{moves}</strong>
          <small>Moves</small>
        </div>
        <div className="mcg-level-pill">Level {level}</div>
        <div className="mcg-stat">
          <span>⭐</span>
          <strong>
            {pairsFound}/{pairsCount}
          </strong>
          <small>Pairs</small>
        </div>
      </div>
      <div className="mcg-board-wrap">
        <div className="mcg-board" style={{ gridTemplateColumns: `repeat(${getGridCols()}, 1fr)` }}>
          {cards.map((card, i) => {
            const isHint = isHintActive && !matched.includes(i);
            const isOpen = flipped.includes(i) || matched.includes(i) || isHint;
            const isMatch = matched.includes(i);
            return (
              <button
                key={i}
                className={cn(
                  "mcg-card",
                  isOpen && "mcg-card-open",
                  isMatch && "mcg-card-matched",
                  isHint && "mcg-card-hint",
                )}
                onClick={() => handleCardClick(i)}
                disabled={processing || isMatch}
              >
                <span className="mcg-card-inner">
                  {isOpen ? (
                    <span className="mcg-card-face">{card.emoji}</span>
                  ) : (
                    <span className="mcg-card-back-face" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="mcg-controls">
        <button className="mcg-ctrl" onClick={useHint} disabled={isHintActive || processing}>
          <Eye /> Hint
        </button>
        <button className="mcg-ctrl mcg-ctrl-exit" onClick={finishSession}>
          EXIT
        </button>
      </div>
    </div>
  );
}

/* ======== Pizza Memory Game ======== */

const PIZZA_TOPPINGS: Array<{ id: string; name: string; color: string; render: () => ReactNode }> =
  [
    {
      id: "pepperoni",
      name: "Pepperoni",
      color: "#c0392b",
      render: () => (
        <svg viewBox="0 0 40 40" width="40" height="40">
          <circle cx="20" cy="20" r="16" fill="#c0392b" stroke="#922b21" strokeWidth="2" />
          <circle cx="14" cy="14" r="2.5" fill="#922b21" />
          <circle cx="26" cy="16" r="2" fill="#922b21" />
          <circle cx="18" cy="26" r="2.5" fill="#922b21" />
          <circle cx="26" cy="25" r="1.5" fill="#922b21" />
        </svg>
      ),
    },
    {
      id: "tomato",
      name: "Tomato",
      color: "#e74c3c",
      render: () => (
        <svg viewBox="0 0 40 40" width="40" height="40">
          <path
            d="M8 22c0-8 5-14 12-14s12 6 12 14-5 12-12 12S8 30 8 22z"
            fill="#e74c3c"
            stroke="#c0392b"
            strokeWidth="2"
          />
          <path d="M20 8c-2-3-1-6 0-6s3 2 1 6" fill="#27ae60" stroke="#1e8449" strokeWidth="1" />
          <circle cx="16" cy="20" r="3" fill="#c0392b" opacity="0.5" />
          <circle cx="24" cy="22" r="2.5" fill="#c0392b" opacity="0.5" />
        </svg>
      ),
    },
    {
      id: "mushroom",
      name: "Mushroom",
      color: "#8d6e63",
      render: () => (
        <svg viewBox="0 0 40 40" width="40" height="40">
          <ellipse
            cx="20"
            cy="18"
            rx="14"
            ry="10"
            fill="#8d6e63"
            stroke="#5d4037"
            strokeWidth="2"
          />
          <rect
            x="16"
            y="18"
            width="8"
            height="14"
            rx="2"
            fill="#d7ccc8"
            stroke="#8d6e63"
            strokeWidth="1.5"
          />
          <ellipse cx="14" cy="16" rx="3" ry="2" fill="#5d4037" opacity="0.3" />
          <ellipse cx="24" cy="14" rx="2.5" ry="1.5" fill="#5d4037" opacity="0.3" />
        </svg>
      ),
    },
    {
      id: "bellpepper",
      name: "Bell Pepper",
      color: "#27ae60",
      render: () => (
        <svg viewBox="0 0 40 40" width="40" height="40">
          <path
            d="M10 20c0-6 4-12 10-12s10 6 10 12c0 8-4 14-10 14S10 28 10 20z"
            fill="#27ae60"
            stroke="#1e8449"
            strokeWidth="2"
          />
          <path d="M18 8c-1-3 0-5 2-5s3 2 2 5" fill="#2ecc71" stroke="#1e8449" strokeWidth="1" />
          <path d="M20 12v20" stroke="#1e8449" strokeWidth="1" opacity="0.4" />
        </svg>
      ),
    },
    {
      id: "onion",
      name: "Onion",
      color: "#8e44ad",
      render: () => (
        <svg viewBox="0 0 40 40" width="40" height="40">
          <ellipse
            cx="20"
            cy="22"
            rx="14"
            ry="10"
            fill="#d2b4de"
            stroke="#8e44ad"
            strokeWidth="2"
          />
          <ellipse
            cx="20"
            cy="22"
            rx="10"
            ry="7"
            fill="none"
            stroke="#8e44ad"
            strokeWidth="1.5"
            opacity="0.5"
          />
          <ellipse
            cx="20"
            cy="22"
            rx="6"
            ry="4"
            fill="none"
            stroke="#8e44ad"
            strokeWidth="1"
            opacity="0.4"
          />
        </svg>
      ),
    },
    {
      id: "olives",
      name: "Olives",
      color: "#2c3e50",
      render: () => (
        <svg viewBox="0 0 40 40" width="40" height="40">
          <ellipse
            cx="20"
            cy="20"
            rx="12"
            ry="10"
            fill="#2c3e50"
            stroke="#1a252f"
            strokeWidth="2"
          />
          <ellipse cx="20" cy="20" rx="5" ry="4" fill="#943126" stroke="#1a252f" strokeWidth="1" />
        </svg>
      ),
    },
    {
      id: "basil",
      name: "Basil",
      color: "#2ecc71",
      render: () => (
        <svg viewBox="0 0 40 40" width="40" height="40">
          <path
            d="M20 34c-8-4-14-12-10-20C14 6 20 4 20 4s6 2 10 10c4 8-2 16-10 20z"
            fill="#2ecc71"
            stroke="#1e8449"
            strokeWidth="2"
          />
          <path
            d="M20 8v24M14 16c3 2 6 2 12 0"
            stroke="#1e8449"
            strokeWidth="1.5"
            fill="none"
            opacity="0.5"
          />
        </svg>
      ),
    },
    {
      id: "jalapeno",
      name: "Jalapeño",
      color: "#1abc9c",
      render: () => (
        <svg viewBox="0 0 40 40" width="40" height="40">
          <path
            d="M12 28c-2-6 2-16 8-20 2-1 4 0 4 2 0 4-4 14-6 18-1 2-4 2-6 0z"
            fill="#1abc9c"
            stroke="#16a085"
            strokeWidth="2"
          />
          <path d="M20 8c1-3 3-5 4-4s0 3-1 5" fill="#2ecc71" stroke="#16a085" strokeWidth="1" />
        </svg>
      ),
    },
    {
      id: "cheese",
      name: "Cheese",
      color: "#f1c40f",
      render: () => (
        <svg viewBox="0 0 40 40" width="40" height="40">
          <path d="M6 28L20 8l14 20z" fill="#f1c40f" stroke="#d4ac0d" strokeWidth="2" />
          <circle cx="14" cy="24" r="2" fill="#d4ac0d" />
          <circle cx="22" cy="22" r="1.5" fill="#d4ac0d" />
          <circle cx="18" cy="18" r="1.5" fill="#d4ac0d" />
        </svg>
      ),
    },
    {
      id: "corn",
      name: "Corn",
      color: "#f39c12",
      render: () => (
        <svg viewBox="0 0 40 40" width="40" height="40">
          <ellipse cx="20" cy="20" rx="8" ry="14" fill="#f39c12" stroke="#d68910" strokeWidth="2" />
          <ellipse cx="16" cy="14" r="2" fill="#f1c40f" />
          <ellipse cx="24" cy="14" r="2" fill="#f1c40f" />
          <ellipse cx="16" cy="20" r="2" fill="#f1c40f" />
          <ellipse cx="24" cy="20" r="2" fill="#f1c40f" />
          <ellipse cx="16" cy="26" r="2" fill="#f1c40f" />
          <ellipse cx="24" cy="26" r="2" fill="#f1c40f" />
        </svg>
      ),
    },
    {
      id: "sausage",
      name: "Sausage",
      color: "#a04000",
      render: () => (
        <svg viewBox="0 0 40 40" width="40" height="40">
          <ellipse cx="20" cy="20" rx="14" ry="8" fill="#a04000" stroke="#7e2f00" strokeWidth="2" />
          <ellipse cx="14" cy="18" rx="2" ry="1" fill="#7e2f00" opacity="0.4" />
          <ellipse cx="24" cy="20" rx="3" ry="1.5" fill="#7e2f00" opacity="0.3" />
        </svg>
      ),
    },
    {
      id: "chicken",
      name: "Chicken",
      color: "#f0b27a",
      render: () => (
        <svg viewBox="0 0 40 40" width="40" height="40">
          <path
            d="M10 16c2-6 6-8 10-8s8 2 10 8c2 6-2 16-10 16S8 22 10 16z"
            fill="#f0b27a"
            stroke="#d68910"
            strokeWidth="2"
          />
          <path
            d="M14 18c2 0 4 2 6 0s4-2 6 0"
            stroke="#d68910"
            strokeWidth="1.5"
            fill="none"
            opacity="0.4"
          />
        </svg>
      ),
    },
  ];

const PIZZA_SLOTS: Array<{ x: number; y: number }> = [
  { x: 50, y: 18 },
  { x: 76, y: 30 },
  { x: 80, y: 58 },
  { x: 62, y: 78 },
  { x: 38, y: 78 },
  { x: 20, y: 58 },
  { x: 24, y: 30 },
  { x: 50, y: 48 },
];

function PizzaHowToPlayModal({ onStart, onBack }: { onStart: () => void; onBack: () => void }) {
  const [slide, setSlide] = useState(0);
  const slides = [
    { text: "Look at the pizza and memorize where the toppings are placed." },
    { text: "The toppings will be hidden. Try to remember their positions!" },
    { text: "Tap a topping from the tray, then tap where it goes on the pizza." },
    { text: "Place all toppings correctly to complete the round and earn stars!" },
  ];
  const total = slides.length;

  const renderIllustration = (idx: number) => {
    if (idx === 0)
      return (
        <div className="htp-illust" style={{ background: "#8B5E3C" }}>
          <div className="pmg-htp-pizza">
            <svg viewBox="0 0 120 120" width="100" height="100">
              <circle cx="60" cy="60" r="56" fill="#e74c3c" stroke="#2c2c2c" strokeWidth="4" />
              <circle cx="60" cy="60" r="46" fill="#f4d03f" stroke="#d4ac0d" strokeWidth="2" />
              <circle cx="40" cy="40" r="4" fill="#c0392b" />
              <circle cx="70" cy="35" r="3.5" fill="#27ae60" />
              <circle cx="80" cy="60" r="4" fill="#c0392b" />
              <circle cx="45" cy="72" r="3" fill="#8d6e63" />
            </svg>
          </div>
          <div className="htp-hand" style={{ bottom: "20px", right: "30px" }}>
            👀
          </div>
        </div>
      );
    if (idx === 1)
      return (
        <div className="htp-illust" style={{ background: "#8B5E3C" }}>
          <div className="pmg-htp-pizza">
            <svg viewBox="0 0 120 120" width="100" height="100">
              <circle cx="60" cy="60" r="56" fill="#e74c3c" stroke="#2c2c2c" strokeWidth="4" />
              <circle cx="60" cy="60" r="46" fill="#f4d03f" stroke="#d4ac0d" strokeWidth="2" />
              <circle
                cx="40"
                cy="40"
                r="6"
                fill="rgba(255,255,255,0.2)"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1"
                strokeDasharray="3 2"
              />
              <circle
                cx="70"
                cy="35"
                r="6"
                fill="rgba(255,255,255,0.2)"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1"
                strokeDasharray="3 2"
              />
              <circle
                cx="80"
                cy="60"
                r="6"
                fill="rgba(255,255,255,0.2)"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1"
                strokeDasharray="3 2"
              />
            </svg>
          </div>
          <div style={{ fontSize: "1.5em", marginTop: "4px" }}>🤔❓</div>
        </div>
      );
    if (idx === 2)
      return (
        <div className="htp-illust" style={{ background: "#8B5E3C" }}>
          <div className="pmg-htp-pizza" style={{ transform: "scale(0.8)" }}>
            <svg viewBox="0 0 120 120" width="100" height="100">
              <circle cx="60" cy="60" r="56" fill="#e74c3c" stroke="#2c2c2c" strokeWidth="4" />
              <circle cx="60" cy="60" r="46" fill="#f4d03f" stroke="#d4ac0d" strokeWidth="2" />
              <circle cx="40" cy="40" r="4" fill="#c0392b" />
            </svg>
          </div>
          <div className="pmg-htp-tray">
            <span className="pmg-htp-item" style={{ background: "#8d6e63" }} />
            <span className="pmg-htp-item" style={{ background: "#27ae60" }} />
            <span className="pmg-htp-item" style={{ background: "#c0392b" }} />
          </div>
          <div className="htp-hand">👆</div>
        </div>
      );
    return (
      <div className="htp-illust" style={{ background: "#8B5E3C" }}>
        <div className="pmg-htp-pizza">
          <svg viewBox="0 0 120 120" width="100" height="100">
            <circle cx="60" cy="60" r="56" fill="#e74c3c" stroke="#2c2c2c" strokeWidth="4" />
            <circle cx="60" cy="60" r="46" fill="#f4d03f" stroke="#d4ac0d" strokeWidth="2" />
            <circle cx="40" cy="40" r="4" fill="#c0392b" />
            <circle cx="70" cy="35" r="3.5" fill="#27ae60" />
            <circle cx="80" cy="60" r="4" fill="#c0392b" />
            <circle cx="45" cy="72" r="3" fill="#8d6e63" />
          </svg>
        </div>
        <div className="htp-trophy">🏆</div>
      </div>
    );
  };

  return (
    <div className="htp-overlay">
      <div className="htp-modal">
        <h2 className="htp-title">HOW TO PLAY</h2>
        <div className="htp-slide">
          {renderIllustration(slide)}
          <p className="htp-text">{slides[slide].text}</p>
        </div>
        <div className="htp-dots">
          {slides.map((_, i) => (
            <span
              key={i}
              className={cn("htp-dot", i === slide && "htp-dot-active")}
              onClick={() => setSlide(i)}
            />
          ))}
        </div>
        <div className="htp-nav">
          <button
            className="htp-nav-btn"
            onClick={() => setSlide(Math.max(0, slide - 1))}
            aria-label="Previous slide"
          >
            ◀
          </button>
          <button className="htp-ok-btn" onClick={onStart}>
            OK
          </button>
          <button
            className="htp-nav-btn"
            onClick={() => setSlide(Math.min(total - 1, slide + 1))}
            aria-label="Next slide"
          >
            ▶
          </button>
        </div>
        <button className="htp-back-btn" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
}

function PizzaMemoryGame({ onClose }: { onClose: () => void }) {
  const sessionStartedAt = useRef(Date.now());
  const [phase, setPhase] = useState<"howToPlay" | "memorize" | "assemble" | "roundComplete">(
    "howToPlay",
  );
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [countdown, setCountdown] = useState(0);

  // Current round data
  const [targetSlots, setTargetSlots] = useState<Array<{ slotIdx: number; toppingId: string }>>([]);
  const [trayItems, setTrayItems] = useState<string[]>([]);
  const [placedToppings, setPlacedToppings] = useState<
    Map<number, { toppingId: string; correct: boolean }>
  >(new Map());
  const [selectedTopping, setSelectedTopping] = useState<string | null>(null);
  const [correctFirst, setCorrectFirst] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [roundScore, setRoundScore] = useState(0);
  const [failedSlots, setFailedSlots] = useState<Set<number>>(new Set());
  const finishSession = () => {
    saveGameSession(
      "Pizza Memory",
      score + roundScore,
      Math.max(1, Math.round((Date.now() - sessionStartedAt.current) / 60000)),
    );
    onClose();
  };

  const getToppingCount = () => Math.min(level + 2, 8);
  const getDistractorCount = () => (level <= 1 ? 0 : level <= 3 ? 1 : level <= 4 ? 2 : 3);
  const getMemorizeTime = () =>
    level <= 1 ? 7 : level <= 2 ? 6 : level <= 3 ? 5 : level <= 4 ? 5 : 4;

  const startRound = useCallback(() => {
    const count = getToppingCount();
    const distractors = getDistractorCount();

    // Pick random slots
    const shuffledSlots = [...Array(PIZZA_SLOTS.length).keys()].sort(() => Math.random() - 0.5);
    const chosenSlots = shuffledSlots.slice(0, count);

    // Pick random toppings
    const shuffledToppings = [...PIZZA_TOPPINGS].sort(() => Math.random() - 0.5);
    const chosen = shuffledToppings.slice(0, count);

    const targets = chosenSlots.map((slotIdx, i) => ({ slotIdx, toppingId: chosen[i].id }));
    setTargetSlots(targets);

    // Build tray: the correct toppings + distractors
    const correctIds = chosen.map((t) => t.id);
    const remaining = shuffledToppings.slice(count, count + distractors).map((t) => t.id);
    const tray = [...correctIds, ...remaining].sort(() => Math.random() - 0.5);
    setTrayItems(tray);

    setPlacedToppings(new Map());
    setSelectedTopping(null);
    setCorrectFirst(0);
    setTotalAttempts(0);
    setRoundScore(0);
    setFailedSlots(new Set());

    // Start memorize phase
    setCountdown(getMemorizeTime());
    setPhase("memorize");
  }, [level]);

  // Countdown timer for memorize phase
  useEffect(() => {
    if (phase !== "memorize" || countdown <= 0) return;
    const t = setTimeout(() => {
      if (countdown <= 1) {
        setPhase("assemble");
        setCountdown(0);
      } else {
        setCountdown((c) => c - 1);
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // Check round complete
  useEffect(() => {
    if (phase !== "assemble" || targetSlots.length === 0) return;
    const allPlaced = targetSlots.every((t) => {
      const placed = placedToppings.get(t.slotIdx);
      return placed && placed.correct;
    });
    if (allPlaced) {
      const t = setTimeout(() => setPhase("roundComplete"), 600);
      return () => clearTimeout(t);
    }
  }, [placedToppings, targetSlots, phase]);

  const handleTrayTap = (toppingId: string) => {
    if (phase !== "assemble") return;
    setSelectedTopping((prev) => (prev === toppingId ? null : toppingId));
  };

  const handleSlotTap = (slotIdx: number) => {
    if (phase !== "assemble" || !selectedTopping) return;

    // Check if this slot already has a correct topping
    const existing = placedToppings.get(slotIdx);
    if (existing && existing.correct) return;

    const target = targetSlots.find((t) => t.slotIdx === slotIdx);
    if (!target) return; // Not a valid target slot

    const isCorrect = target.toppingId === selectedTopping;
    setTotalAttempts((prev) => prev + 1);

    const newPlaced = new Map(placedToppings);
    newPlaced.set(slotIdx, { toppingId: selectedTopping, correct: isCorrect });
    setPlacedToppings(newPlaced);

    // ALWAYS remove the placed topping from the tray
    setTrayItems((prev) => {
      const idx = prev.indexOf(selectedTopping!);
      if (idx >= 0) {
        const n = [...prev];
        n.splice(idx, 1);
        return n;
      }
      return prev;
    });

    if (isCorrect) {
      if (!failedSlots.has(slotIdx)) {
        setCorrectFirst((prev) => prev + 1);
        setRoundScore((prev) => prev + 10);
      } else {
        setRoundScore((prev) => prev + 5);
      }
    } else {
      setFailedSlots((prev) => new Set(prev).add(slotIdx));
    }

    setSelectedTopping(null);
  };

  const handleRemovePlaced = (slotIdx: number) => {
    if (phase !== "assemble") return;
    const existing = placedToppings.get(slotIdx);
    if (!existing || existing.correct) return; // Can't remove correct placements

    // Put topping back in tray
    setTrayItems((prev) => [...prev, existing.toppingId]);
    const newPlaced = new Map(placedToppings);
    newPlaced.delete(slotIdx);
    setPlacedToppings(newPlaced);
  };

  const getTopping = (id: string) => PIZZA_TOPPINGS.find((t) => t.id === id);

  if (phase === "howToPlay")
    return <PizzaHowToPlayModal onStart={() => startRound()} onBack={onClose} />;

  if (phase === "roundComplete") {
    const accuracy =
      targetSlots.length > 0 ? Math.round((correctFirst / targetSlots.length) * 100) : 0;
    const stars = accuracy >= 90 ? 3 : accuracy >= 60 ? 2 : 1;
    const newScore = score + roundScore;
    return (
      <div className="pmg-screen">
        <div className="mcg-complete">
          <div className="mcg-complete-icon">🍕</div>
          <h1 className="mcg-complete-title">Round {round} Complete!</h1>
          <div className="mcg-stars">
            {"⭐".repeat(stars)}
            {"☆".repeat(3 - stars)}
          </div>
          <div className="mcg-complete-scores">
            <div className="mcg-cs-box">
              <strong>+{roundScore}</strong>
              <span>Score</span>
            </div>
            <div className="mcg-cs-box">
              <strong>{accuracy}%</strong>
              <span>Accuracy</span>
            </div>
          </div>
          <div className="mcg-complete-meta">
            <span>🏅 Level {level}</span>
            <span>🍕 Total: {newScore}</span>
          </div>
          <button
            className="mcg-btn mcg-btn-primary"
            onClick={() => {
              setScore(newScore);
              setLevel((l) => l + 1);
              setRound((r) => r + 1);
              startRound();
            }}
          >
            <Play /> Next Level
          </button>
          <button
            className="mcg-btn mcg-btn-replay"
            onClick={() => {
              setScore(score);
              startRound();
            }}
          >
            <RotateCcw /> Replay
          </button>
          <button className="mcg-btn mcg-btn-exit" onClick={finishSession}>
            <Home /> Exit to Games
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pmg-screen">
      <div className="mcg-topbar">
        <div className="mcg-stat">
          <span>🏆</span>
          <strong>{score}</strong>
          <small>Score</small>
        </div>
        <div className="mcg-level-pill">Level {level}</div>
        <div className="mcg-stat">
          <span>🍕</span>
          <strong>{round}</strong>
          <small>Round</small>
        </div>
      </div>

      {phase === "memorize" && (
        <div className="pmg-countdown-bar">
          <span>Memorize! {countdown}s</span>
          <div className="pmg-countdown-track">
            <div
              className="pmg-countdown-fill"
              style={{ width: `${(countdown / getMemorizeTime()) * 100}%` }}
            />
          </div>
        </div>
      )}

      {phase === "assemble" && (
        <div className="pmg-assemble-hint">
          {selectedTopping
            ? `Tap a slot to place ${getTopping(selectedTopping)?.name}`
            : "Tap a topping, then tap a slot on the pizza"}
        </div>
      )}

      <div className="pmg-pizza-area">
        <div className="pmg-pizza">
          <svg viewBox="0 0 200 200" className="pmg-pizza-svg">
            {/* Crust */}
            <circle cx="100" cy="100" r="96" fill="#e74c3c" stroke="#2c2c2c" strokeWidth="4" />
            {/* Cheese base */}
            <circle cx="100" cy="100" r="80" fill="#f4d03f" stroke="#d4ac0d" strokeWidth="2" />
            {/* Cheese spots */}
            <circle cx="60" cy="70" r="8" fill="#e8c72a" opacity="0.4" />
            <circle cx="130" cy="90" r="10" fill="#e8c72a" opacity="0.3" />
            <circle cx="90" cy="130" r="7" fill="#e8c72a" opacity="0.35" />
            <circle cx="110" cy="60" r="6" fill="#e8c72a" opacity="0.3" />
          </svg>

          {/* Slot markers and toppings */}
          {targetSlots.map((target) => {
            const slot = PIZZA_SLOTS[target.slotIdx];
            const placed = placedToppings.get(target.slotIdx);
            const topping =
              phase === "memorize"
                ? getTopping(target.toppingId)
                : placed
                  ? getTopping(placed.toppingId)
                  : null;

            return (
              <button
                key={target.slotIdx}
                className={cn(
                  "pmg-slot",
                  phase === "assemble" && !placed && "pmg-slot-empty",
                  phase === "assemble" && selectedTopping && !placed && "pmg-slot-target",
                  placed && placed.correct && "pmg-slot-correct",
                  placed && !placed.correct && "pmg-slot-wrong",
                )}
                style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                onClick={() => {
                  if (phase === "assemble") {
                    if (placed && !placed.correct) handleRemovePlaced(target.slotIdx);
                    else handleSlotTap(target.slotIdx);
                  }
                }}
                disabled={phase === "memorize"}
              >
                {topping && <span className="pmg-slot-topping">{topping.render()}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {phase === "assemble" && (
        <div className="pmg-tray">
          {trayItems.map((toppingId, i) => {
            const topping = getTopping(toppingId);
            if (!topping) return null;
            return (
              <button
                key={`${toppingId}-${i}`}
                className={cn(
                  "pmg-tray-item",
                  selectedTopping === toppingId && "pmg-tray-selected",
                )}
                onClick={() => handleTrayTap(toppingId)}
              >
                {topping.render()}
                <small>{topping.name}</small>
              </button>
            );
          })}
        </div>
      )}

      <div className="mcg-controls">
        <button className="mcg-ctrl mcg-ctrl-exit" onClick={finishSession}>
          EXIT
        </button>
      </div>
    </div>
  );
}

/* ======== 3 Cups & 1 Ball Game ======== */

function CupsHowToPlayModal({ onStart, onBack }: { onStart: () => void; onBack: () => void }) {
  const [slide, setSlide] = useState(0);
  const slides = [
    { text: "Remember which cup is hiding the ball." },
    { text: "The cups will move and swap positions. Keep your eyes on the ball's cup." },
    { text: "When the movement stops, select the cup hiding the ball." },
    { text: "Remember the ball, follow the movement, and improve your score." },
  ];
  const total = slides.length;

  const renderCup = (color: string) => (
    <svg viewBox="0 0 100 120" className="cmg-htp-cup">
      <path
        d="M20 10 L80 10 L90 110 L10 110 Z"
        fill={color}
        stroke="#2c2c2c"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <ellipse cx="50" cy="110" rx="40" ry="8" fill={color} stroke="#2c2c2c" strokeWidth="4" />
      <ellipse cx="50" cy="10" rx="30" ry="6" fill="#1a1a1a" stroke="#2c2c2c" strokeWidth="4" />
    </svg>
  );

  const renderBall = () => (
    <svg viewBox="0 0 40 40" className="cmg-htp-ball">
      <circle cx="20" cy="20" r="16" fill="#e74c3c" stroke="#c0392b" strokeWidth="3" />
      <circle cx="14" cy="14" r="4" fill="#ff7979" opacity="0.8" />
    </svg>
  );

  const renderIllustration = (idx: number) => {
    if (idx === 0)
      return (
        <div className="htp-illust" style={{ background: "#3B5B88" }}>
          <div className="cmg-htp-demo-area">
            <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
              <div className="cmg-htp-cup lifted" style={{ position: "relative", zIndex: 10 }}>
                {renderCup("#f4d03f")}
              </div>
              {renderBall()}
            </div>
            <div className="cmg-htp-cup">{renderCup("#f4d03f")}</div>
            <div className="cmg-htp-cup">{renderCup("#f4d03f")}</div>
          </div>
          <div className="htp-hand" style={{ bottom: "20px", right: "30px" }}>
            👀
          </div>
        </div>
      );
    if (idx === 1)
      return (
        <div className="htp-illust" style={{ background: "#3B5B88" }}>
          <div className="cmg-htp-demo-area">
            <div className="cmg-htp-cup" style={{ transform: "translateX(30px)" }}>
              {renderCup("#f4d03f")}
            </div>
            <div className="cmg-htp-cup" style={{ transform: "translateX(-30px)", zIndex: 5 }}>
              {renderCup("#f4d03f")}
            </div>
            <div className="cmg-htp-cup">{renderCup("#f4d03f")}</div>
          </div>
          <div style={{ fontSize: "1.5em", marginTop: "4px" }}>🔄</div>
        </div>
      );
    if (idx === 2)
      return (
        <div className="htp-illust" style={{ background: "#3B5B88" }}>
          <div className="cmg-htp-demo-area">
            <div className="cmg-htp-cup">{renderCup("#f4d03f")}</div>
            <div className="cmg-htp-cup">{renderCup("#f4d03f")}</div>
            <div className="cmg-htp-cup">{renderCup("#f4d03f")}</div>
          </div>
          <div
            className="htp-hand"
            style={{ bottom: "40px", left: "50%", transform: "translateX(-50%)" }}
          >
            👆
          </div>
        </div>
      );
    return (
      <div className="htp-illust" style={{ background: "#3B5B88" }}>
        <div className="cmg-htp-demo-area">
          <div className="cmg-htp-cup">{renderCup("#f4d03f")}</div>
          <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
            <div className="cmg-htp-cup lifted" style={{ position: "relative", zIndex: 10 }}>
              {renderCup("#f4d03f")}
            </div>
            {renderBall()}
          </div>
          <div className="cmg-htp-cup">{renderCup("#f4d03f")}</div>
        </div>
        <div className="htp-trophy">🏆</div>
      </div>
    );
  };

  return (
    <div className="htp-overlay">
      <div className="htp-modal">
        <h2 className="htp-title">HOW TO PLAY</h2>
        <div className="htp-slide">
          {renderIllustration(slide)}
          <p className="htp-text">{slides[slide].text}</p>
        </div>
        <div className="htp-dots">
          {slides.map((_, i) => (
            <span
              key={i}
              className={cn("htp-dot", i === slide && "htp-dot-active")}
              onClick={() => setSlide(i)}
            />
          ))}
        </div>
        <div className="htp-nav">
          <button
            className="htp-nav-btn"
            onClick={() => setSlide(Math.max(0, slide - 1))}
            aria-label="Previous slide"
          >
            ◀
          </button>
          <button className="htp-ok-btn" onClick={onStart}>
            OK
          </button>
          <button
            className="htp-nav-btn"
            onClick={() => setSlide(Math.min(total - 1, slide + 1))}
            aria-label="Next slide"
          >
            ▶
          </button>
        </div>
        <button className="htp-back-btn" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
}

function CupsMemoryGame({ onClose }: { onClose: () => void }) {
  const sessionStartedAt = useRef(Date.now());
  const [phase, setPhase] = useState<"howToPlay" | "memorize" | "shuffle" | "guess" | "reveal">(
    "howToPlay",
  );
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);

  const [cups, setCups] = useState<{ id: number; pos: number; color: string }[]>([]);
  const [isLifted, setIsLifted] = useState(false);
  const [selectedPos, setSelectedPos] = useState<number | null>(null);
  const [correctPos, setCorrectPos] = useState<number>(0);
  const finishSession = () => {
    saveGameSession(
      "3 Cups & 1 Ball",
      score,
      Math.max(1, Math.round((Date.now() - sessionStartedAt.current) / 60000)),
    );
    onClose();
  };

  const getSpeedMs = () => Math.max(300, 800 - level * 50);
  const getSwapCount = () => Math.min(15, 3 + Math.floor(level * 1.5));
  const getMemorizeTime = () => Math.max(1500, 6000 - level * 500);

  const startRound = useCallback(() => {
    // All cups must be identical so the player actually has to follow them!
    const cupColors = ["#f4d03f", "#f4d03f", "#f4d03f"];
    const initialPositions = [0, 1, 2].sort(() => Math.random() - 0.5);
    const initialCups = [
      { id: 0, pos: initialPositions[0], color: cupColors[0] },
      { id: 1, pos: initialPositions[1], color: cupColors[1] },
      { id: 2, pos: initialPositions[2], color: cupColors[2] },
    ];

    setCups(initialCups);
    setCorrectPos(initialPositions[0]);
    setSelectedPos(null);
    setIsLifted(true);
    setPhase("memorize");

    setTimeout(() => {
      setIsLifted(false);
      setTimeout(() => {
        setPhase("shuffle");
      }, 500);
    }, getMemorizeTime());
  }, [level]);

  useEffect(() => {
    if (phase === "shuffle") {
      let currentCups = [...cups];
      let swapsLeft = getSwapCount();
      const speed = getSpeedMs();

      const shuffleInterval = setInterval(() => {
        if (swapsLeft <= 0) {
          clearInterval(shuffleInterval);
          setPhase("guess");
          return;
        }

        const posA = Math.floor(Math.random() * 3);
        let posB = Math.floor(Math.random() * 3);
        while (posA === posB) {
          posB = Math.floor(Math.random() * 3);
        }

        const newCups = currentCups.map((cup) => {
          if (cup.pos === posA) return { ...cup, pos: posB };
          if (cup.pos === posB) return { ...cup, pos: posA };
          return cup;
        });

        currentCups = newCups;
        setCups(newCups);
        swapsLeft--;

        const ballCup = newCups.find((c) => c.id === 0);
        if (ballCup) setCorrectPos(ballCup.pos);
      }, speed);

      return () => clearInterval(shuffleInterval);
    }
  }, [phase]);

  const handleCupTap = (pos: number) => {
    if (phase !== "guess") return;

    setSelectedPos(pos);
    setIsLifted(true);
    setPhase("reveal");

    const isCorrect = pos === correctPos;
    if (isCorrect) {
      setScore((s) => s + 10);
    }

    setTimeout(() => {
      setRound((r) => r + 1);
      if (round % 3 === 0) {
        setLevel((l) => l + 1);
      }
      startRound();
    }, 2500);
  };

  const renderGameCup = (color: string) => (
    <svg viewBox="0 0 100 120" className="cmg-cup-svg">
      <path
        d="M20 10 L80 10 L90 110 L10 110 Z"
        fill={color}
        stroke="#2c2c2c"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <ellipse cx="50" cy="110" rx="40" ry="8" fill={color} stroke="#2c2c2c" strokeWidth="4" />
      <ellipse cx="50" cy="10" rx="30" ry="6" fill="#1a1a1a" stroke="#2c2c2c" strokeWidth="4" />
    </svg>
  );

  const renderGameBall = () => (
    <svg viewBox="0 0 40 40" className="cmg-ball-svg" style={{ width: "100%", height: "100%" }}>
      <circle cx="20" cy="20" r="16" fill="#e74c3c" stroke="#c0392b" strokeWidth="3" />
      <circle cx="14" cy="14" r="4" fill="#ff7979" opacity="0.8" />
    </svg>
  );

  if (phase === "howToPlay")
    return <CupsHowToPlayModal onStart={() => startRound()} onBack={onClose} />;

  return (
    <div className="cmg-screen">
      <div className="mcg-topbar">
        <div className="mcg-stat">
          <span>🏆</span>
          <strong>{score}</strong>
          <small>Score</small>
        </div>
        <div className="mcg-level-pill">Level {level}</div>
        <div className="mcg-stat">
          <span>🎯</span>
          <strong>{round}</strong>
          <small>Round</small>
        </div>
      </div>

      <div className="cmg-play-area">
        <div className="cmg-message">
          {phase === "memorize" && "Keep your eyes on the ball!"}
          {phase === "shuffle" && "Follow the cup..."}
          {phase === "guess" && "Which cup has the ball?"}
          {phase === "reveal" &&
            (selectedPos === correctPos ? "Correct! +10 Points" : "Oops, it was here!")}
        </div>

        <div className="cmg-table">
          <div
            className={cn("cmg-ball", isLifted && "cmg-ball-visible")}
            style={{ left: `calc(50% + ${(correctPos - 1) * 90}px)` }}
          >
            {renderGameBall()}
          </div>

          {cups.map((cup) => {
            const isTargetCup = cup.id === 0;
            const isSelected = selectedPos === cup.pos;
            const isLiftedState =
              phase === "memorize" || (phase === "reveal" && (isSelected || isTargetCup));

            return (
              <div
                key={cup.id}
                className={cn(
                  "cmg-cup-wrapper",
                  `cmg-cup-pos-${cup.pos}`,
                  isLiftedState && "cmg-cup-lifted",
                  phase === "guess" && "cmg-cup-hoverable",
                  phase === "reveal" && isSelected && isTargetCup && "cmg-cup-correct",
                  phase === "reveal" && isSelected && !isTargetCup && "cmg-cup-wrong",
                )}
                style={{ transitionDuration: `${getSpeedMs() * 0.9}ms` }}
                onClick={() => handleCupTap(cup.pos)}
              >
                {renderGameCup(cup.color)}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mcg-controls" style={{ marginTop: "auto" }}>
        <button className="mcg-ctrl mcg-ctrl-exit" onClick={finishSession}>
          EXIT
        </button>
      </div>
    </div>
  );
}
/* ======== Picture Puzzle Game ======== */

type PuzzleImage = {
  id: string;
  src: string;
  label: string;
  complexity: number;
};

// This offline illustration is only used when a photo cannot be fetched. It keeps the
// round playable instead of leaving the player on a permanent "Preparing picture" screen.
const PUZZLE_FALLBACK_IMAGE: PuzzleImage = {
  id: "offline-picture",
  src:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 900'%3E%3Cdefs%3E%3ClinearGradient id='sky' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop stop-color='%2397d8f5'/%3E%3Cstop offset='1' stop-color='%23fef0bd'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='900' fill='url(%23sky)'/%3E%3Cpath d='M0 520 240 290l170 170 210-250 310 330 170-150 100 90v420H0Z' fill='%23518173'/%3E%3Cpath d='M0 610 230 440l200 180 250-140 220 130 297-100v390H0Z' fill='%233f744f'/%3E%3Cpath d='M0 700c160-80 300-10 430 0s240-80 400-20 240 20 370-30v250H0Z' fill='%237faf55'/%3E%3Ccircle cx='910' cy='160' r='70' fill='%23ffd568'/%3E%3Cpath d='M795 655h260v-190l-130-90-130 90Z' fill='%238a5a3e'/%3E%3Cpath d='M765 475h320L925 365Z' fill='%23513a35'/%3E%3Crect x='885' y='545' width='70' height='110' fill='%23f5d79e'/%3E%3C/svg%3E",
  label: "Scenic hills",
  complexity: 1,
};

// The local welcome image keeps the first round available with the app bundle. The remaining
// sample images are public stock / Wikimedia references and can be replaced with consented
// family pictures later without changing the puzzle engine.
const PUZZLE_IMAGE_POOL: PuzzleImage[] = [
  {
    id: "northeast-riverside-home",
    src: northeastWelcome,
    label: "Northeast riverside home",
    complexity: 1,
  },
  {
    id: "family-garden",
    src: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=85",
    label: "Family garden moment",
    complexity: 1,
  },
  {
    id: "family-walk",
    src: "https://images.unsplash.com/photo-1542038382126-77ae2819338d?auto=format&fit=crop&w=1200&q=85",
    label: "Family outdoor moment",
    complexity: 2,
  },
  {
    id: "family-celebration",
    src: "https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1200&q=85",
    label: "Family celebration",
    complexity: 3,
  },
  {
    id: "living-root-bridge",
    src: "https://upload.wikimedia.org/wikipedia/commons/2/22/Ancient_Root_Bridge%2C_Mawlynnong%2C_Meghalaya%2C_India.jpg",
    label: "Living root bridge, Meghalaya",
    complexity: 2,
  },
  {
    id: "northeast-forest",
    src: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=85",
    label: "Forest pathway",
    complexity: 3,
  },
  {
    id: "northeast-mountains",
    src: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85",
    label: "Mountain landscape",
    complexity: 4,
  },
  {
    id: "heritage-architecture",
    src: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=85",
    label: "Indian heritage architecture",
    complexity: 4,
  },
];

type PuzzleLayout = { columns: number; rows: number };
type PuzzlePhase =
  "howToPlay" | "preview" | "puzzle" | "hintPreview" | "roundComplete" | "imageExhausted";
type PuzzleDrag = {
  pointerId: number;
  origin: number;
  piece: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  target: number | null;
  moved: boolean;
};

const getPuzzleLayout = (level: number): PuzzleLayout => {
  if (level === 1) return { columns: 2, rows: 2 };
  if (level === 2) return { columns: 3, rows: 2 };
  if (level === 3) return { columns: 3, rows: 3 };
  if (level === 4) return { columns: 4, rows: 3 };
  if (level === 5) return { columns: 4, rows: 4 };
  if (level === 6) return { columns: 5, rows: 4 };
  return { columns: 5, rows: 5 };
};

const shuffledPuzzleSlots = (count: number) => {
  const pieces = Array.from({ length: count }, (_, index) => index);
  let shuffled = [...pieces];
  let isDerangement = false;
  // A derangement makes the first board a real puzzle: no piece starts in its own position.
  for (let attempt = 0; attempt < 12; attempt += 1) {
    shuffled = [...pieces].sort(() => Math.random() - 0.5);
    if (shuffled.every((piece, index) => piece !== index)) {
      isDerangement = true;
      break;
    }
  }
  return isDerangement ? shuffled : pieces.map((_, index) => (index + 1) % count);
};

function PicturePuzzleHowToPlayModal({
  onStart,
  onBack,
}: {
  onStart: () => void;
  onBack: () => void;
}) {
  const [slide, setSlide] = useState(0);
  const slides = [
    { heading: "Remember the Picture", text: "Look carefully and remember the complete picture." },
    { heading: "Move the Pieces", text: "Drag each piece to rebuild the picture." },
    {
      heading: "Use Hint",
      text: "Need help? Use Hint to see the original picture for a few seconds.",
    },
    {
      heading: "Complete the Picture",
      text: "Place all the pieces correctly to finish the puzzle.",
    },
  ];

  const renderIllustration = (index: number) => (
    <div className="htp-illust ppg-tutorial-illust">
      <div className={cn("ppg-tutorial-picture", index === 3 && "ppg-tutorial-picture-complete")}>
        <img src={northeastWelcome} alt="" />
        {index === 1 && <span className="ppg-tutorial-piece ppg-tutorial-piece-moving" />}
        {index === 2 && <span className="ppg-tutorial-hint-card">HINT</span>}
        {index === 3 && <span className="ppg-tutorial-tick">✓</span>}
      </div>
      {index === 0 && <div className="htp-hand">👀</div>}
      {index === 1 && <div className="htp-hand">👆</div>}
      {index === 2 && <div className="ppg-tutorial-eye">👁</div>}
      {index === 3 && <div className="htp-trophy">🏆</div>}
    </div>
  );

  return (
    <div className="htp-overlay">
      <div className="htp-modal">
        <h2 className="htp-title">HOW TO PLAY</h2>
        <div className="htp-slide">
          {renderIllustration(slide)}
          <h3 className="ppg-tutorial-heading">{slides[slide].heading}</h3>
          <p className="htp-text">{slides[slide].text}</p>
        </div>
        <div className="htp-dots">
          {slides.map((_, index) => (
            <button
              type="button"
              key={index}
              className={cn("htp-dot", index === slide && "htp-dot-active")}
              onClick={() => setSlide(index)}
              aria-label={`Tutorial step ${index + 1}`}
            />
          ))}
        </div>
        <div className="htp-nav">
          <button
            className="htp-nav-btn"
            onClick={() => setSlide(Math.max(0, slide - 1))}
            aria-label="Previous slide"
          >
            ◀
          </button>
          <button className="htp-ok-btn" onClick={onStart}>
            OK
          </button>
          <button
            className="htp-nav-btn"
            onClick={() => setSlide(Math.min(slides.length - 1, slide + 1))}
            aria-label="Next slide"
          >
            ▶
          </button>
        </div>
        <button className="htp-back-btn" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
}

function PicturePuzzleGame({ onClose }: { onClose: () => void }) {
  const sessionStartedAt = useRef(Date.now());
  const [phase, setPhase] = useState<PuzzlePhase>("howToPlay");
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [round, setRound] = useState(1);
  const [layout, setLayout] = useState<PuzzleLayout>(() => getPuzzleLayout(1));
  const [image, setImage] = useState<PuzzleImage>(PUZZLE_IMAGE_POOL[0]);
  const [slots, setSlots] = useState<number[]>([]);
  const [fixedSlots, setFixedSlots] = useState<Set<number>>(new Set());
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [dragging, setDragging] = useState<PuzzleDrag | null>(null);
  const [previewSeconds, setPreviewSeconds] = useState(0);
  const [imageReady, setImageReady] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [correctPlacements, setCorrectPlacements] = useState(0);
  const [roundScore, setRoundScore] = useState(0);
  const [hintUses, setHintUses] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const floatingPieceRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<PuzzleDrag | null>(null);
  const dragFrameRef = useRef<number | null>(null);
  const pendingDragPositionRef = useRef<{ x: number; y: number } | null>(null);
  const usedImageIdsRef = useRef<Set<string>>(new Set());
  const finishSession = () => {
    saveGameSession(
      "Picture Puzzle",
      score + roundScore,
      Math.max(1, Math.round((Date.now() - sessionStartedAt.current) / 60000)),
    );
    onClose();
  };

  const pieceCount = layout.columns * layout.rows;
  const previewDuration = (targetLevel: number) =>
    Math.max(4, 7 - Math.floor((targetLevel - 1) / 2));
  const hintDuration = () => Math.max(2, 3 - Math.floor((level - 1) / 4));

  const chooseImage = (targetLevel: number) => {
    const allowedComplexity = Math.min(4, Math.ceil(targetLevel / 2));
    const unusedImages = PUZZLE_IMAGE_POOL.filter((item) => !usedImageIdsRef.current.has(item.id));
    const levelChoices = unusedImages.filter((item) => item.complexity <= allowedComplexity);
    // Prefer pictures suited to the current level, but never repeat a picture just
    // because the player wants another round at the same difficulty.
    const choices = levelChoices.length > 0 ? levelChoices : unusedImages;
    if (choices.length === 0) return null;
    const nextImage = choices[Math.floor(Math.random() * choices.length)];
    usedImageIdsRef.current.add(nextImage.id);
    return nextImage;
  };

  const startRound = useCallback(
    (targetLevel = level) => {
      const nextLayout = getPuzzleLayout(targetLevel);
      const count = nextLayout.columns * nextLayout.rows;
      const nextImage = chooseImage(targetLevel);
      if (!nextImage) {
        setPhase("imageExhausted");
        return;
      }
      setLayout(nextLayout);
      setImage(nextImage);
      setSlots(shuffledPuzzleSlots(count));
      setFixedSlots(new Set());
      setSelectedSlot(null);
      setDragging(null);
      dragRef.current = null;
      setAttempts(0);
      setCorrectPlacements(0);
      setRoundScore(0);
      setHintUses(0);
      setImageReady(false);
      setPreviewSeconds(previewDuration(targetLevel));
      setPhase("preview");
    },
    [level],
  );

  useEffect(() => {
    if ((phase !== "preview" && phase !== "hintPreview") || !imageReady || previewSeconds <= 0)
      return;
    const timer = window.setTimeout(() => {
      if (previewSeconds === 1) {
        setPreviewSeconds(0);
        setPhase("puzzle");
      } else {
        setPreviewSeconds((value) => value - 1);
      }
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [imageReady, phase, previewSeconds]);

  useEffect(() => {
    if (phase !== "puzzle" || fixedSlots.size !== pieceCount || pieceCount === 0) return;
    const timer = window.setTimeout(() => setPhase("roundComplete"), 550);
    return () => window.clearTimeout(timer);
  }, [fixedSlots, phase, pieceCount]);

  useEffect(
    () => () => {
      if (dragFrameRef.current !== null) window.cancelAnimationFrame(dragFrameRef.current);
    },
    [],
  );

  const slotAtPoint = (clientX: number, clientY: number) => {
    const board = boardRef.current?.getBoundingClientRect();
    if (
      !board ||
      clientX < board.left ||
      clientX > board.right ||
      clientY < board.top ||
      clientY > board.bottom
    )
      return null;
    const column = Math.min(
      layout.columns - 1,
      Math.floor(((clientX - board.left) / board.width) * layout.columns),
    );
    const row = Math.min(
      layout.rows - 1,
      Math.floor(((clientY - board.top) / board.height) * layout.rows),
    );
    return row * layout.columns + column;
  };

  const tryPlacement = (piece: number, origin: number, destination: number) => {
    if (phase !== "puzzle" || fixedSlots.has(destination) || fixedSlots.has(origin)) return;
    setAttempts((value) => value + 1);
    // Every empty, unlocked slot accepts a piece. A move only earns a checkmark when
    // the moved piece (or the displaced piece) lands in its own position.
    const newlyFixed = [
      ...(piece === destination ? [destination] : []),
      ...(slots[destination] === origin ? [origin] : []),
    ];
    setSlots((current) => {
      const next = [...current];
      [next[origin], next[destination]] = [next[destination], next[origin]];
      return next;
    });
    if (newlyFixed.length > 0) {
      setFixedSlots((current) => {
        const next = new Set(current);
        newlyFixed.forEach((slot) => next.add(slot));
        return next;
      });
      setCorrectPlacements((value) => value + newlyFixed.length);
      setRoundScore((value) => value + newlyFixed.length * 10);
    }
  };

  const handleTapSlot = (slot: number) => {
    if (phase !== "puzzle" || fixedSlots.has(slot)) return;
    if (selectedSlot === null) {
      setSelectedSlot(slot);
      return;
    }
    if (selectedSlot === slot) {
      setSelectedSlot(null);
      return;
    }
    tryPlacement(slots[selectedSlot], selectedSlot, slot);
    setSelectedSlot(null);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>, origin: number) => {
    if (phase !== "puzzle" || fixedSlots.has(origin)) return;
    const board = boardRef.current?.getBoundingClientRect();
    const tile = event.currentTarget.getBoundingClientRect();
    if (!board) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const nextDrag: PuzzleDrag = {
      pointerId: event.pointerId,
      origin,
      piece: slots[origin],
      offsetX: event.clientX - tile.left,
      offsetY: event.clientY - tile.top,
      width: tile.width,
      height: tile.height,
      x: tile.left - board.left,
      y: tile.top - board.top,
      startX: event.clientX,
      startY: event.clientY,
      target: origin,
      moved: false,
    };
    dragRef.current = nextDrag;
    setDragging(nextDrag);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const active = dragRef.current;
    const board = boardRef.current?.getBoundingClientRect();
    if (!active || active.pointerId !== event.pointerId || !board) return;
    const nextDrag: PuzzleDrag = {
      ...active,
      x: event.clientX - board.left - active.offsetX,
      y: event.clientY - board.top - active.offsetY,
      target: slotAtPoint(event.clientX, event.clientY),
      moved:
        active.moved ||
        Math.hypot(event.clientX - active.startX, event.clientY - active.startY) > 8,
    };
    dragRef.current = nextDrag;
    // Moving the floating tile through a ref avoids rerendering every image tile for every
    // pointer event. React only updates when the highlighted destination actually changes.
    pendingDragPositionRef.current = { x: nextDrag.x, y: nextDrag.y };
    if (dragFrameRef.current === null) {
      dragFrameRef.current = window.requestAnimationFrame(() => {
        const position = pendingDragPositionRef.current;
        if (position && floatingPieceRef.current) {
          floatingPieceRef.current.style.left = `${position.x}px`;
          floatingPieceRef.current.style.top = `${position.y}px`;
        }
        dragFrameRef.current = null;
      });
    }
    if (nextDrag.target !== active.target || nextDrag.moved !== active.moved) {
      setDragging((current) =>
        current && current.pointerId === nextDrag.pointerId
          ? { ...current, target: nextDrag.target, moved: nextDrag.moved }
          : current,
      );
    }
  };

  const endPointer = (event: React.PointerEvent<HTMLButtonElement>) => {
    const active = dragRef.current;
    if (!active || active.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    if (dragFrameRef.current !== null) window.cancelAnimationFrame(dragFrameRef.current);
    dragFrameRef.current = null;
    pendingDragPositionRef.current = null;
    dragRef.current = null;
    setDragging(null);
    if (!active.moved) {
      handleTapSlot(active.origin);
      return;
    }
    const destination = slotAtPoint(event.clientX, event.clientY);
    if (destination !== null && destination !== active.origin) {
      tryPlacement(active.piece, active.origin, destination);
    }
    setSelectedSlot(null);
  };

  const showHint = () => {
    if (phase !== "puzzle") return;
    setHintUses((value) => value + 1);
    setPreviewSeconds(hintDuration());
    setSelectedSlot(null);
    setPhase("hintPreview");
  };

  const handleImageError = () => {
    if (image.id === PUZZLE_FALLBACK_IMAGE.id) {
      // A data URI should always load, but do not trap the player if a browser blocks it.
      setImageReady(true);
      return;
    }
    setImageReady(false);
    setImage(PUZZLE_FALLBACK_IMAGE);
  };

  const renderPuzzleImage = (piece: number, className = "") => {
    const row = Math.floor(piece / layout.columns);
    const column = piece % layout.columns;
    return (
      <img
        className={cn("ppg-piece-image", className)}
        src={image.src}
        alt=""
        draggable={false}
        style={{
          width: `${layout.columns * 100}%`,
          height: `${layout.rows * 100}%`,
          // Percentage transforms are relative to the whole image. Move only one tile-width
          // at a time so every tile reveals its correct part of the complete picture.
          transform: `translate(-${(column / layout.columns) * 100}%, -${(row / layout.rows) * 100}%)`,
        }}
      />
    );
  };

  if (phase === "howToPlay") {
    return <PicturePuzzleHowToPlayModal onStart={() => startRound(1)} onBack={onClose} />;
  }

  const accuracy = attempts ? Math.round((correctPlacements / attempts) * 100) : 100;
  const visibleScore = score + roundScore;

  if (phase === "roundComplete") {
    return (
      <div className="ppg-screen">
        <div className="mcg-complete ppg-complete">
          <div className="ppg-complete-photo">
            <img src={image.src} alt="Completed puzzle" />
          </div>
          <div className="mcg-complete-icon">✨</div>
          <h1 className="mcg-complete-title">Great Job!</h1>
          <p className="mcg-complete-sub">You rebuilt the picture.</p>
          <div className="mcg-complete-scores">
            <div className="mcg-cs-box">
              <strong>+{roundScore}</strong>
              <span>Round score</span>
            </div>
            <div className="mcg-cs-box">
              <strong>{accuracy}%</strong>
              <span>Accuracy</span>
            </div>
          </div>
          <div className="mcg-complete-meta">
            <span>🏅 Level {level}</span>
            <span>🧩 Round {round}</span>
            {hintUses > 0 && <span>💡 Hints: {hintUses}</span>}
          </div>
          <button
            className="mcg-btn mcg-btn-primary"
            onClick={() => {
              const nextScore = score + roundScore;
              const nextLevel = level + 1;
              setScore(nextScore);
              setBestScore((best) => Math.max(best, nextScore));
              setLevel(nextLevel);
              setRound((value) => value + 1);
              startRound(nextLevel);
            }}
          >
            <Play /> Next Round
          </button>
          <button className="mcg-btn mcg-btn-replay" onClick={() => startRound(level)}>
            <RotateCcw /> New Picture
          </button>
          <button className="mcg-btn mcg-btn-exit" onClick={finishSession}>
            <Home /> Exit to Games
          </button>
        </div>
      </div>
    );
  }

  if (phase === "imageExhausted") {
    return (
      <div className="ppg-screen">
        <div className="mcg-complete ppg-complete">
          <div className="mcg-complete-icon">🖼️</div>
          <h1 className="mcg-complete-title">You Saw Every Picture!</h1>
          <p className="mcg-complete-sub">
            This game keeps each picture unique for the whole session.
          </p>
          <button className="mcg-btn mcg-btn-exit" onClick={finishSession}>
            <Home /> Exit to Games
          </button>
        </div>
      </div>
    );
  }

  const isPreview = phase === "preview" || phase === "hintPreview";
  const previewTitle =
    phase === "hintPreview"
      ? "Here is the picture again"
      : "Take a moment to remember this picture";

  return (
    <div className="ppg-screen">
      <div className="mcg-topbar">
        <div className="mcg-stat">
          <span>🏆</span>
          <strong>{visibleScore}</strong>
          <small>Score</small>
        </div>
        <div className="mcg-level-pill">Level {level}</div>
        <div className="mcg-stat">
          <span>🧩</span>
          <strong>{round}</strong>
          <small>Round</small>
        </div>
      </div>

      {isPreview ? (
        <div className="ppg-preview-area">
          <p className="ppg-message">{previewTitle}</p>
          <div className="ppg-preview-picture">
            <img
              key={image.id}
              src={image.src}
              alt={image.label}
              onLoad={() => setImageReady(true)}
              onError={handleImageError}
            />
          </div>
          <p className="ppg-preview-note">
            {imageReady ? `${previewSeconds}s` : "Preparing picture..."}
          </p>
        </div>
      ) : (
        <div className="ppg-play-area">
          <p className="ppg-message">
            {selectedSlot === null
              ? "Drag a piece, or tap a piece then its place"
              : "Now tap the place where this piece belongs"}
          </p>
          <div
            ref={boardRef}
            className="ppg-board"
            style={{
              gridTemplateColumns: `repeat(${layout.columns}, 1fr)`,
              gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
              aspectRatio: `${layout.columns} / ${layout.rows}`,
            }}
            aria-label={`Picture puzzle with ${pieceCount} pieces`}
          >
            {slots.map((piece, slot) => {
              const isDragging = dragging?.origin === slot && dragging.moved;
              const isTarget =
                dragging?.target === slot && !fixedSlots.has(slot) && dragging.origin !== slot;
              return (
                <button
                  type="button"
                  key={`${round}-${slot}`}
                  className={cn(
                    "ppg-slot",
                    fixedSlots.has(slot) && "ppg-slot-fixed",
                    selectedSlot === slot && "ppg-slot-selected",
                    isDragging && "ppg-slot-drag-source",
                    isTarget && "ppg-slot-target",
                  )}
                  onPointerDown={(event) => handlePointerDown(event, slot)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={endPointer}
                  onPointerCancel={endPointer}
                  aria-label={
                    fixedSlots.has(slot)
                      ? "Correctly placed puzzle piece"
                      : `Puzzle piece ${slot + 1}`
                  }
                  disabled={fixedSlots.has(slot)}
                >
                  {renderPuzzleImage(piece)}
                  {fixedSlots.has(slot) && (
                    <span className="ppg-piece-placed" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
            {dragging && (
              <div
                ref={floatingPieceRef}
                className="ppg-floating-piece"
                style={{
                  width: dragging.width,
                  height: dragging.height,
                  left: dragging.x,
                  top: dragging.y,
                }}
                aria-hidden="true"
              >
                {renderPuzzleImage(dragging.piece)}
              </div>
            )}
          </div>
          <p className="ppg-progress">
            {fixedSlots.size} of {pieceCount} pieces placed
          </p>
        </div>
      )}

      <div className="mcg-controls ppg-controls">
        {!isPreview && (
          <button className="mcg-ctrl ppg-hint-button" onClick={showHint}>
            💡 HINT
          </button>
        )}
        {!isPreview && bestScore > 0 && <span className="ppg-best-score">Best {bestScore}</span>}
        <button className="mcg-ctrl mcg-ctrl-exit" onClick={finishSession}>
          EXIT
        </button>
      </div>
    </div>
  );
}

/* ======== Remember the Pattern Game ======== */

type PatternPhase = "howToPlay" | "showing" | "recall" | "result";
type PatternResult = "success" | "retry" | null;

const PATTERN_CELL_COUNT = 9;

const getPatternDifficulty = (level: number) => ({
  sequenceLength: Math.min(14, level + 1),
  highlightMs: Math.max(520, 920 - (level - 1) * 35),
  gapMs: Math.max(220, 430 - (level - 1) * 15),
});

const createPatternSequence = (length: number) => {
  const sequence: number[] = [];
  while (sequence.length < length) {
    const candidate = Math.floor(Math.random() * PATTERN_CELL_COUNT);
    const previous = sequence[sequence.length - 1];
    const twoBack = sequence[sequence.length - 2];
    // Keep the order varied without making the sequence feel unfair or repetitive.
    if (candidate === previous || (sequence.length >= 4 && candidate === twoBack)) continue;
    sequence.push(candidate);
  }
  return sequence;
};

function PatternTutorialGrid({
  sequence = [],
  animated = false,
  showSteps = false,
}: {
  sequence?: number[];
  animated?: boolean;
  showSteps?: boolean;
}) {
  return (
    <div className="rpg-tutorial-grid" aria-hidden="true">
      {Array.from({ length: PATTERN_CELL_COUNT }, (_, cell) => {
        const step = sequence.indexOf(cell);
        const isInSequence = step !== -1;
        return (
          <span
            key={cell}
            className={cn(
              "rpg-tutorial-cell",
              animated && isInSequence && "rpg-tutorial-cell-animated",
              showSteps && isInSequence && "rpg-tutorial-cell-step",
            )}
            style={
              animated && isInSequence
                ? ({ "--rpg-delay": `${step * 0.9}s` } as React.CSSProperties)
                : undefined
            }
          >
            {showSteps && isInSequence && <small>{step + 1}</small>}
          </span>
        );
      })}
    </div>
  );
}

function PatternHowToPlayModal({ onStart, onBack }: { onStart: () => void; onBack: () => void }) {
  const [slide, setSlide] = useState(0);
  const slides = [
    { heading: "WATCH", text: "Watch the cells carefully." },
    {
      heading: "REMEMBER THE ORDER",
      text: "The cells will light up one by one. Remember their order.",
    },
    {
      heading: "YOUR TURN",
      text: "When the pattern disappears, tap the same cells in the same order.",
    },
    {
      heading: "LEVEL UP",
      text: "As you level up, the sequence gets longer and more challenging.",
    },
  ];

  const renderIllustration = () => {
    if (slide === 0)
      return (
        <div className="htp-illust rpg-tutorial-illust">
          <PatternTutorialGrid sequence={[4]} animated />
          <span className="htp-hand">👀</span>
        </div>
      );
    if (slide === 1)
      return (
        <div className="htp-illust rpg-tutorial-illust">
          <PatternTutorialGrid sequence={[4, 2, 6]} animated />
          <span className="rpg-tutorial-caption">ONE AT A TIME</span>
        </div>
      );
    if (slide === 2)
      return (
        <div className="htp-illust rpg-tutorial-illust">
          <PatternTutorialGrid sequence={[4, 2, 6]} showSteps />
          <span className="htp-hand">👆</span>
        </div>
      );
    return (
      <div className="htp-illust rpg-tutorial-illust">
        <div className="rpg-tutorial-levels" aria-hidden="true">
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
        </div>
        <PatternTutorialGrid sequence={[0, 4, 8]} showSteps />
      </div>
    );
  };

  return (
    <div className="htp-overlay">
      <div className="htp-modal">
        <h2 className="htp-title">HOW TO PLAY</h2>
        <div className="htp-slide">
          {renderIllustration()}
          <h3 className="ppg-tutorial-heading">{slides[slide].heading}</h3>
          <p className="htp-text">{slides[slide].text}</p>
        </div>
        <div className="htp-dots">
          {slides.map((_, index) => (
            <button
              type="button"
              key={index}
              className={cn("htp-dot", index === slide && "htp-dot-active")}
              onClick={() => setSlide(index)}
              aria-label={`Tutorial step ${index + 1}`}
            />
          ))}
        </div>
        <div className="htp-nav">
          <button
            className="htp-nav-btn"
            onClick={() => setSlide(Math.max(0, slide - 1))}
            aria-label="Previous slide"
          >
            ◀
          </button>
          <button className="htp-ok-btn" onClick={onStart}>
            OK
          </button>
          <button
            className="htp-nav-btn"
            onClick={() => setSlide(Math.min(slides.length - 1, slide + 1))}
            aria-label="Next slide"
          >
            ▶
          </button>
        </div>
        <button className="htp-back-btn" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
}

function RememberPatternGame({ onClose }: { onClose: () => void }) {
  const sessionStartedAt = useRef(Date.now());
  const [phase, setPhase] = useState<PatternPhase>("howToPlay");
  const [result, setResult] = useState<PatternResult>(null);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [round, setRound] = useState(1);
  const [sequence, setSequence] = useState<number[]>([]);
  const [shownStep, setShownStep] = useState(0);
  const [isShowingCell, setIsShowingCell] = useState(false);
  const [recallIndex, setRecallIndex] = useState(0);
  const [recalledCells, setRecalledCells] = useState<number[]>([]);
  const [tapFeedback, setTapFeedback] = useState<{ cell: number; correct: boolean } | null>(null);
  const [roundScore, setRoundScore] = useState(0);
  const [correctSequences, setCorrectSequences] = useState(0);
  const [incorrectSequences, setIncorrectSequences] = useState(0);
  const inputLockedRef = useRef(false);
  const feedbackTimerRef = useRef<number | null>(null);
  const finishSession = () => {
    saveGameSession(
      "Remember the Pattern",
      score,
      Math.max(1, Math.round((Date.now() - sessionStartedAt.current) / 60000)),
    );
    onClose();
  };

  const startRound = (targetLevel = level) => {
    const { sequenceLength } = getPatternDifficulty(targetLevel);
    setSequence(createPatternSequence(sequenceLength));
    setShownStep(0);
    setIsShowingCell(true);
    setRecallIndex(0);
    setRecalledCells([]);
    setTapFeedback(null);
    setRoundScore(0);
    setResult(null);
    inputLockedRef.current = false;
    setPhase("showing");
  };

  useEffect(() => {
    if (phase !== "showing" || sequence.length === 0) return;
    const { highlightMs, gapMs } = getPatternDifficulty(level);
    const timer = window.setTimeout(
      () => {
        if (isShowingCell) {
          setIsShowingCell(false);
          return;
        }
        if (shownStep >= sequence.length - 1) {
          setPhase("recall");
          return;
        }
        setShownStep((step) => step + 1);
        setIsShowingCell(true);
      },
      isShowingCell ? highlightMs : gapMs,
    );
    return () => window.clearTimeout(timer);
  }, [isShowingCell, level, phase, sequence, shownStep]);

  useEffect(
    () => () => {
      if (feedbackTimerRef.current !== null) window.clearTimeout(feedbackTimerRef.current);
    },
    [],
  );

  const handleCellTap = (cell: number) => {
    if (phase !== "recall" || inputLockedRef.current) return;
    inputLockedRef.current = true;
    const isCorrect = sequence[recallIndex] === cell;
    setTapFeedback({ cell, correct: isCorrect });
    setRecalledCells((current) => [...current, cell]);

    if (!isCorrect) {
      setIncorrectSequences((value) => value + 1);
      setResult("retry");
      feedbackTimerRef.current = window.setTimeout(() => {
        setTapFeedback(null);
        setPhase("result");
        inputLockedRef.current = false;
      }, 700);
      return;
    }

    if (recallIndex + 1 === sequence.length) {
      const earned = sequence.length * 10;
      setRoundScore(earned);
      setCorrectSequences((value) => value + 1);
      setScore((current) => {
        const next = current + earned;
        setBestScore((best) => Math.max(best, next));
        return next;
      });
      setResult("success");
      feedbackTimerRef.current = window.setTimeout(() => {
        setTapFeedback(null);
        setPhase("result");
        inputLockedRef.current = false;
      }, 700);
      return;
    }

    setRecallIndex((index) => index + 1);
    feedbackTimerRef.current = window.setTimeout(() => {
      setTapFeedback(null);
      inputLockedRef.current = false;
    }, 260);
  };

  const resultSteps = sequence.reduce<Record<number, number[]>>((steps, cell, index) => {
    steps[cell] = [...(steps[cell] ?? []), index + 1];
    return steps;
  }, {});
  const accuracy =
    correctSequences + incorrectSequences > 0
      ? Math.round((correctSequences / (correctSequences + incorrectSequences)) * 100)
      : 100;

  const renderGrid = (revealOrder = false) => {
    const activeCell = phase === "showing" && isShowingCell ? sequence[shownStep] : null;
    return (
      <div
        className={cn("rpg-grid", revealOrder && "rpg-grid-reveal")}
        aria-label={revealOrder ? "Correct pattern order" : "Pattern memory grid"}
      >
        {Array.from({ length: PATTERN_CELL_COUNT }, (_, cell) => {
          const feedback = tapFeedback?.cell === cell ? tapFeedback : null;
          const label = revealOrder ? resultSteps[cell]?.join(" · ") : null;
          return (
            <button
              type="button"
              key={cell}
              className={cn(
                "rpg-cell",
                activeCell === cell && "rpg-cell-active",
                phase === "recall" && recalledCells.includes(cell) && "rpg-cell-selected",
                feedback?.correct && "rpg-cell-correct",
                feedback && !feedback.correct && "rpg-cell-wrong",
                label && "rpg-cell-reveal",
              )}
              onClick={() => handleCellTap(cell)}
              disabled={phase !== "recall" || revealOrder}
              aria-label={
                label
                  ? `Correct pattern step ${label}`
                  : phase === "recall"
                    ? `Pattern cell ${cell + 1}`
                    : "Pattern cell"
              }
            >
              {label && <span className="rpg-step-badge">{label}</span>}
            </button>
          );
        })}
      </div>
    );
  };

  if (phase === "howToPlay")
    return <PatternHowToPlayModal onStart={() => startRound(1)} onBack={onClose} />;

  if (phase === "result") {
    const isSuccess = result === "success";
    return (
      <div className="rpg-screen">
        <div className="mcg-topbar">
          <div className="mcg-stat">
            <span>🏆</span>
            <strong>{score}</strong>
            <small>Score</small>
          </div>
          <div className="mcg-level-pill">Level {level}</div>
          <div className="mcg-stat">
            <span>🧩</span>
            <strong>{round}</strong>
            <small>Round</small>
          </div>
        </div>
        <div className="mcg-complete rpg-complete">
          <div className="mcg-complete-icon">{isSuccess ? "✨" : "💛"}</div>
          <h1 className="mcg-complete-title">{isSuccess ? "Great Job!" : "Good Practice!"}</h1>
          <p className="mcg-complete-sub">
            {isSuccess
              ? `You remembered all ${sequence.length} cells in order.`
              : "Here is the order for this pattern. A new gentle round is ready when you are."}
          </p>
          {isSuccess ? (
            <div className="mcg-complete-scores">
              <div className="mcg-cs-box">
                <strong>+{roundScore}</strong>
                <span>Round score</span>
              </div>
              <div className="mcg-cs-box">
                <strong>{accuracy}%</strong>
                <span>Accuracy</span>
              </div>
            </div>
          ) : (
            renderGrid(true)
          )}
          <div className="mcg-complete-meta">
            <span>✓ Correct: {correctSequences}</span>
            <span>↻ Practice: {incorrectSequences}</span>
            {bestScore > 0 && <span>🏆 Best: {bestScore}</span>}
          </div>
          <button
            className="mcg-btn mcg-btn-primary"
            onClick={() => {
              const nextLevel = isSuccess ? level + 1 : level;
              setLevel(nextLevel);
              setRound((value) => value + 1);
              startRound(nextLevel);
            }}
          >
            <Play /> {isSuccess ? "Next Level" : "Next Round"}
          </button>
          <button className="mcg-btn mcg-btn-exit" onClick={finishSession}>
            <Home /> Exit to Games
          </button>
        </div>
      </div>
    );
  }

  const isShowing = phase === "showing";
  const message = isShowing
    ? isShowingCell
      ? `Watch carefully · Step ${shownStep + 1} of ${sequence.length}`
      : "Keep the order in mind..."
    : `Your turn · Sequence ${recallIndex + 1} of ${sequence.length}`;

  return (
    <div className="rpg-screen">
      <div className="mcg-topbar">
        <div className="mcg-stat">
          <span>🏆</span>
          <strong>{score}</strong>
          <small>Score</small>
        </div>
        <div className="mcg-level-pill">Level {level}</div>
        <div className="mcg-stat">
          <span>🧩</span>
          <strong>{round}</strong>
          <small>Round</small>
        </div>
      </div>
      <div className="rpg-play-area">
        <p className="rpg-message" aria-live="polite">
          {message}
        </p>
        {renderGrid()}
        <p className="rpg-progress">
          {isShowing ? "One light at a time" : `${recallIndex} of ${sequence.length} selected`}
        </p>
      </div>
      <div className="mcg-controls rpg-controls">
        {bestScore > 0 && <span className="rpg-best-score">Best {bestScore}</span>}
        <button className="mcg-ctrl mcg-ctrl-exit" onClick={finishSession}>
          EXIT
        </button>
      </div>
    </div>
  );
}

function GamesView({
  onGame,
  onEngagement,
}: {
  onGame: (gameName: string) => void;
  onEngagement: () => void;
}) {
  const [progress, setProgress] = useState<SavedGameProgress>({ scores: {}, recent: [] });

  useEffect(() => {
    setProgress(loadGameProgress());
  }, []);

  return (
    <>
      <PageHeader title="Games" subtitle="Choose a gentle activity. There is no time limit." />
      <div className="daily-streak">
        <Star />
        <div>
          <strong>A little each day</strong>
          <p>
            {progress.recent.length
              ? `You completed ${progress.recent.length} game sessions recently.`
              : "Your completed games will appear here."}
          </p>
        </div>
      </div>
      <section className="games-progress" aria-labelledby="game-progress-title">
        <div className="games-progress-heading">
          <Trophy />
          <div>
            <h2 id="game-progress-title">Your game progress</h2>
            <p>Your scores are safely saved on this device.</p>
          </div>
        </div>
        {progress.recent.length > 0 ? (
          <div className="games-history-list">
            {progress.recent.map((session, index) => (
              <div className="games-history-row" key={`${session.playedAt}-${index}`}>
                <div>
                  <strong>{session.gameName}</strong>
                  <small>
                    {formatGameHistoryTime(session.playedAt)} · {session.durationMinutes || 1} min
                    played
                  </small>
                </div>
                <span>{session.score} pts</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="games-history-empty">Play a game to see your scores and recent sessions.</p>
        )}
        <button className="engagement-link" onClick={onEngagement}>
          View daily and monthly activity <ChevronRight />
        </button>
      </section>
      <div className="game-list">
        {games.map((g) => {
          const savedScore = progress.scores[g.name];
          return (
            <button className="game-card" key={g.name} onClick={() => onGame(g.name)}>
              <span className="game-emoji">{g.icon}</span>
              <span>
                <strong>{g.name}</strong>
                <small>{g.desc}</small>
                <em>
                  <CloudOff /> {g.level} · Works offline
                </em>
                {savedScore && (
                  <b className="game-card-score">
                    🏆 High score {savedScore.highScore} · Last {savedScore.lastScore}
                  </b>
                )}
              </span>
              <ChevronRight />
            </button>
          );
        })}
      </div>
    </>
  );
}

function EngagementView() {
  const [period, setPeriod] = useState<"day" | "month">("day");
  const [records, setRecords] = useState<EngagementRecord[]>([]);

  useEffect(() => setRecords(loadEngagement()), []);

  const now = new Date();
  const dayRecords = records.filter((record) => startOfDay(record.completedAt) === startOfDay(now));
  const monthRecords = records.filter((record) => {
    const date = new Date(record.completedAt);
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  });
  const visible = period === "day" ? dayRecords : monthRecords;
  const minutes = visible.reduce((total, record) => total + record.durationMinutes, 0);
  const completed = visible.filter((record) => record.category !== "game").length;
  const onTime = visible.filter((record) => record.onTime).length;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const activeDays = new Set(monthRecords.map((record) => new Date(record.completedAt).getDate()));

  return (
    <>
      <PageHeader title="Your activity" subtitle="A simple record of everything you complete." />
      <div className="engagement-tabs" role="tablist" aria-label="Choose activity period">
        <button className={period === "day" ? "active" : ""} onClick={() => setPeriod("day")}>
          Today
        </button>
        <button className={period === "month" ? "active" : ""} onClick={() => setPeriod("month")}>
          This month
        </button>
      </div>
      <section className="engagement-summary" aria-live="polite">
        <div>
          <Clock3 />
          <strong>{minutes}</strong>
          <small>minutes enjoyed</small>
        </div>
        <div>
          <Check />
          <strong>{completed}</strong>
          <small>tasks completed</small>
        </div>
        <div>
          <Star />
          <strong>{onTime}</strong>
          <small>done on time</small>
        </div>
      </section>
      {period === "month" && (
        <section className="month-card" aria-label="Monthly activity calendar">
          <div className="section-heading">
            <h2>{now.toLocaleDateString(undefined, { month: "long" })}</h2>
            <small>Green days have activity</small>
          </div>
          <div className="activity-calendar">
            {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => (
              <span
                className={cn(activeDays.has(day) && "active", day === now.getDate() && "today")}
                key={day}
                title={`${day} ${activeDays.has(day) ? "has activity" : "has no activity"}`}
              >
                {day}
              </span>
            ))}
          </div>
        </section>
      )}
      <section className="engagement-log">
        <div className="section-heading">
          <h2>{period === "day" ? "Today’s completed activities" : "This month’s activity"}</h2>
        </div>
        {visible.length ? (
          visible.map((record) => (
            <article className="engagement-row" key={record.id}>
              <IconBadge tone={record.onTime ? "green" : "gold"}>
                {record.category === "game" ? <Gamepad2 /> : <Check />}
              </IconBadge>
              <div>
                <strong>{record.name}</strong>
                <small>
                  {new Date(record.completedAt).toLocaleDateString(
                    undefined,
                    period === "day"
                      ? { hour: "numeric", minute: "2-digit" }
                      : { month: "short", day: "numeric" },
                  )}
                  {record.durationMinutes ? ` · ${record.durationMinutes} min` : ""}
                </small>
              </div>
              <em className={record.onTime ? "on-time" : ""}>
                {record.onTime
                  ? "On time"
                  : record.category === "game"
                    ? `${record.score ?? 0} pts`
                    : "Done"}
              </em>
            </article>
          ))
        ) : (
          <div className="empty-soft">
            <Activity />
            <h2>Nothing completed yet</h2>
            <p>Finished games, activities, routines, and reminders will appear here.</p>
          </div>
        )}
      </section>
    </>
  );
}

function TodayView({
  name,
  navigate,
  onGame,
  reminderCount,
}: {
  name: string;
  navigate: (v: ElderView) => void;
  onGame: (gameName: string) => void;
  reminderCount: number;
}) {
  return (
    <>
      <PageHeader
        title={`Namaste, ${name}`}
        subtitle={new Date().toLocaleDateString(undefined, {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        action={
          <button
            className="avatar-button"
            onClick={() => navigate("settings")}
            aria-label="Open settings"
          >
            {name[0]?.toUpperCase()}
          </button>
        }
      />
      <section className="feature-activity">
        <div>
          <span className="section-label">
            <Sun /> Today’s activity
          </span>
          <h2>Find the matching pictures</h2>
          <p>A calm 5-minute activity to enjoy at your own pace.</p>
          <ActionButton variant="warm" onClick={() => onGame("Picture Pairs")}>
            <Play /> Start activity
          </ActionButton>
        </div>
        <span className="feature-illustration">
          <Flower2 />
        </span>
      </section>
      <section>
        <div className="section-heading">
          <h2>Also for today</h2>
          <button onClick={() => navigate("games")}>See all</button>
        </div>
        <div className="mini-grid">
          <button className="mini-card" onClick={() => navigate("games")}>
            <span>
              <Shapes />
            </span>
            <strong>Shape Match</strong>
            <small>About 4 minutes</small>
          </button>
          <button className="mini-card" onClick={() => navigate("games")}>
            <span>
              <MapPin />
            </span>
            <strong>Remember Place</strong>
            <small>About 5 minutes</small>
          </button>
        </div>
      </section>
      <div className="info-row">
        <button onClick={() => navigate("engagement")}>
          <IconBadge tone="green">
            <BarChart3 />
          </IconBadge>
          <span>
            <strong>Your activity</strong>
            <small>See time played and completed tasks</small>
          </span>
          <ChevronRight />
        </button>
        <button onClick={() => navigate("reminders")}>
          <IconBadge tone="gold">
            <Bell />
          </IconBadge>
          <span>
            <strong>{reminderCount} reminders today</strong>
            <small>Your personal daily plan is ready</small>
          </span>
          <ChevronRight />
        </button>
        <button onClick={() => navigate("memories")}>
          <IconBadge tone="green">
            <ImageIcon />
          </IconBadge>
          <span>
            <strong>A familiar memory</strong>
            <small>Springtime in Shillong</small>
          </span>
          <ChevronRight />
        </button>
      </div>
      <section>
        <div className="section-heading">
          <h2>Your routine</h2>
          <button onClick={() => navigate("routine")}>View plan</button>
        </div>
        <div
          className="routine-preview"
          onClick={() => navigate("routine")}
          style={{ cursor: "pointer" }}
        >
          <span className="done">
            <Check />
          </span>
          <div>
            <strong>Morning walk</strong>
            <small>Completed at 8:30 AM</small>
          </div>
          <span className="next">Next</span>
        </div>
      </section>
    </>
  );
}

function MemoriesView() {
  const [playing, setPlaying] = useState(false);
  const [profile, setProfile] = useState<PersonalProfile>(() => loadPersonalProfile());
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [memoryPhoto, setMemoryPhoto] = useState<string | undefined>();
  const [message, setMessage] = useState("");

  const readPhoto = (file: File | undefined, onReady: (photo: string) => void) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Please choose a photo file.");
      return;
    }
    if (file.size > 1_500_000) {
      setMessage("Please choose a photo smaller than 1.5 MB so it can stay safely on this device.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onReady(String(reader.result));
    reader.readAsDataURL(file);
  };

  const updateProfile = (next: PersonalProfile) => {
    setProfile(next);
    savePersonalProfile(next);
  };

  const listenToStory = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }
    const voice = new SpeechSynthesisUtterance(text);
    voice.rate = 0.82;
    voice.onend = () => setPlaying(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(voice);
    setPlaying(true);
  };

  const addMemory = () => {
    if (!title.trim() || !story.trim()) {
      setMessage("Please add a title and a few words about this memory.");
      return;
    }
    updateProfile({
      ...profile,
      memories: [
        {
          id: `memory-${Date.now()}`,
          title: title.trim(),
          story: story.trim(),
          photo: memoryPhoto,
          createdAt: Date.now(),
        },
        ...profile.memories,
      ],
    });
    setTitle("");
    setStory("");
    setMemoryPhoto(undefined);
    setMessage("Your memory is saved privately on this device.");
  };

  return (
    <>
      <PageHeader title="Memories" subtitle="Familiar moments shared with care." />
      <section className="personal-memory-form">
        <div className="personal-memory-heading">
          {profile.photo ? (
            <img src={profile.photo} alt="Your profile" />
          ) : (
            <IconBadge tone="green">
              <UserRound />
            </IconBadge>
          )}
          <div>
            <h2>Your memories</h2>
            <p>Add your photo and familiar stories, in your own words.</p>
          </div>
        </div>
        <label className="photo-picker">
          Your photo{" "}
          <input
            type="file"
            accept="image/*"
            onChange={(event) =>
              readPhoto(event.target.files?.[0], (photo) => updateProfile({ ...profile, photo }))
            }
          />
        </label>
        <label>
          Memory title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="For example, my wedding day"
          />
        </label>
        <label>
          Tell the story
          <textarea
            value={story}
            onChange={(event) => setStory(event.target.value)}
            placeholder="Who was there? What do you remember most?"
          />
        </label>
        <label className="photo-picker">
          Photo for this memory{" "}
          <input
            type="file"
            accept="image/*"
            onChange={(event) => readPhoto(event.target.files?.[0], setMemoryPhoto)}
          />
        </label>
        {memoryPhoto && (
          <img className="memory-preview" src={memoryPhoto} alt="New memory preview" />
        )}
        <ActionButton onClick={addMemory}>
          <Plus /> Save this memory
        </ActionButton>
        {message && (
          <p className="form-message" role="status">
            {message}
          </p>
        )}
      </section>
      <article className="memory-card memory-card-with-photo">
        <div
          className="memory-photo"
          role="img"
          aria-label="Green hills and a traditional home in North East India"
        >
          <img
            src={northeastWelcome}
            loading="lazy"
            width={1200}
            height={900}
            alt="Green hills and a traditional home in North East India"
          />
          <span>
            <Check /> Shared with you
          </span>
        </div>
        <div>
          <p>12 September 2026</p>
          <h2>Springtime in the hills</h2>
          <p>
            We visited this peaceful valley together after the rain. You loved the red flowers by
            the path.
          </p>
          <button
            onClick={() =>
              listenToStory(
                "Springtime in the hills. We visited this peaceful valley together after the rain. You loved the red flowers by the path.",
              )
            }
          >
            {playing ? <Pause /> : <Volume2 />} {playing ? "Pause" : "Listen to this story"}
          </button>
        </div>
      </article>
      {profile.memories.map((memory) => (
        <article
          className={cn("memory-card", "personal-memory-card", memory.photo && "memory-card-with-photo")}
          key={memory.id}
        >
          {memory.photo && (
            <div className="memory-photo">
              <img src={memory.photo} alt={memory.title} />
            </div>
          )}
          <div>
            <p>
              {new Date(memory.createdAt).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <h2>{memory.title}</h2>
            <p>{memory.story}</p>
            <button onClick={() => listenToStory(`${memory.title}. ${memory.story}`)}>
              {playing ? <Pause /> : <Volume2 />} {playing ? "Pause" : "Listen to this memory"}
            </button>
          </div>
        </article>
      ))}
      {!profile.memories.length && (
        <div className="empty-soft">
          <ImageIcon />
          <h2>Your personal memories will appear here</h2>
          <p>Add a photo or a short story above whenever you wish.</p>
        </div>
      )}
    </>
  );
}

function RemindersView({
  notificationPermission,
  onEnableNotifications,
  onTestReminder,
  reminders,
  onUpdateReminders,
}: {
  notificationPermission: NotificationPermission | "unsupported";
  onEnableNotifications: () => void;
  onTestReminder: () => void;
  reminders: PersonalReminder[];
  onUpdateReminders: (reminders: PersonalReminder[]) => void;
}) {
  const [done, setDone] = useState<number[]>([]);
  const [snoozed, setSnoozed] = useState<number[]>([]);
  const snooze = (reminder: PersonalReminder, i: number) => {
    setSnoozed((items) => [...items, i]);
    window.setTimeout(() => {
      setSnoozed((items) => items.filter((item) => item !== i));
      playGentleChime();
      showReminderNotification(reminder.title, `${reminder.desc} · Snooze is over.`);
    }, 900000);
  };
  return (
    <>
      <PageHeader title="Reminders" subtitle="Your simple plan for today." />
      <div className="success-banner">
        <Check /> Reminders are ready on this device.
      </div>
      <section className="reminder-alerts">
        <Bell />
        <div>
          <strong>
            {notificationPermission === "granted" ? "Alerts are on" : "Turn on reminder alerts"}
          </strong>
          <small>
            {notificationPermission === "granted"
              ? "You will see a gentle alert when this app is open."
              : "Allow notifications so this device can show reminders."}
          </small>
        </div>
        {notificationPermission === "granted" ? (
          <button onClick={onTestReminder}>Test</button>
        ) : (
          <button onClick={onEnableNotifications} disabled={notificationPermission === "denied"}>
            {notificationPermission === "denied" ? "Blocked" : "Allow"}
          </button>
        )}
      </section>
      <section className="reminder-customise">
        <h2>My daily reminder plan</h2>
        <p>Choose what matters to you and when you would like a reminder.</p>
        {reminders.map((reminder, index) => (
          <div className="reminder-choice" key={reminder.id}>
            <button
              className={cn("reminder-check", reminder.enabled && "active")}
              onClick={() =>
                onUpdateReminders(
                  reminders.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, enabled: !item.enabled } : item,
                  ),
                )
              }
              aria-pressed={reminder.enabled}
            >
              {reminder.enabled ? <Check /> : null}
            </button>
            <div>
              <strong>{reminder.title}</strong>
              <small>{reminder.desc}</small>
            </div>
            <input
              aria-label={`Time for ${reminder.title}`}
              type="time"
              value={toTimeInput(reminder.time)}
              onChange={(event) =>
                onUpdateReminders(
                  reminders.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, time: event.target.value } : item,
                  ),
                )
              }
            />
          </div>
        ))}
      </section>
      {reminders
        .filter((reminder) => reminder.enabled)
        .map((r, i) => (
          <article className={cn("reminder-card", done.includes(i) && "completed")} key={r.title}>
            <div className="reminder-time">
              <Clock3 />
              {snoozed.includes(i) ? "Snoozed" : displayReminderTime(r.time)}
            </div>
            <h2>{r.title}</h2>
            <p>{r.desc}</p>
            <div>
              <ActionButton
                onClick={() => {
                  if (done.includes(i)) return;
                  const completedAt = Date.now();
                  const scheduledFor = scheduledTimeToday(r.time);
                  setDone((items) => [...items, i]);
                  saveEngagement({
                    category: "reminder",
                    name: r.title,
                    durationMinutes: 0,
                    scheduledFor,
                    completedAt,
                    onTime: completedAt <= scheduledFor,
                  });
                  playGentleChime();
                }}
              >
                <Check /> {done.includes(i) ? "Done" : "Mark done"}
              </ActionButton>
              <ActionButton
                variant="secondary"
                onClick={() => snooze(r, i)}
                disabled={snoozed.includes(i)}
              >
                <Clock3 /> {snoozed.includes(i) ? "Snoozed" : "Snooze 15 min"}
              </ActionButton>
            </div>
          </article>
        ))}
    </>
  );
}

function ActivitiesView({ onGame }: { onGame: (gameName: string) => void }) {
  const [activeTab, setActiveTab] = useState<"planned" | "finished">("planned");
  const [started, setStarted] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState<string[]>(["Morning walk"]);
  const activities = [
    {
      t: "8:30 AM",
      n: "Morning walk",
      i: <Footprints />,
      s: "Completed",
      tab: "finished" as const,
    },
    { t: "11:00 AM", n: "Picture Pairs", i: <Flower2 />, s: "Ready", tab: "planned" as const },
    { t: "4:30 PM", n: "Listen to music", i: <Music />, s: "Later today", tab: "planned" as const },
  ];
  const filtered = activities.filter(
    (a) => (finished.includes(a.n) ? "finished" : "planned") === activeTab,
  );
  const handleActivityAction = (activity: (typeof activities)[0]) => {
    if (activity.n === "Picture Pairs") {
      onGame("Picture Pairs");
      return;
    }
    if (started[activity.n]) {
      const durationMinutes = Math.max(1, Math.round((Date.now() - started[activity.n]) / 60000));
      saveEngagement({ category: "activity", name: activity.n, durationMinutes });
      setFinished((items) => [...items, activity.n]);
      setStarted((items) => {
        const next = { ...items };
        delete next[activity.n];
        return next;
      });
      setActiveTab("finished");
      return;
    }
    setStarted((items) => ({ ...items, [activity.n]: Date.now() }));
  };
  return (
    <>
      <PageHeader
        title="Activities"
        subtitle="Plan your day, one simple step at a time."
        action={
          <button className="icon-button">
            <Plus />
          </button>
        }
      />
      <div className="tabs-line">
        <button
          className={activeTab === "planned" ? "active" : ""}
          onClick={() => setActiveTab("planned")}
        >
          Planned · {activities.filter((a) => !finished.includes(a.n)).length}
        </button>
        <button
          className={activeTab === "finished" ? "active" : ""}
          onClick={() => setActiveTab("finished")}
        >
          Finished · {finished.length}
        </button>
      </div>
      {filtered.map((a) => (
        <article className="activity-card" key={a.n}>
          <span>{a.i}</span>
          <div>
            <small>
              {a.t} · {started[a.n] ? "In progress" : finished.includes(a.n) ? "Completed" : a.s}
            </small>
            <h2>{a.n}</h2>
          </div>
          <ActionButton
            variant="secondary"
            disabled={finished.includes(a.n)}
            onClick={() => handleActivityAction(a)}
          >
            {finished.includes(a.n) ? "Completed" : started[a.n] ? "Mark done" : "Start"}
          </ActionButton>
        </article>
      ))}
    </>
  );
}

function RoutineView() {
  const [completed, setCompleted] = useState([0]);
  const routine = [
    ["Start the day", "Morning walk and breakfast", <Sun />],
    ["Play a game", "Picture Pairs is ready", <Flower2 />],
    ["Enjoy a memory", "Springtime in the hills", <ImageIcon />],
    ["Evening reminder", "Call Priya at 6:00 PM", <Bell />],
  ] as const;
  return (
    <>
      <PageHeader title="My daily routine" subtitle="A comfortable rhythm for your day." />
      <div className="timeline">
        {routine.map((x, i) => (
          <div
            key={x[0]}
            onClick={() => {
              if (completed.includes(i)) return;
              setCompleted([...completed, i]);
              saveEngagement({ category: "routine", name: x[0], durationMinutes: 0 });
            }}
            style={{ cursor: completed.includes(i) ? "default" : "pointer" }}
          >
            <span className={completed.includes(i) ? "complete" : ""}>
              {completed.includes(i) ? <Check /> : i + 1}
            </span>
            <article>
              <b>{x[2]}</b>
              <div>
                <h2>{x[0]}</h2>
                <p>{x[1]}</p>
              </div>
              <ChevronRight />
            </article>
          </div>
        ))}
      </div>
    </>
  );
}

function HelpView({ navigate }: { navigate: (v: ElderView) => void }) {
  const [showGuide, setShowGuide] = useState(false);
  const handleCallTrusted = () => {
    window.location.href = "tel:+911041234567890";
  };
  const handleEmergencyCall = () => {
    window.location.href = "tel:104";
  };
  return (
    <>
      <PageHeader title="Help" subtitle="Support is always close by." />
      <ActionButton className="call-button" onClick={handleCallTrusted}>
        <Phone /> Call a trusted person
      </ActionButton>
      <ActionButton variant="danger" onClick={handleEmergencyCall}>
        <Phone /> Emergency: 104 (Health Helpline)
      </ActionButton>
      {showGuide && (
        <div className="info-banner">
          <Volume2 />
          <div>
            <strong>Guide playing...</strong>
            <p>Welcome to SILIRUAL! Here's how to get started...</p>
          </div>
          <button onClick={() => setShowGuide(false)}>
            <X />
          </button>
        </div>
      )}
      <div className="help-list">
        <button onClick={() => setShowGuide(!showGuide)}>
          <IconBadge>
            <Volume2 />
          </IconBadge>
          <span>
            <strong>How to use SILIRUAL</strong>
            <small>Hear a simple step-by-step guide</small>
          </span>
          <ChevronRight />
        </button>
        <button onClick={() => navigate("care")}>
          <IconBadge tone="green">
            <HeartHandshake />
          </IconBadge>
          <span>
            <strong>My care circle</strong>
            <small>People connected with you</small>
          </span>
          <ChevronRight />
        </button>
        <button onClick={() => navigate("location")}>
          <IconBadge tone="gold">
            <LocateFixed />
          </IconBadge>
          <span>
            <strong>Location sharing</strong>
            <small>Share only when you choose</small>
          </span>
          <ChevronRight />
        </button>
        <button onClick={() => navigate("settings")}>
          <IconBadge>
            <Settings />
          </IconBadge>
          <span>
            <strong>Settings</strong>
            <small>Language, text size and comfort</small>
          </span>
          <ChevronRight />
        </button>
      </div>
      <div className="official-note">
        <ShieldCheck />
        <div>
          <strong>SILIRUAL is a daily wellbeing companion</strong>
          <p>It does not provide medical advice or diagnosis.</p>
        </div>
      </div>
    </>
  );
}

function SettingsView({
  textSize,
  setTextSize,
  onLogout,
}: {
  textSize: TextSize;
  setTextSize: (s: TextSize) => void;
  onLogout: () => void;
}) {
  const [sound, setSound] = useState(true);
  const [voice, setVoice] = useState(false);
  const [contrast, setContrast] = useState(false);
  return (
    <>
      <PageHeader title="Settings" subtitle="Make SILIRUAL comfortable for you." />
      <section className="settings-section">
        <h2>Text size</h2>
        <div className="size-picker">
          {(["normal", "large", "extra"] as TextSize[]).map((s) => (
            <button
              key={s}
              className={textSize === s ? "selected" : ""}
              onClick={() => setTextSize(s)}
            >
              <span className={`sample-${s}`}>Aa</span>
              <small>{{ normal: "Normal", large: "Large", extra: "Extra Large" }[s]}</small>
            </button>
          ))}
        </div>
      </section>
      <section className="settings-section">
        <ToggleRow
          icon={<Volume2 />}
          title="Sound"
          text="Hear helpful sounds"
          value={sound}
          onChange={() => setSound(!sound)}
        />
        <ToggleRow
          icon={<Mic />}
          title="Voice instructions"
          text="Hear instructions read aloud"
          value={voice}
          onChange={() => setVoice(!voice)}
        />
        <ToggleRow
          icon={<Accessibility />}
          title="High contrast"
          text="Make colours easier to see"
          value={contrast}
          onChange={() => setContrast(!contrast)}
        />
      </section>
      <section className="settings-section">
        <h2>Legal & Privacy</h2>
        <div className="settings-list">
          <div className="setting-item">
            <ShieldCheck />
            <div>
              <strong>Privacy Policy</strong>
              <small>How we protect your data</small>
            </div>
            <ChevronRight />
          </div>
          <div className="setting-item">
            <BookOpen />
            <div>
              <strong>Terms of Service</strong>
              <small>Government terms and conditions</small>
            </div>
            <ChevronRight />
          </div>
        </div>
      </section>
      <ActionButton variant="danger" onClick={onLogout}>
        Log out
      </ActionButton>
    </>
  );
}

function PrivacyPolicyView() {
  return (
    <>
      <PageHeader title="Privacy Policy" subtitle="Government of India Data Protection" />
      <section className="legal-content">
        <h2>Data Collection</h2>
        <p>
          स्मृति सहायता collects only essential information for cognitive health support: name, age,
          language preference, and cognitive training progress. No medical data is collected without
          explicit consent.
        </p>
        <h2>Data Storage</h2>
        <p>
          All user data is stored within India in compliance with government data localization
          requirements. Data is encrypted and protected under Indian IT Act regulations.
        </p>
        <h2>Data Sharing</h2>
        <p>
          Your data is never shared with third parties without your explicit permission.
          Family/caregiver access requires your approval and can be revoked at any time.
        </p>
        <h2>User Rights</h2>
        <p>
          You have the right to access, correct, or delete your personal data. Contact the Ministry
          of Health helpline at 104 for data-related inquiries.
        </p>
        <h2>Security</h2>
        <p>
          We use industry-standard encryption and security measures to protect your information.
          Regular security audits are conducted by government authorities.
        </p>
      </section>
      <div className="government-footer">
        <div>
          <small>Government of India Initiative</small>
          <strong>Ministry of Health & Family Welfare</strong>
        </div>
        <div className="emergency-helpline">
          <Phone size={16} /> 104 - Health Helpline
        </div>
      </div>
    </>
  );
}

function TermsOfServiceView() {
  return (
    <>
      <PageHeader title="Terms of Service" subtitle="Government of India Service Terms" />
      <section className="legal-content">
        <h2>Service Purpose</h2>
        <p>
          स्मृति सहायता is a government initiative to provide cognitive support activities for
          elderly citizens. This service is not a substitute for professional medical care.
        </p>
        <h2>User Responsibilities</h2>
        <p>
          Users must provide accurate information and use the service responsibly. Misuse of the
          service or provision of false information may result in service termination.
        </p>
        <h2>Medical Disclaimer</h2>
        <p>
          This application provides cognitive support activities only. It does not provide medical
          diagnosis, treatment, or advice. Always consult qualified healthcare professionals for
          medical concerns.
        </p>
        <h2>Emergency Services</h2>
        <p>
          In case of medical emergencies, call 104 (National Health Helpline) or 112 (Emergency
          Services) immediately. This application is not an emergency response system.
        </p>
        <h2>Government Compliance</h2>
        <p>
          This service complies with all applicable Indian laws including the IT Act, 2000, and
          related regulations. Users agree to abide by all government policies and guidelines.
        </p>
        <h2>Service Modifications</h2>
        <p>
          The government reserves the right to modify, suspend, or discontinue this service with or
          without notice for security, policy, or operational reasons.
        </p>
      </section>
      <div className="government-footer">
        <div>
          <small>Government of India Initiative</small>
          <strong>Ministry of Health & Family Welfare</strong>
        </div>
        <div className="emergency-helpline">
          <Phone size={16} /> 104 - Health Helpline
        </div>
      </div>
    </>
  );
}

function MemoryMatchGame({ onBack }: { onBack: () => void }) {
  const [cards, setCards] = useState([
    { id: 1, pattern: "mekhela", matched: false, color: "#FF9933" },
    { id: 2, pattern: "mekhela", matched: false, color: "#FF9933" },
    { id: 3, pattern: "gamocha", matched: false, color: "#138808" },
    { id: 4, pattern: "gamocha", matched: false, color: "#138808" },
    { id: 5, pattern: "bihu", matched: false, color: "#FF6B6B" },
    { id: 6, pattern: "bihu", matched: false, color: "#FF6B6B" },
    { id: 7, pattern: "xatki", matched: false, color: "#4ECDC4" },
    { id: 8, pattern: "xatki", matched: false, color: "#4ECDC4" },
  ]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);

  const handleCardClick = (id: number) => {
    if (flipped.length === 2 || flipped.includes(id) || cards[id].matched) return;

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const [first, second] = newFlipped;

      if (cards[first].pattern === cards[second].pattern) {
        setCards((prev) =>
          prev.map((card) =>
            card.id === first || card.id === second ? { ...card, matched: true } : card,
          ),
        );
        setScore(score + 10);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  const isComplete = cards.every((card) => card.matched);

  return (
    <>
      <PageHeader
        title="Traditional Pattern Match"
        subtitle="Match Assamese mekhela patterns"
        onBack={onBack}
      />
      <div
        className="game-stats"
        style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}
      >
        <span>Score: {score}</span>
        <span>Moves: {moves}</span>
      </div>
      <div className="memory-game-grid">
        {cards.map((card) => (
          <div
            key={card.id}
            className={cn(
              "memory-card",
              card.matched && "matched",
              flipped.includes(card.id) && "flipped",
            )}
            onClick={() => handleCardClick(card.id)}
            style={{
              backgroundColor:
                card.matched || flipped.includes(card.id) ? card.color : "var(--secondary)",
            }}
          >
            {flipped.includes(card.id) || card.matched ? (
              <span style={{ fontSize: "24px" }}>
                {card.pattern === "mekhela"
                  ? "🧥"
                  : card.pattern === "gamocha"
                    ? "👗"
                    : card.pattern === "bihu"
                      ? "🎭"
                      : "🎨"}
              </span>
            ) : (
              "?"
            )}
          </div>
        ))}
      </div>
      {isComplete && (
        <div className="game-complete">
          <h3>🎉 Congratulations!</h3>
          <p>You matched all patterns in {moves} moves!</p>
          <ActionButton onClick={onBack}>Back to Training</ActionButton>
        </div>
      )}
    </>
  );
}

function CareView() {
  const [showConnect, setShowConnect] = useState(false);
  return (
    <>
      <PageHeader title="My care circle" subtitle="People you trust and have approved." />
      <article className="person-card">
        <div className="person-avatar">P</div>
        <div>
          <h2>Priya Das</h2>
          <p>Daughter · Family</p>
          <span>
            <Check /> Connected
          </span>
        </div>
        <ChevronRight />
      </article>
      {showConnect && (
        <div className="info-banner">
          <div>
            <strong>Connect a trusted person</strong>
            <p>Share your connection code with someone you trust.</p>
          </div>
          <button onClick={() => setShowConnect(false)}>
            <X />
          </button>
        </div>
      )}
      <ActionButton variant="secondary" onClick={() => setShowConnect(!showConnect)}>
        <Plus /> Connect a trusted person
      </ActionButton>
      <div className="reassurance">
        <ShieldCheck />
        <div>
          <strong>You decide who can connect</strong>
          <p>You can remove access at any time.</p>
        </div>
      </div>
    </>
  );
}
function LocationView() {
  const [sharing, setSharing] = useState(false);
  return (
    <>
      <PageHeader title="Location sharing" subtitle="Share only when you choose." />
      <div className="location-visual">
        <MapPin />
        <span>1 hour</span>
      </div>
      <h2 className="center-title">
        {sharing ? "Your location is being shared" : "Your location is private"}
      </h2>
      <p className="center-copy">
        {sharing
          ? "Priya can see your location until 7:20 PM."
          : "No one can see where you are right now."}
      </p>
      <ActionButton variant={sharing ? "danger" : "primary"} onClick={() => setSharing(!sharing)}>
        {sharing ? (
          <>
            <Square /> Stop sharing now
          </>
        ) : (
          <>
            <LocateFixed /> Share for one hour
          </>
        )}
      </ActionButton>
      <div className="reassurance">
        <ShieldCheck />
        <div>
          <strong>Time-limited and secure</strong>
          <p>Sharing stops automatically after one hour.</p>
        </div>
      </div>
    </>
  );
}

const elderNav: Array<{ id: ElderView; label: string; icon: ReactNode }> = [
  { id: "today", label: "Today", icon: <Home /> },
  { id: "games", label: "Games", icon: <Gamepad2 /> },
  { id: "memories", label: "Memories", icon: <Camera /> },
  { id: "help", label: "Help", icon: <CircleHelp /> },
];
function ElderApp({
  name,
  textSize,
  setTextSize,
  onLogout,
}: {
  name: string;
  textSize: TextSize;
  setTextSize: (s: TextSize) => void;
  onLogout: () => void;
}) {
  const [view, setView] = useState<ElderView>("today");
  const [game, setGame] = useState<string | null>(null);
  const [reminders, setReminders] = useState<PersonalReminder[]>(() => loadReminderPlan());
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | "unsupported"
  >(() => (typeof Notification === "undefined" ? "unsupported" : Notification.permission));

  const enableNotifications = () => {
    if (typeof Notification === "undefined") return;
    Notification.requestPermission().then(setNotificationPermission);
  };

  useEffect(() => {
    if (notificationPermission !== "granted") return;
    const timers = reminders
      .filter((reminder) => reminder.enabled)
      .map((reminder) => {
        const scheduledFor = scheduledTimeToday(reminder.time);
        const nextTime = scheduledFor > Date.now() ? scheduledFor : scheduledFor + 86400000;
        return window.setTimeout(() => {
          playGentleChime();
          showReminderNotification(reminder.title, reminder.desc);
        }, nextTime - Date.now());
      });
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [notificationPermission, reminders]);
  if (game === "Pizza Memory")
    return (
      <div className="phone-app">
        <StatusStrip />
        <PizzaMemoryGame
          onClose={() => {
            setGame(null);
            setView("games");
          }}
        />
      </div>
    );
  if (game === "3 Cups & 1 Ball")
    return (
      <div className="phone-app">
        <StatusStrip />
        <CupsMemoryGame
          onClose={() => {
            setGame(null);
            setView("games");
          }}
        />
      </div>
    );
  if (game === "Picture Puzzle")
    return (
      <div className="phone-app">
        <StatusStrip />
        <PicturePuzzleGame
          onClose={() => {
            setGame(null);
            setView("games");
          }}
        />
      </div>
    );
  if (game === "Remember the Pattern")
    return (
      <div className="phone-app">
        <StatusStrip />
        <RememberPatternGame
          onClose={() => {
            setGame(null);
            setView("games");
          }}
        />
      </div>
    );
  if (game)
    return (
      <div className="phone-app">
        <StatusStrip />
        <MemoryCardGame
          onClose={() => {
            setGame(null);
            setView("games");
          }}
        />
      </div>
    );
  let content: ReactNode;
  if (view === "today")
    content = (
      <TodayView
        name={name}
        navigate={setView}
        onGame={(g) => setGame(g)}
        reminderCount={reminders.filter((reminder) => reminder.enabled).length}
      />
    );
  else if (view === "games")
    content = <GamesView onGame={(g) => setGame(g)} onEngagement={() => setView("engagement")} />;
  else if (view === "memories") content = <MemoriesView />;
  else if (view === "help") content = <HelpView navigate={setView} />;
  else if (view === "activities")
    content = <ActivitiesView onGame={(gameName) => setGame(gameName)} />;
  else if (view === "engagement") content = <EngagementView />;
  else if (view === "reminders")
    content = (
      <RemindersView
        notificationPermission={notificationPermission}
        onEnableNotifications={enableNotifications}
        reminders={reminders}
        onUpdateReminders={(nextReminders) => {
          setReminders(nextReminders);
          saveReminderPlan(nextReminders);
        }}
        onTestReminder={() => {
          playGentleChime();
          showReminderNotification(
            "SILIRUAL reminder test",
            "This is how a gentle reminder will appear.",
          );
        }}
      />
    );
  else if (view === "routine") content = <RoutineView />;
  else if (view === "care") content = <CareView />;
  else if (view === "location") content = <LocationView />;
  else content = <SettingsView textSize={textSize} setTextSize={setTextSize} onLogout={onLogout} />;
  const hidden = !elderNav.some((n) => n.id === view);
  return (
    <div className="phone-app">
      <StatusStrip />
      {hidden && (
        <button className="back-floating" onClick={() => setView("today")}>
          <ArrowLeft /> Back
        </button>
      )}
      <div className="app-content">{content}</div>
      <nav className="bottom-nav" aria-label="Main navigation">
        {elderNav.map((n) => (
          <button
            key={n.id}
            className={view === n.id ? "active" : ""}
            onClick={() => setView(n.id)}
          >
            {n.icon}
            <span>{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function HelperApp({ role, onLogout }: { role: "family" | "caregiver"; onLogout: () => void }) {
  const [view, setView] = useState("home");
  const [currentLanguage, setCurrentLanguage] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const caregiver = role === "caregiver";
  const languages = ["English", "हिन्दी", "অসমীয়া", "বাংলা", "নেপালী", "মৈতৈলোন্"];

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const languageStrings = {
    English: {
      dashboard: "Dashboard Overview",
      elders: "My Elders",
      cognitive: "Cognitive Training",
      analytics: "Analytics",
      alerts: "Alerts",
      tasks: "Care Tasks",
      health: "Health Monitor",
      memories: "Memory Sharing",
      schedule: "Daily Schedule",
      location: "Location",
      notes: "Care Notes",
      settings: "Settings",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
    },
    हिन्दी: {
      dashboard: "डैशबोर्ड अवलोकन",
      elders: "मेरे बृद्ध",
      cognitive: "संज्ञानात्मक प्रशिक्षण",
      analytics: "विश्लेषण",
      alerts: "चेतावनी",
      tasks: "देखभाल कार्य",
      health: "स्वास्थ्य निगरान",
      memories: "स्मृति साझाकरण",
      schedule: "दैनिक समय सारणी",
      location: "स्थान",
      notes: "देखभाल नोट्स",
      settings: "सेटिंग्स",
      privacy: "गोपनीयता नीति",
      terms: "सेवा शर्तें",
    },
    অসমীয়া: {
      dashboard: "ডেশবোৰ্ড অভিলোকন",
      elders: "মোৰ বৃদ্ধ",
      cognitive: "কগনিটিভ প্ৰশিক্ষণ",
      analytics: "বিশ্লেষণ",
      alerts: "সতৰ্কবাৰ্তা",
      tasks: "যত্ন কার্য",
      health: "স্বাস্থ্য নিৰীক্ষণ",
      memories: "স্মৃতি অংশৰণ",
      schedule: "দৈনিক সময়সূচী",
      location: "অৱস্থান",
      notes: "যত্ন নোট",
      settings: "ছেটিংছ",
      privacy: "গোপনীয়তা নীতি",
      terms: "সেৱা চৰ্ত",
    },
    বাংলা: {
      dashboard: "ড্যাশবোর্ড ওভারভিউ",
      elders: "আমার বৃদ্ধ",
      cognitive: "কগনিটিভ ট্রেনিং",
      analytics: "বিশ্লেষণ",
      alerts: "সতর্কবার্তা",
      tasks: "যত্ন কাজ",
      health: "স্বাস্থ্য মনিটর",
      memories: "স্মৃতি শেয়ারিং",
      schedule: "দৈনিক সময়সূচি",
      location: "অবস্থান",
      notes: "যত্ন নোট",
      settings: "সেটিংস",
      privacy: "গোপনীয়তা নীতি",
      terms: "সেবা শর্ত",
    },
    নেপালी: {
      dashboard: "ड्यासबोर्ड अवलोकन",
      elders: "मेरा बृद्ध",
      cognitive: "संज्ञानात्मक प्रशिक्षण",
      analytics: "विश्लेषण",
      alerts: "चेतावनी",
      tasks: "हेरदाइ काम",
      health: "स्वास्थ्य निगरान",
      memories: "स्मृति साझेदारी",
      schedule: "दैनिक समयतालिका",
      location: "स्थान",
      notes: "हेरदाइ नोट",
      settings: "सेटिङ",
      privacy: "गोपनीयता नीति",
      terms: "सेवा शर्त",
    },
    মৈতৈলোন্: {
      dashboard: "ডেসবোর্ড ওলোকপা",
      elders: "অমা পীবা",
      cognitive: "কগনিটিভ প্রশিক্ষণ",
      analytics: "বিশ্লেষণ",
      alerts: "সতর্কবার্তা",
      tasks: "শানশিং কাজ",
      health: "স্বাস্থ্য শেংশাল",
      memories: "অহানবা শেরিং",
      schedule: "দৈনিক শেডিউল",
      location: "লোকেসন",
      notes: "শানশিং নোট",
      settings: "ছেটিং",
      privacy: "প্রাইভেসি পলিসি",
      terms: "সের্ভিস তের্মস",
    },
  };

  const t = languageStrings[languages[currentLanguage]];

  // Sample data for caregiver dashboard
  const eldersUnderCare = [
    {
      id: 1,
      name: "Anima Das",
      age: 78,
      status: "Well",
      lastActive: "2 hours ago",
      location: "Home",
      nextTask: "Evening walk at 5 PM",
    },
    {
      id: 2,
      name: "Biren Sharma",
      age: 82,
      status: "Needs attention",
      lastActive: "30 minutes ago",
      location: "Living room",
      nextTask: "Medicine at 6 PM",
    },
    {
      id: 3,
      name: "Priya Devi",
      age: 75,
      status: "Resting",
      lastActive: "1 hour ago",
      location: "Bedroom",
      nextTask: "Dinner at 7 PM",
    },
  ];

  const alerts = [
    {
      id: 1,
      type: "urgent",
      elder: "Biren Sharma",
      message: "Medication reminder overdue by 45 minutes",
      time: "15 minutes ago",
    },
    {
      id: 2,
      type: "warning",
      elder: "Anima Das",
      message: "Activity not started - morning walk",
      time: "1 hour ago",
    },
  ];

  const [careTasks, setCareTasks] = useState([
    {
      id: 1,
      elder: "Anima Das",
      task: "Morning medication",
      time: "9:00 AM",
      status: "completed",
      assignedTo: "Dr. Sharma",
    },
    {
      id: 2,
      elder: "Biren Sharma",
      task: "Blood pressure check",
      time: "10:30 AM",
      status: "pending",
      assignedTo: "Nurse",
    },
    {
      id: 3,
      elder: "Priya Devi",
      task: "Physical therapy session",
      time: "11:00 AM",
      status: "in-progress",
      assignedTo: "Therapist",
    },
    {
      id: 4,
      elder: "Anima Das",
      task: "Memory game session",
      time: "2:00 PM",
      status: "pending",
      assignedTo: "Caregiver",
    },
    {
      id: 5,
      elder: "Biren Sharma",
      task: "Evening medication",
      time: "6:00 PM",
      status: "pending",
      assignedTo: "Caregiver",
    },
  ]);
  const updateCareTask = (id: number, status: "in-progress" | "completed") => {
    setCareTasks((tasks) => tasks.map((task) => (task.id === id ? { ...task, status } : task)));
  };

  const healthData = [
    {
      elder: "Anima Das",
      metric: "Blood Pressure",
      value: "120/80",
      status: "normal",
      date: "Today",
    },
    {
      elder: "Biren Sharma",
      metric: "Blood Pressure",
      value: "135/85",
      status: "attention",
      date: "Today",
    },
    { elder: "Priya Devi", metric: "Heart Rate", value: "72 bpm", status: "normal", date: "Today" },
  ];

  // Analytics data for caregiver dashboard
  const analyticsData = {
    activityEngagement: [
      { day: "Mon", value: 75, improvement: true },
      { day: "Tue", value: 82, improvement: true },
      { day: "Wed", value: 68, improvement: false },
      { day: "Thu", value: 90, improvement: true },
      { day: "Fri", value: 85, improvement: true },
      { day: "Sat", value: 78, improvement: false },
      { day: "Sun", value: 88, improvement: true },
    ],
    healthTrends: [
      { metric: "Blood Pressure", current: "120/80", previous: "128/85", improvement: true },
      { metric: "Activity Level", current: "4.2 hrs", previous: "3.5 hrs", improvement: true },
      { metric: "Sleep Quality", current: "7.2 hrs", previous: "6.8 hrs", improvement: true },
      { metric: "Mood Score", current: "8.5/10", previous: "7.2/10", improvement: true },
    ],
    elderProgress: [
      { name: "Anima Das", weekProgress: 85, engagement: "High", trend: "up" },
      { name: "Biren Sharma", weekProgress: 62, engagement: "Medium", trend: "stable" },
      { name: "Priya Devi", weekProgress: 78, engagement: "High", trend: "up" },
    ],
  };

  const renderHome = () => {
    const caregiverItems = [
      {
        id: "overview",
        t: "Dashboard Overview",
        d: "Real-time status & updates",
        i: <Activity />,
        tone: "primary" as const,
      },
      {
        id: "elders",
        t: "My Elders",
        d: "3 people under care",
        i: <Users />,
        tone: "primary" as const,
      },
      {
        id: "cognitive",
        t: "Cognitive Training",
        d: "Memory & brain exercises",
        i: <Brain />,
        tone: "green" as const,
      },
      {
        id: "analytics",
        t: "Analytics",
        d: "Progress & trends data",
        i: <TrendingUp />,
        tone: "green" as const,
      },
      { id: "alerts", t: "Alerts", d: "2 urgent items", i: <Bell />, tone: "red" as const },
      {
        id: "tasks",
        t: "Care Tasks",
        d: "5 tasks scheduled today",
        i: <BookOpen />,
        tone: "green" as const,
      },
      {
        id: "health",
        t: "Health Monitor",
        d: "Vitals & wellness tracking",
        i: <HeartHandshake />,
        tone: "primary" as const,
      },
      {
        id: "memories",
        t: "Memory Sharing",
        d: "Share moments & review",
        i: <Camera />,
        tone: "gold" as const,
      },
      {
        id: "schedule",
        t: "Daily Schedule",
        d: "Manage daily activities",
        i: <Clock3 />,
        tone: "green" as const,
      },
      { id: "location", t: "Location", d: "Safety tracking", i: <MapPin />, tone: "red" as const },
      { id: "notes", t: "Care Notes", d: "Documentation", i: <BookOpen />, tone: "gold" as const },
    ];

    const familyItems = [
      {
        id: "overview",
        t: "Family Dashboard",
        d: "Quick overview & updates",
        i: <Activity />,
        tone: "primary" as const,
      },
      {
        id: "progress",
        t: "Activity Progress",
        d: "Weekly activity summary",
        i: <Activity />,
        tone: "primary" as const,
      },
      {
        id: "memories",
        t: "Memories",
        d: "Share familiar moments",
        i: <Camera />,
        tone: "green" as const,
      },
      {
        id: "reminders",
        t: "Reminders",
        d: "Help plan the day",
        i: <Bell />,
        tone: "gold" as const,
      },
      {
        id: "location",
        t: "Shared Location",
        d: "Permission-based sharing",
        i: <MapPin />,
        tone: "red" as const,
      },
    ];

    const items = caregiver ? caregiverItems : familyItems;

    return (
      <>
        <PageHeader
          title={caregiver ? "Caregiver Dashboard" : "Family Dashboard"}
          subtitle="Tuesday, 15 September 2026"
          action={
            <button className="icon-button">
              <Menu />
            </button>
          }
        />

        {/* Dashboard Overview for Caregivers */}
        {caregiver && (
          <>
            <section className="dashboard-overview">
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-icon">
                    <Users />
                  </span>
                  <div>
                    <strong>{eldersUnderCare.length}</strong>
                    <small>Elders under care</small>
                  </div>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">
                    <Bell />
                  </span>
                  <div>
                    <strong>{alerts.length}</strong>
                    <small>Active alerts</small>
                  </div>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">
                    <BookOpen />
                  </span>
                  <div>
                    <strong>{careTasks.filter((t) => t.status !== "completed").length}</strong>
                    <small>Pending tasks</small>
                  </div>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">
                    <HeartHandshake />
                  </span>
                  <div>
                    <strong>
                      {healthData.filter((h) => h.status === "normal").length}/{healthData.length}
                    </strong>
                    <small>Normal vitals</small>
                  </div>
                </div>
              </div>

              {/* Active Alerts */}
              {alerts.length > 0 && (
                <section className="alerts-section">
                  <h2>Active Alerts</h2>
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={cn(
                        "alert-card",
                        alert.type === "urgent" ? "alert-urgent" : "alert-warning",
                      )}
                    >
                      <span className="alert-icon">
                        {alert.type === "urgent" ? <Bell /> : <CircleHelp />}
                      </span>
                      <div>
                        <strong>{alert.elder}</strong>
                        <p>{alert.message}</p>
                        <small>{alert.time}</small>
                      </div>
                      <button className="alert-action">Resolve</button>
                    </div>
                  ))}
                </section>
              )}

              {/* Analytics Overview */}
              <section className="analytics-section">
                <h2>
                  <TrendingUp /> Elder Progress Analytics
                </h2>
                <div
                  className="analytics-grid"
                  style={{ display: "flex", overflowX: "auto", gap: "12px", paddingBottom: "8px" }}
                >
                  <div className="analytics-card">
                    <h3>
                      <BarChart3 /> Weekly Activity
                    </h3>
                    <div className="chart-container">
                      {analyticsData.activityEngagement.map((data, i) => (
                        <div
                          key={i}
                          className={cn("bar", data.improvement ? "improvement" : "decline")}
                          style={{ height: `${data.value}%` }}
                        />
                      ))}
                    </div>
                    <div className="analytics-stats">
                      <div className="analytics-stat">
                        <strong>85%</strong>
                        <small>Avg engagement</small>
                      </div>
                      <div className="analytics-stat">
                        <strong>+12%</strong>
                        <small>Improvement</small>
                      </div>
                    </div>
                  </div>
                  <div className="analytics-card">
                    <h3>
                      <PieChart /> Health Trends
                    </h3>
                    <div className="analytics-stats">
                      {analyticsData.healthTrends.map((trend, i) => (
                        <div key={i} className="analytics-stat">
                          <strong>{trend.current}</strong>
                          <small>{trend.metric}</small>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Quick Elder Status */}
              <section className="elder-status-grid">
                <h2>Elder Status · বৃদ্ধ স্থিতি</h2>
                {eldersUnderCare.map((elder) => (
                  <div
                    key={elder.id}
                    className="elder-status-card"
                    onClick={() => setView("elders")}
                  >
                    <div>
                      <strong>{elder.name}</strong>
                      <small>
                        {elder.status} · {elder.lastActive}
                      </small>
                    </div>
                    <span
                      className={cn(
                        "status-dot",
                        elder.status === "Well"
                          ? "status-green"
                          : elder.status === "Needs attention"
                            ? "status-red"
                            : "status-yellow",
                      )}
                    />
                  </div>
                ))}
              </section>
            </section>
          </>
        )}

        {/* Family Dashboard Summary */}
        {!caregiver && (
          <section className="family-summary">
            <div>
              <small>Currently supporting</small>
              <h2>Anima Das</h2>
              <span>
                <Check /> Connected securely
              </span>
            </div>
            <ChevronRight />
          </section>
        )}

        <h2 className="dashboard-title">What would you like to do? · আপনি কী করতে চান?</h2>
        <div className="dashboard-grid">
          {items.map((item) => (
            <button key={item.id} onClick={() => setView(item.id)}>
              <IconBadge tone={item.tone}>{item.i}</IconBadge>
              <strong>{item.t}</strong>
              <small>{item.d}</small>
              <ChevronRight />
            </button>
          ))}
        </div>
        <div className="official-note">
          <ShieldCheck />
          <div>
            <strong>Private and permission-based</strong>
            <p>Elders control what you can see and manage.</p>
          </div>
        </div>
        <div className="cultural-note">
          <div className="cultural-icon">🌺</div>
          <div>
            <strong>North East India Initiative</strong>
            <p>
              Specially designed for the diverse communities of North East India, respecting local
              traditions and languages.
            </p>
          </div>
        </div>
        <div className="medical-disclaimer">
          <div className="disclaimer-icon">⚕️</div>
          <div>
            <strong>Medical Disclaimer</strong>
            <p>
              This application provides cognitive support activities and is not a substitute for
              professional medical diagnosis, treatment, or advice. Always consult qualified
              healthcare professionals for medical concerns. Emergency services: Call 104 for health
              emergencies.
            </p>
          </div>
        </div>
      </>
    );
  };

  const renderDetailView = () => {
    const titleMap = caregiver
      ? {
          overview: "Dashboard Overview",
          elders: "My Elders",
          cognitive: "Cognitive Training",
          "cognitive-game": "Pattern Match Game",
          analytics: "Analytics",
          alerts: "Alerts",
          tasks: "Care Tasks",
          health: "Health Monitor",
          memories: "Memory Sharing",
          schedule: "Daily Schedule",
          location: "Location",
          notes: "Care Notes",
          settings: "Settings",
          privacy: "Privacy Policy",
          terms: "Terms of Service",
        }
      : {
          overview: "Family Dashboard",
          progress: "Activity Progress",
          memories: "Memories",
          reminders: "Reminders",
          location: "Shared Location",
          settings: "Settings",
        };

    let content: ReactNode;

    if (view === "overview" && caregiver) {
      content = (
        <>
          <section className="detailed-overview">
            <h2>Today's Overview</h2>
            <div className="overview-timeline">
              <div className="timeline-item completed">
                <span className="timeline-time">9:00 AM</span>
                <div className="timeline-content">
                  <strong>Morning medication</strong>
                  <small>Anima Das · Completed</small>
                </div>
              </div>
              <div className="timeline-item in-progress">
                <span className="timeline-time">10:30 AM</span>
                <div className="timeline-content">
                  <strong>Blood pressure check</strong>
                  <small>Biren Sharma · In progress</small>
                </div>
              </div>
              <div className="timeline-item pending">
                <span className="timeline-time">11:00 AM</span>
                <div className="timeline-content">
                  <strong>Physical therapy</strong>
                  <small>Priya Devi · Scheduled</small>
                </div>
              </div>
              <div className="timeline-item pending">
                <span className="timeline-time">2:00 PM</span>
                <div className="timeline-content">
                  <strong>Memory game session</strong>
                  <small>Anima Das · Scheduled</small>
                </div>
              </div>
            </div>
          </section>
        </>
      );
    } else if (view === "elders" && caregiver) {
      content = (
        <>
          <section className="elders-detail">
            <h2>Elders Under Care · দেখভাল তলে বৃদ্ধ</h2>
            {eldersUnderCare.map((elder) => (
              <article key={elder.id} className="elder-detail-card">
                <div className="elder-detail-header">
                  <div>
                    <strong>{elder.name}</strong>
                    <small>
                      {elder.age} years old · {elder.age} বছর
                    </small>
                  </div>
                  <span
                    className={cn(
                      "status-badge",
                      elder.status === "Well"
                        ? "status-green"
                        : elder.status === "Needs attention"
                          ? "status-red"
                          : "status-yellow",
                    )}
                  >
                    {elder.status}
                  </span>
                </div>
                <div className="elder-detail-body">
                  <div>
                    <small>Location · অবস্থান</small>
                    <p>{elder.location}</p>
                  </div>
                  <div>
                    <small>Last active · শেষ সক্রিয়</small>
                    <p>{elder.lastActive}</p>
                  </div>
                  <div>
                    <small>Next task · পরবর্তী কাজ</small>
                    <p>{elder.nextTask}</p>
                  </div>
                </div>
                <div className="elder-detail-actions">
                  <ActionButton variant="secondary" onClick={() => setView("schedule")}>
                    View Schedule
                  </ActionButton>
                  <ActionButton variant="secondary" onClick={() => setView("health")}>
                    Health Data
                  </ActionButton>
                </div>
              </article>
            ))}
          </section>
        </>
      );
    } else if (view === "alerts" && caregiver) {
      content = (
        <>
          <section className="alerts-detail">
            <h2>All Alerts</h2>
            {alerts.map((alert) => (
              <article
                key={alert.id}
                className={cn(
                  "alert-detail-card",
                  alert.type === "urgent" ? "alert-urgent" : "alert-warning",
                )}
              >
                <div className="alert-header">
                  <span className="alert-icon">
                    {alert.type === "urgent" ? <Bell /> : <CircleHelp />}
                  </span>
                  <div>
                    <strong>{alert.elder}</strong>
                    <small>{alert.time}</small>
                  </div>
                  <span className="alert-type">{alert.type}</span>
                </div>
                <p>{alert.message}</p>
                <div className="alert-actions">
                  <ActionButton>Mark Resolved</ActionButton>
                  <ActionButton variant="secondary">Snooze 1 hour</ActionButton>
                </div>
              </article>
            ))}
          </section>
        </>
      );
    } else if (view === "tasks" && caregiver) {
      content = (
        <>
          <section className="tasks-detail">
            <h2>Care Tasks</h2>
            <div className="task-filters">
              <button className="filter-active">All Tasks</button>
              <button>Pending</button>
              <button>Completed</button>
            </div>
            {careTasks.map((task) => (
              <article
                key={task.id}
                className={cn(
                  "task-card",
                  task.status === "completed"
                    ? "task-completed"
                    : task.status === "in-progress"
                      ? "task-in-progress"
                      : "task-pending",
                )}
              >
                <div className="task-header">
                  <div>
                    <strong>{task.task}</strong>
                    <small>{task.elder}</small>
                  </div>
                  <span
                    className={cn(
                      "task-status",
                      task.status === "completed"
                        ? "status-green"
                        : task.status === "in-progress"
                          ? "status-blue"
                          : "status-yellow",
                    )}
                  >
                    {task.status}
                  </span>
                </div>
                <div className="task-details">
                  <div>
                    <small>Time</small>
                    <p>{task.time}</p>
                  </div>
                  <div>
                    <small>Assigned to</small>
                    <p>{task.assignedTo}</p>
                  </div>
                </div>
                <div className="task-actions">
                  {task.status === "pending" && (
                    <ActionButton onClick={() => updateCareTask(task.id, "in-progress")}>
                      Start Task
                    </ActionButton>
                  )}
                  {task.status === "in-progress" && (
                    <ActionButton
                      variant="secondary"
                      onClick={() => updateCareTask(task.id, "completed")}
                    >
                      Complete Task
                    </ActionButton>
                  )}
                </div>
              </article>
            ))}
          </section>
        </>
      );
    } else if (view === "health" && caregiver) {
      content = (
        <>
          <section className="health-detail">
            <h2>Health Monitor</h2>
            {healthData.map((health, index) => (
              <article
                key={index}
                className={cn(
                  "health-card",
                  health.status === "normal" ? "health-normal" : "health-attention",
                )}
              >
                <div className="health-header">
                  <strong>{health.elder}</strong>
                  <span
                    className={cn(
                      "health-status",
                      health.status === "normal" ? "status-green" : "status-red",
                    )}
                  >
                    {health.status}
                  </span>
                </div>
                <div className="health-metric">
                  <small>{health.metric}</small>
                  <p>{health.value}</p>
                </div>
                <small>{health.date}</small>
              </article>
            ))}
          </section>
          <div className="health-actions">
            <ActionButton variant="secondary">
              <Plus /> Add Health Reading
            </ActionButton>
          </div>
        </>
      );
    } else if (view === "cognitive" && caregiver) {
      content = (
        <>
          <section className="cognitive-detail">
            <h2>
              <Brain /> Cognitive Training
            </h2>
            <div className="cognitive-intro">
              <p>
                Memory exercises designed to support cognitive wellness for elderly citizens of
                North East India. These activities help maintain mental sharpness through gentle,
                adaptive challenges using familiar cultural elements.
              </p>
            </div>
            <div className="cognitive-grid">
              <div className="cognitive-card" onClick={() => setView("cognitive-game")}>
                <div className="cognitive-icon">
                  <Gamepad2 />
                </div>
                <h3>Traditional Pattern Match</h3>
                <p>Match Assamese mekhela patterns & traditional designs</p>
                <div className="cognitive-stats">
                  <span>Easy · 5 min</span>
                  <span className="status-green">Cultural</span>
                </div>
              </div>
              <div className="cognitive-card" onClick={() => {}}>
                <div className="cognitive-icon">
                  <Headphones />
                </div>
                <h3>Folk Song Memory</h3>
                <p>Remember lyrics from Bihu & traditional folk songs</p>
                <div className="cognitive-stats">
                  <span>Medium · 8 min</span>
                  <span className="status-yellow">Musical</span>
                </div>
              </div>
              <div className="cognitive-card" onClick={() => {}}>
                <div className="cognitive-icon">
                  <Activity />
                </div>
                <h3>Festival Sequence</h3>
                <p>Remember the order of festival activities</p>
                <div className="cognitive-stats">
                  <span>Easy · 6 min</span>
                  <span className="status-green">Cultural</span>
                </div>
              </div>
              <div className="cognitive-card" onClick={() => {}}>
                <div className="cognitive-icon">
                  <Camera />
                </div>
                <h3>Family Photo Memory</h3>
                <p>Remember family from traditional celebrations</p>
                <div className="cognitive-stats">
                  <span>Medium · 10 min</span>
                  <span className="status-blue">Personalized</span>
                </div>
              </div>
            </div>
            <div className="cognitive-progress">
              <h3>Daily Progress</h3>
              <div className="progress-bar-container">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: "60%" }} />
                </div>
                <span>60% Complete</span>
              </div>
              <p className="progress-note">Complete 2 more exercises to reach your daily goal</p>
            </div>
          </section>
        </>
      );
    } else if (view === "cognitive-game" && caregiver) {
      content = <MemoryMatchGame onBack={() => setView("cognitive")} />;
    } else if (view === "analytics" && caregiver) {
      content = (
        <>
          <section className="analytics-detail">
            <h2>Elder Progress Analytics</h2>
            <div className="analytics-card" style={{ marginBottom: "16px" }}>
              <h3>
                <TrendingUp /> Weekly Activity Engagement
              </h3>
              <div className="chart-container" style={{ height: "150px" }}>
                {analyticsData.activityEngagement.map((data, i) => (
                  <div
                    key={i}
                    className={cn("bar", data.improvement ? "improvement" : "decline")}
                    style={{ height: `${data.value}%` }}
                  />
                ))}
              </div>
              <div className="analytics-stats">
                <div className="analytics-stat">
                  <strong>85%</strong>
                  <small>Avg engagement</small>
                </div>
                <div className="analytics-stat">
                  <strong>+12%</strong>
                  <small>Weekly improvement</small>
                </div>
                <div className="analytics-stat">
                  <strong>6.2 hrs</strong>
                  <small>Total activity time</small>
                </div>
              </div>
            </div>

            <div className="analytics-card" style={{ marginBottom: "16px" }}>
              <h3>
                <BarChart3 /> Individual Elder Progress
              </h3>
              {analyticsData.elderProgress.map((elder, i) => (
                <div key={i} style={{ marginBottom: "12px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                    }}
                  >
                    <strong>{elder.name}</strong>
                    <span>{elder.weekProgress}%</span>
                  </div>
                  <div
                    style={{
                      height: "8px",
                      background: "var(--secondary)",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${elder.weekProgress}%`,
                        background:
                          elder.trend === "up"
                            ? "var(--success)"
                            : elder.trend === "stable"
                              ? "var(--warning)"
                              : "var(--destructive)",
                        borderRadius: "4px",
                      }}
                    />
                  </div>
                  <small>
                    {elder.engagement} engagement ·{" "}
                    {elder.trend === "up"
                      ? "Improving"
                      : elder.trend === "stable"
                        ? "Stable"
                        : "Needs attention"}
                  </small>
                </div>
              ))}
            </div>

            <div className="analytics-card">
              <h3>
                <PieChart /> Health Trends Comparison
              </h3>
              <div className="analytics-stats">
                {analyticsData.healthTrends.map((trend, i) => (
                  <div key={i} className="analytics-stat">
                    <strong>{trend.current}</strong>
                    <small>{trend.metric}</small>
                    <span className={cn("mini-chart", trend.improvement ? "up" : "down")}>
                      <div className="bar" style={{ height: "100%", width: "4px" }} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      );
    } else if (view === "memories" || view === "review") {
      content = (
        <>
          <section className="memories-detail">
            <article className="review-memory">
              <img
                src={northeastWelcome}
                loading="lazy"
                width={1200}
                height={900}
                alt="A green valley in North East India"
              />
              <span>Awaiting review</span>
              <h2>A day in the hills</h2>
              <p>“A peaceful family visit after the monsoon."</p>
              <div>
                <ActionButton>
                  <Check /> Approve
                </ActionButton>
                <ActionButton variant="secondary">
                  <X /> Not now
                </ActionButton>
              </div>
            </article>
            <ActionButton variant="secondary">
              <Plus /> Add memory
            </ActionButton>
          </section>
        </>
      );
    } else if (view === "reminders") {
      content = (
        <>
          <section className="reminders-detail">
            <div className="reminder-list">
              <h2>Upcoming reminders</h2>
              {[
                { time: "9:00 AM", title: "Morning medicine", desc: "After breakfast" },
                { time: "6:00 PM", title: "Call Priya", desc: "A friendly evening call" },
              ].map((r, i) => (
                <article className="reminder-card" key={r.title}>
                  <div className="reminder-time">
                    <Clock3 />
                    {r.time}
                  </div>
                  <h2>{r.title}</h2>
                  <p>{r.desc}</p>
                </article>
              ))}
            </div>
            <ActionButton variant="secondary">
              <Plus /> Add reminder
            </ActionButton>
          </section>
        </>
      );
    } else if (view === "location") {
      content = (
        <>
          <section className="location-detail">
            <div className="location-info">
              <MapPin />
              <h2>Location sharing</h2>
              <p>Location is private. No active sharing.</p>
            </div>
            <ActionButton variant="secondary">
              <LocateFixed /> Request location
            </ActionButton>
          </section>
        </>
      );
    } else if (view === "schedule" && caregiver) {
      content = (
        <>
          <section className="schedule-detail">
            <div className="empty-soft">
              <CircleHelp />
              <h2>Schedule View</h2>
              <p>Detailed schedule management coming soon.</p>
            </div>
          </section>
        </>
      );
    } else if (view === "notes" && caregiver) {
      content = (
        <>
          <section className="notes-detail">
            <div className="empty-soft">
              <CircleHelp />
              <h2>Care Notes</h2>
              <p>Documentation system coming soon.</p>
            </div>
          </section>
        </>
      );
    } else if (view === "privacy" && caregiver) {
      content = <PrivacyPolicyView />;
    } else if (view === "terms" && caregiver) {
      content = <TermsOfServiceView />;
    } else if (view === "settings") {
      content = (
        <>
          <section className="settings-detail">
            <h2>Settings</h2>
            <div className="settings-list">
              <div className="setting-item">
                <strong>Notifications</strong>
                <small>Manage alert preferences</small>
                <ChevronRight />
              </div>
              <div className="setting-item">
                <strong>Account</strong>
                <small>Profile and security</small>
                <ChevronRight />
              </div>
              <div className="setting-item">
                <strong>Help</strong>
                <small>Support and documentation</small>
                <ChevronRight />
              </div>
            </div>
            <ActionButton variant="danger" onClick={onLogout}>
              Log out
            </ActionButton>
          </section>
        </>
      );
    } else {
      content = (
        <>
          <section className="coming-soon">
            <div className="empty-soft">
              <CircleHelp />
              <h2>Coming soon</h2>
              <p>This feature will be available soon.</p>
            </div>
            <ActionButton variant="secondary" onClick={() => setView("home")}>
              <ArrowLeft /> Back to dashboard
            </ActionButton>
          </section>
        </>
      );
    }

    return (
      <>
        <PageHeader
          title={titleMap[view as keyof typeof titleMap] || "Care support"}
          subtitle={caregiver ? "Supporting elders under your care" : "Supporting Anima Das"}
          onBack={() => setView("home")}
        />
        {content}
      </>
    );
  };

  return (
    <div className="phone-app helper-app">
      <StatusStrip />
      {!isOnline && (
        <div className="offline-banner">
          <CloudOff />
          <span>Offline mode - data saved locally</span>
        </div>
      )}
      <div className="app-content">{view === "home" ? renderHome() : renderDetailView()}</div>
      <nav className="bottom-nav helper-nav">
        <button className={view === "home" ? "active" : ""} onClick={() => setView("home")}>
          <Home />
          <span>Home</span>
        </button>
        <button onClick={() => setView(caregiver ? "elders" : "memories")}>
          <Users />
          <span>{caregiver ? "Elders" : "Memories"}</span>
        </button>
        <button onClick={() => setView("settings")}>
          <Settings />
          <span>Settings</span>
        </button>
        <button onClick={onLogout}>
          <LogOut />
          <span>Log out</span>
        </button>
      </nav>
    </div>
  );
}

export default function SilirualApp() {
  const [stage, setStage] = useState<Stage>("welcome");
  const [mode, setMode] = useState<"using" | "helping">("using");
  const [role, setRole] = useState<Role>("elder");
  const [name, setName] = useState("Anima");
  const [textSize, setTextSize] = useState<TextSize>("large");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("silirual-demo");
    if (saved) {
      try {
        const x = JSON.parse(saved);
        if (x.textSize) setTextSize(x.textSize);
        if (x.name) setName(x.name);
      } catch {
        // Keep the app usable if a previous local preference cannot be read.
      }
    }

    // Check for existing auth session
    supabaseAuth.getSession().then((user) => {
      if (user) {
        setName(user.displayName || "Friend");
        setRole(user.activeRole);
        setStage("app");
      }
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem("silirual-demo", JSON.stringify({ textSize, name }));
  }, [ready, textSize, name]);

  const sizeClass = useMemo(() => `text-size-${textSize}`, [textSize]);
  if (!ready) return null;

  const logout = async () => {
    await supabaseAuth.logout();
    setStage("welcome");
  };

  return (
    <div className={cn("silirual-root", sizeClass)}>
      {stage === "welcome" && (
        <Welcome
          onNext={(m) => {
            setMode(m);
            setStage("role");
          }}
        />
      )}
      {stage === "role" && (
        <RoleSelect
          mode={mode}
          onBack={() => setStage("welcome")}
          onChoose={(r) => {
            setRole(r);
            setStage("auth");
          }}
        />
      )}
      {stage === "auth" && (
        <Auth
          role={role}
          onBack={() => setStage("role")}
          onContinue={() => setStage(role === "elder" ? "onboarding" : "app")}
        />
      )}{" "}
      {stage === "onboarding" && (
        <Onboarding
          textSize={textSize}
          setTextSize={setTextSize}
          onDone={(n) => {
            setName(n);
            setStage("app");
          }}
        />
      )}
      {stage === "app" &&
        (role === "elder" ? (
          <ElderApp name={name} textSize={textSize} setTextSize={setTextSize} onLogout={logout} />
        ) : (
          <HelperApp role={role} onLogout={logout} />
        ))}
    </div>
  );
}
