import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Alert,
  Image
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Type definitions
type Stage = "splash" | "welcome" | "role" | "auth" | "onboarding" | "app";
type Role = "elder" | "family" | "caregiver";
type TextSize = "normal" | "large" | "extra";
type ElderView = "today" | "games" | "activities" | "memories" | "reminders" | "routine" | "help" | "settings";

const Stack = createNativeStackNavigator();

// ============ UTILITY COMPONENTS ============

function ActionButton({ children, onPress, variant = "primary", disabled }: { 
  children: React.ReactNode; onPress?: () => void; variant?: "primary" | "secondary" | "ghost" | "danger"; disabled?: boolean; 
}) {
  return (
    <TouchableOpacity 
      style={[styles.actionButton, styles[`actionButton${variant.charAt(0).toUpperCase() + variant.slice(1)}`], disabled && styles.actionButtonDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.actionButtonText, styles[`actionButtonText${variant.charAt(0).toUpperCase() + variant.slice(1)}`]]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

function IconBadge({ children, tone = "primary" }: { children: React.ReactNode; tone?: "primary" | "green" | "gold" | "red" }) {
  return (
    <View style={[styles.iconBadge, styles[`iconBadge${tone.charAt(0).toUpperCase() + tone.slice(1)}`]]}>
      {children}
    </View>
  );
}

function PageHeader({ title, subtitle, onBack, action }: { title: string; subtitle?: string; onBack?: () => void; action?: React.ReactNode }) {
  return (
    <View style={styles.pageHeader}>
      <View style={styles.pageHeaderRow}>
        {onBack && <TouchableOpacity style={styles.iconButton} onPress={onBack}><Text style={styles.iconButtonText}>←</Text></TouchableOpacity>}
        <View style={styles.headerTextContainer}>
          <Text style={styles.pageHeaderTitle}>{title}</Text>
          {subtitle && <Text style={styles.pageHeaderSubtitle}>{subtitle}</Text>}
        </View>
        {action}
      </View>
    </View>
  );
}

function ToggleRow({ title, text, value, onChange }: { title: string; text: string; value: boolean; onChange: () => void }) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleContent}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleText}>{text}</Text>
      </View>
      <TouchableOpacity 
        style={[styles.switch, value && styles.switchOn]} 
        onPress={onChange}
      >
        <View style={[styles.switchThumb, value && styles.switchThumbOn]} />
      </TouchableOpacity>
    </View>
  );
}

// ============ AUTH & ONBOARDING COMPONENTS ============

function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadingOut(true), 4500);
    const mainTimer = setTimeout(() => onComplete(), 5000);
    return () => { clearTimeout(fadeTimer); clearTimeout(mainTimer); };
  }, [onComplete]);

  return (
    <View style={[styles.splashScreen, fadingOut && styles.splashScreenFadeOut]}>
      <Text style={styles.splashText}>SiliRual</Text>
    </View>
  );
}

function Welcome({ onNext }: { onNext: (mode: "using" | "helping") => void }) {
  return (
    <ScrollView style={styles.welcomeContainer}>
      <View style={styles.welcomeHeader}>
        <View style={styles.ministryBadge}>
          <Text style={styles.ministryBadgeText}>Ministry of Health & Family Welfare</Text>
        </View>
      </View>
      
      <View style={styles.heroSection}>
        <View style={styles.heroPlaceholder}>
          <Text style={styles.heroText}>SiliRual</Text>
          <Text style={styles.heroLocation}>North-East India</Text>
        </View>
      </View>
      
      <View style={styles.welcomeActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => onNext("using")}>
          <Text style={styles.actionButtonText}>I am using SILIRUAL</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => onNext("helping")}>
          <Text style={styles.actionButtonText}>I am helping someone</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.welcomeFooter}>
        <Text style={styles.footerText}>Digital India</Text>
        <Text style={styles.footerText}>Ayushman Bharat</Text>
      </View>
    </ScrollView>
  );
}

function RoleSelect({ mode, onChoose, onBack }: { mode: "using" | "helping"; onChoose: (r: Role) => void; onBack: () => void }) {
  const roles = mode === "using" ? [
    { id: "elder" as Role, title: "For myself", text: "Activities, reminders and familiar memories" },
    { id: "family" as Role, title: "As a family member", text: "Support someone you care about" },
  ] : [
    { id: "family" as Role, title: "Family member", text: "Share memories and help with daily reminders" },
    { id: "caregiver" as Role, title: "Caregiver", text: "Support and monitor people in your care" }
  ];
  
  return (
    <SafeAreaView style={styles.simpleScreen}>
      <PageHeader title="How will you use SILIRUAL?" subtitle="Choose your role to get started" onBack={onBack} />
      <View style={styles.choiceList}>
        {roles.map((r) => (
          <TouchableOpacity key={r.id} style={styles.choiceCard} onPress={() => onChoose(r.id)}>
            <Text style={styles.choiceTitle}>{r.title}</Text>
            <Text style={styles.choiceText}>{r.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

function Auth({ role, onContinue, onBack }: { role: Role; onContinue: () => void; onBack: () => void }) {
  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [sent, setSent] = useState(false);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  
  const submit = () => {
    setLoading(true);
    // Demo mode - always succeed
    setTimeout(() => {
      setLoading(false);
      if (sent) {
        onContinue();
      } else {
        setSent(true);
        setValue("");
      }
    }, 1000);
  };
  
  const handleGuest = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onContinue();
    }, 500);
  };
  
  return (
    <SafeAreaView style={styles.simpleScreen}>
      <PageHeader 
        title={sent ? "Enter your code" : "Welcome back"} 
        subtitle={sent ? "We sent a 6-digit code to your phone." : `Continue as ${role === "elder" ? "an elder" : role === "family" ? "a family member" : "a caregiver"}.`} 
        onBack={onBack} 
      />
      
      <View style={styles.segmented}>
        <TouchableOpacity style={[styles.segmentButton, mode === "phone" && styles.segmentButtonActive]} onPress={() => {setMode("phone");}}>
          <Text style={styles.segmentButtonText}>Phone</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.segmentButton, mode === "email" && styles.segmentButtonActive]} onPress={() => {setMode("email");}}>
          <Text style={styles.segmentButtonText}>Email</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.formStack}>
        <Text style={styles.label}>{sent ? "6-digit code" : mode === "phone" ? "Mobile number" : "Email address"}</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          placeholder={sent ? "123456" : mode === "phone" ? "+91 98765 43210" : "you@example.com"}
          keyboardType={sent || mode === "phone" ? "numeric" : "email-address"}
          maxLength={sent ? 6 : undefined}
          editable={!loading}
        />
      </View>
      
      <ActionButton onPress={submit} disabled={loading}>
        {loading ? "Processing..." : sent ? "Verify and continue" : mode === "phone" ? "Send code" : "Log in securely"}
      </ActionButton>
      
      <View style={styles.orDivider}>
        <View style={styles.orLine} />
        <Text style={styles.orText}>or</Text>
        <View style={styles.orLine} />
      </View>
      
      <ActionButton variant="ghost" onPress={handleGuest} disabled={loading}>
        Continue without an account
      </ActionButton>
    </SafeAreaView>
  );
}

function Onboarding({ onDone }: { onDone: (name: string) => void }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(0);
  const [settings, setSettings] = useState({ sound: true, haptic: true, voice: false, contrast: false });
  
  const flip = (key: keyof typeof settings) => setSettings(v => ({...v, [key]: !v[key]}));
  
  const languages = ["English", "हिन्दी", "অসমীয়া", "বাংলা", "নেপালী", "মৈতৈলোন্"];
  
  return (
    <SafeAreaView style={styles.simpleScreen}>
      <View style={styles.progressSection}>
        <Text style={styles.progressLabel}>Step {step} of 4</Text>
        <Text style={styles.progressPercent}>{step * 25}% complete</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${step * 25}%` }]} />
      </View>
      
      {step === 1 && (
        <>
          <PageHeader title="Choose your language" subtitle="You can change this at any time." />
          <View style={styles.languageGrid}>
            {languages.map((l, i) => (
              <TouchableOpacity 
                key={l} 
                style={[styles.languageCard, selectedLanguage === i && styles.languageCardSelected]} 
                onPress={() => setSelectedLanguage(i)}
              >
                <Text style={styles.languageCardText}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
      
      {step === 2 && (
        <>
          <PageHeader title="Make it comfortable" subtitle="Try each option. Changes happen right away." />
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Accessibility</Text>
            <ToggleRow title="Sound" text="Hear helpful sounds" value={settings.sound} onChange={() => flip("sound")} />
            <ToggleRow title="Vibration" text="Feel feedback after a tap" value={settings.haptic} onChange={() => flip("haptic")} />
            <ToggleRow title="Voice instructions" text="Hear instructions read aloud" value={settings.voice} onChange={() => flip("voice")} />
            <ToggleRow title="High contrast" text="Make colours easier to see" value={settings.contrast} onChange={() => flip("contrast")} />
          </View>
        </>
      )}
      
      {step === 3 && (
        <>
          <PageHeader title="What should we call you?" subtitle="This helps us make SILIRUAL feel familiar." />
          <View style={styles.formStack}>
            <Text style={styles.label}>Your name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="For example, Anima"
            />
            <Text style={styles.label}>Age range (optional)</Text>
            <TextInput style={styles.input} placeholder="Choose an age range" />
          </View>
        </>
      )}
      
      {step === 4 && (
        <>
          <PageHeader title="You are in control" subtitle="Choose what SILIRUAL may use. You can change these later." />
          <View style={styles.settingsSection}>
            <ToggleRow title="Memories" text="Show photos and stories shared with you" value={true} onChange={() => {}} />
            <ToggleRow title="Reminders" text="Notify you about your daily plan" value={true} onChange={() => {}} />
            <ToggleRow title="Location sharing" text="Allow time-limited sharing when you choose" value={false} onChange={() => {}} />
          </View>
        </>
      )}
      
      <View style={styles.onboardingActions}>
        {step > 1 && <ActionButton variant="secondary" onPress={() => setStep(step-1)}>Back</ActionButton>}
        <ActionButton disabled={step === 3 && !name.trim()} onPress={() => step < 4 ? setStep(step+1) : onDone(name || "Friend")}>
          {step === 4 ? "Finish setup" : "Continue"}
        </ActionButton>
      </View>
    </SafeAreaView>
  );
}

// ============ GAME COMPONENTS ============

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
        setCards(prev => prev.map(card => 
          card.id === first || card.id === second ? { ...card, matched: true } : card
        ));
        setScore(score + 10);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  const isComplete = cards.every(card => card.matched);

  const getPatternEmoji = (pattern: string) => {
    switch(pattern) {
      case "mekhela": return "👗";
      case "gamocha": return "🧣";
      case "bihu": return "💃";
      case "xatki": return "🪔";
      default: return "❓";
    }
  };

  return (
    <SafeAreaView style={styles.gameScreen}>
      <PageHeader title="Traditional Pattern Match" subtitle="Match Assamese mekhela patterns" onBack={onBack} />
      <View style={styles.gameStats}>
        <Text style={styles.gameStatText}>Score: {score}</Text>
        <Text style={styles.gameStatText}>Moves: {moves}</Text>
      </View>
      <View style={styles.memoryGameGrid}>
        {cards.map(card => (
          <TouchableOpacity
            key={card.id}
            style={[
              styles.memoryCard,
              card.matched && styles.memoryCardMatched,
              flipped.includes(card.id) && styles.memoryCardFlipped
            ]}
            onPress={() => handleCardClick(card.id)}
            disabled={card.matched}
          >
            <View style={[styles.memoryCardContent, { backgroundColor: flipped.includes(card.id) || card.matched ? card.color : '#7c3aed' }]}>
              <Text style={styles.memoryCardText}>
                {flipped.includes(card.id) || card.matched ? getPatternEmoji(card.pattern) : "?"}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      {isComplete && (
        <View style={styles.gameCompleteOverlay}>
          <Text style={styles.gameCompleteText}>Pattern Match Complete!</Text>
          <Text style={styles.gameCompleteScore}>Final Score: {score}</Text>
          <ActionButton onPress={onBack}>Return to Games</ActionButton>
        </View>
      )}
    </SafeAreaView>
  );
}

function PicturePairs({ onClose, gameName = "Picture Pairs" }: { onClose: () => void; gameName?: string }) {
  const [phase, setPhase] = useState<"intro"|"play"|"paused"|"result">("intro");
  const cards = ["flower","star","flower","star"];
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [help, setHelp] = useState(false);
  
  const choose = (i: number) => {
    if(open.length === 2 || open.includes(i) || matched.includes(i)) return;
    const next = [...open, i];
    setOpen(next);
    if(next.length === 2) {
      setTimeout(() => {
        const first = next[0];
        const second = next[1];
        if(first !== undefined && second !== undefined && cards[first] === cards[second]) {
          const all = [...matched, first, second];
          setMatched(all);
          setOpen([]);
          if(all.length === cards.length) setTimeout(() => setPhase("result"), 700);
        } else {
          setOpen([]);
        }
      }, 900);
    }
  };
  
  const picture = (card: string) => card === "flower" ? "🌸" : "⭐";
  
  const handleFeeling = (feeling: string) => {
    console.log(`User feeling: ${feeling}`);
    onClose();
  };
  
  if(phase === "intro") {
    return (
      <SafeAreaView style={styles.gameScreen}>
        <PageHeader title={gameName} subtitle="A gentle matching activity" onBack={onClose} />
        <View style={styles.gameCenter}>
          <Text style={styles.gameHeroIcon}>🌸</Text>
          <View style={styles.instructionCard}>
            <Text style={styles.instructionTitle}>How to play</Text>
            <Text style={styles.instructionText}>Tap two cards. If the pictures are the same, you have found a pair.</Text>
          </View>
          <View style={styles.examplePairs}>
            <Text style={styles.exampleCard}>{picture("flower")}</Text>
            <Text style={styles.exampleCard}>{picture("flower")}</Text>
            <Text style={styles.exampleText}>These match!</Text>
          </View>
          <ActionButton variant="secondary" onPress={() => Alert.alert("Audio", "Playing instructions...")}>🔊 Hear instructions</ActionButton>
          <ActionButton onPress={() => setPhase("play")}>▶️ Start activity</ActionButton>
        </View>
      </SafeAreaView>
    );
  }
  
  if(phase === "paused") {
    return (
      <SafeAreaView style={styles.gameScreen}>
        <View style={styles.gameCenter}>
          <View style={styles.iconBadgeLarge}><Text style={styles.iconBadgeText}>⏸️</Text></View>
          <Text style={styles.gameTitle}>Activity paused</Text>
          <Text style={styles.gameSubtitle}>Take all the time you need.</Text>
          <ActionButton onPress={() => setPhase("play")}>▶️ Continue</ActionButton>
          <ActionButton variant="secondary" onPress={() => setPhase("result")}>⏹️ Stop for now</ActionButton>
        </View>
      </SafeAreaView>
    );
  }
  
  if(phase === "result") {
    return (
      <SafeAreaView style={styles.gameScreen}>
        <View style={styles.gameCenter}>
          <View style={styles.celebration}>✓</View>
          <Text style={styles.officialLabel}>Activity complete</Text>
          <Text style={styles.gameTitle}>Well done!</Text>
          <Text style={styles.gameSubtitle}>You found all the picture pairs.</Text>
          <View style={styles.resultStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>2</Text>
              <Text style={styles.statLabel}>Pairs found</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{help ? 1 : 0}</Text>
              <Text style={styles.statLabel}>Help used</Text>
            </View>
          </View>
          <View style={styles.savedNote}><Text style={styles.savedNoteText}>✓ Saved on this device</Text></View>
          <Text style={styles.feelingTitle}>How did that feel?</Text>
          <View style={styles.feelingRow}>
            <TouchableOpacity style={styles.feelingButton} onPress={() => handleFeeling("enjoyable")}>
              <Text style={styles.feelingEmoji}>😊</Text>
              <Text style={styles.feelingLabel}>Enjoyable</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.feelingButton} onPress={() => handleFeeling("okay")}>
              <Text style={styles.feelingEmoji}>🙂</Text>
              <Text style={styles.feelingLabel}>Okay</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.feelingButton} onPress={() => handleFeeling("difficult")}>
              <Text style={styles.feelingEmoji}>😓</Text>
              <Text style={styles.feelingLabel}>Difficult</Text>
            </TouchableOpacity>
          </View>
          <ActionButton onPress={onClose}>🏠 Return to Games</ActionButton>
          <ActionButton variant="secondary" onPress={() => {setMatched([]);setOpen([]);setHelp(false);setPhase("intro");}}>🔄 Play again</ActionButton>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.gameScreen}>
      <View style={styles.gameTopBar}>
        <View>
          <Text style={styles.gameSmallText}>Round 1 of 3</Text>
          <Text style={styles.gameStrongText}>Find two matching pictures</Text>
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={() => setPhase("paused")}>
          <Text style={styles.iconButtonText}>⏸️</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: matched.length ? "68%" : "33%" }]} />
      </View>
      {help && (
        <View style={styles.hintBanner}>
          <Text style={styles.hintIcon}>❓</Text>
          <Text style={styles.hintText}>Try turning over the top-left card first.</Text>
        </View>
      )}
      <View style={styles.pairBoard}>
        {cards.map((card, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.pairCard,
              (open.includes(i) || matched.includes(i)) && styles.pairCardOpen,
              matched.includes(i) && styles.pairCardMatched
            ]}
            onPress={() => choose(i)}
          >
            <Text style={[
              styles.pairCardText,
              open.includes(i) && styles.pairCardTextOpen,
              matched.includes(i) && styles.pairCardTextMatched
            ]}>
              {open.includes(i) || matched.includes(i) ? picture(card) : "?"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.gameControls}>
        <TouchableOpacity style={styles.gameControlButton} onPress={() => setPhase("paused")}>
          <Text style={styles.gameControlIcon}>⏸️</Text>
          <Text style={styles.gameControlText}>Pause</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gameControlButton} onPress={() => setHelp(true)}>
          <Text style={styles.gameControlIcon}>❓</Text>
          <Text style={styles.gameControlText}>Help</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gameControlButton} onPress={() => setPhase("result")}>
          <Text style={styles.gameControlIcon}>⏹️</Text>
          <Text style={styles.gameControlText}>Stop</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ============ ELDER APP COMPONENTS ============

function ElderApp({ name, onLogout }: { name: string; onLogout: () => void }) {
  const [view, setView] = useState<ElderView>("today");
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [showMemoryMatch, setShowMemoryMatch] = useState(false);
  
  const renderView = () => {
    if (activeGame) {
      return <PicturePairs onClose={() => setActiveGame(null)} gameName={activeGame} />;
    }
    
    if (showMemoryMatch) {
      return <MemoryMatchGame onBack={() => setShowMemoryMatch(false)} />;
    }
    
    switch(view) {
      case "today":
        return (
          <View style={styles.dashboard}>
            <Text style={styles.greeting}>Good morning, {name}!</Text>
            <Text style={styles.featuredActivity}>Featured: Morning walk</Text>
            <Text style={styles.routinePreview}>Today's routine starting at 9 AM</Text>
            <ActionButton onPress={() => setActiveGame("Picture Pairs")}>▶️ Start Picture Pairs</ActionButton>
          </View>
        );
      case "games":
        return (
          <View style={styles.dashboard}>
            <Text style={styles.sectionTitle}>Games</Text>
            <TouchableOpacity style={styles.gameCard} onPress={() => setActiveGame("Picture Pairs")}>
              <Text style={styles.gameEmoji}>🌸</Text>
              <View style={styles.gameCardContent}>
                <Text style={styles.gameName}>Picture Pairs</Text>
                <Text style={styles.gameDesc}>Find two pictures that match</Text>
                <Text style={styles.gameLevel}>Gentle · 3 rounds</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gameCard} onPress={() => setShowMemoryMatch(true)}>
              <Text style={styles.gameEmoji}>👗</Text>
              <View style={styles.gameCardContent}>
                <Text style={styles.gameName}>Traditional Pattern Match</Text>
                <Text style={styles.gameDesc}>Match Assamese mekhela patterns</Text>
                <Text style={styles.gameLevel}>Cultural · 4 rounds</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gameCard}>
              <Text style={styles.gameEmoji}>🔷</Text>
              <View style={styles.gameCardContent}>
                <Text style={styles.gameName}>Shape Match</Text>
                <Text style={styles.gameDesc}>Choose the matching shape</Text>
                <Text style={styles.gameLevel}>Gentle · 4 rounds</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gameCard}>
              <Text style={styles.gameEmoji}>📍</Text>
              <View style={styles.gameCardContent}>
                <Text style={styles.gameName}>Remember the Place</Text>
                <Text style={styles.gameDesc}>Remember where the object was</Text>
                <Text style={styles.gameLevel}>Easy · 3 rounds</Text>
              </View>
            </TouchableOpacity>
          </View>
        );
      case "memories":
        return (
          <View style={styles.dashboard}>
            <Text style={styles.sectionTitle}>Memories</Text>
            <View style={styles.memoryCard}>
              <View style={styles.memoryPhoto}>
                <Text style={styles.memoryPhotoText}>🏔️</Text>
                <View style={styles.memoryBadge}>
                  <Text style={styles.memoryBadgeText}>✓ Shared with you</Text>
                </View>
              </View>
              <View style={styles.memoryContent}>
                <Text style={styles.memoryDate}>12 September 2026</Text>
                <Text style={styles.memoryTitle}>Springtime in the hills</Text>
                <Text style={styles.memoryDescription}>We visited this peaceful valley together after the rain. You loved the red flowers by the path.</Text>
                <TouchableOpacity style={styles.memoryButton}>
                  <Text style={styles.memoryButtonText}>🔊 Listen to this story</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.emptySoft}>
              <Text style={styles.emptyIcon}>📷</Text>
              <Text style={styles.emptyTitle}>More memories are on their way</Text>
              <Text style={styles.emptyText}>Your family can share familiar photos and stories with you.</Text>
            </View>
          </View>
        );
      case "reminders":
        return (
          <View style={styles.dashboard}>
            <Text style={styles.sectionTitle}>Reminders</Text>
            <View style={styles.successBanner}>
              <Text style={styles.successBannerText}>✓ Reminders are ready on this device.</Text>
            </View>
            {[
              { time: "9:00 AM", title: "Morning medicine", desc: "After breakfast" },
              { time: "6:00 PM", title: "Call Priya", desc: "A friendly evening call" }
            ].map((r, i) => (
              <View key={r.title} style={styles.reminderCard}>
                <View style={styles.reminderTime}>
                  <Text style={styles.reminderTimeIcon}>🕐</Text>
                  <Text style={styles.reminderTimeText}>{r.time}</Text>
                </View>
                <Text style={styles.reminderTitle}>{r.title}</Text>
                <Text style={styles.reminderDesc}>{r.desc}</Text>
                <View style={styles.reminderActions}>
                  <ActionButton style={styles.reminderButton}>✓ Mark done</ActionButton>
                  <ActionButton variant="secondary" style={styles.reminderButton}>🕐 Snooze 15 min</ActionButton>
                </View>
              </View>
            ))}
          </View>
        );
      case "activities":
        return (
          <View style={styles.dashboard}>
            <Text style={styles.sectionTitle}>Activities</Text>
            <View style={styles.tabsLine}>
              <TouchableOpacity style={[styles.tabButton, styles.tabButtonActive]}>
                <Text style={styles.tabText}>Planned · 2</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tabButton}>
                <Text style={styles.tabText}>Finished · 1</Text>
              </TouchableOpacity>
            </View>
            {[
              { time: "8:30 AM", name: "Morning walk", icon: "🚶", status: "Completed" },
              { time: "11:00 AM", name: "Picture Pairs", icon: "🌸", status: "Ready" },
              { time: "4:30 PM", name: "Listen to music", icon: "🎵", status: "Later today" }
            ].map((a) => (
              <View key={a.name} style={styles.activityCard}>
                <Text style={styles.activityIcon}>{a.icon}</Text>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTime}>{a.time} · {a.status}</Text>
                  <Text style={styles.activityName}>{a.name}</Text>
                </View>
                <ActionButton variant="secondary" style={styles.activityButton}>
                  {a.status === "Completed" ? "Plan again" : "Start"}
                </ActionButton>
              </View>
            ))}
          </View>
        );
      case "routine":
        return (
          <View style={styles.dashboard}>
            <Text style={styles.sectionTitle}>My daily routine</Text>
            <Text style={styles.sectionSubtitle}>A comfortable rhythm for your day.</Text>
            {[
              ["Start the day", "Morning walk and breakfast", "☀️"],
              ["Play a game", "Picture Pairs is ready", "🌸"],
              ["Enjoy a memory", "Springtime in the hills", "📷"],
              ["Evening reminder", "Call Priya at 6:00 PM", "🔔"]
            ].map((r, i) => (
              <View key={i} style={styles.routineItem}>
                <View style={[styles.routineNumber, i === 0 && styles.routineNumberComplete]}>
                  <Text style={[styles.routineNumberText, i === 0 && styles.routineNumberTextComplete]}>{i === 0 ? "✓" : i + 1}</Text>
                </View>
                <View style={styles.routineContent}>
                  <Text style={styles.routineIcon}>{r[2]}</Text>
                  <View style={styles.routineText}>
                    <Text style={styles.routineTitle}>{r[0]}</Text>
                    <Text style={styles.routineDesc}>{r[1]}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        );
      case "help":
        return (
          <View style={styles.dashboard}>
            <Text style={styles.sectionTitle}>Help</Text>
            <ActionButton style={styles.callButton} onPress={() => Alert.alert("Calling", "Calling trusted person...")}>📞 Call a trusted person</ActionButton>
            <ActionButton variant="danger" onPress={() => Alert.alert("Emergency", "Calling 104...")}>📞 Emergency: 104 (Health Helpline)</ActionButton>
          </View>
        );
      case "settings":
        return (
          <View style={styles.dashboard}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <ToggleRow title="Sound" text="Hear helpful sounds" value={true} onChange={() => {}} />
            <ToggleRow title="Large text" text="Make text bigger" value={false} onChange={() => {}} />
            <TouchableOpacity style={styles.settingItem} onPress={() => setView("privacy")}>
              <Text style={styles.settingIcon}>🛡️</Text>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Privacy Policy</Text>
                <Text style={styles.settingDesc}>How we protect your data</Text>
              </View>
              <Text style={styles.settingArrow}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem} onPress={() => setView("terms")}>
              <Text style={styles.settingIcon}>📖</Text>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Terms of Service</Text>
                <Text style={styles.settingDesc}>Government terms and conditions</Text>
              </View>
              <Text style={styles.settingArrow}>→</Text>
            </TouchableOpacity>
            <ActionButton variant="danger" onPress={onLogout}>Log out</ActionButton>
          </View>
        );
      case "privacy":
        return (
          <ScrollView style={styles.dashboard}>
            <Text style={styles.legalTitle}>Privacy Policy</Text>
            <Text style={styles.legalSubtitle}>Your data is protected</Text>
            <View style={styles.legalSection}>
              <Text style={styles.legalHeading}>Data Collection</Text>
              <Text style={styles.legalText}>SiliRual collects only essential information for cognitive health support: name, age, language preference, and cognitive training progress. No medical data is collected without explicit consent.</Text>
            </View>
            <View style={styles.legalSection}>
              <Text style={styles.legalHeading}>Data Storage</Text>
              <Text style={styles.legalText}>Your data is stored securely and protected with industry-standard encryption.</Text>
            </View>
            <View style={styles.legalSection}>
              <Text style={styles.legalHeading}>Data Sharing</Text>
              <Text style={styles.legalText}>Your data is never shared with third parties without your explicit permission. Family/caregiver access requires your approval and can be revoked at any time.</Text>
            </View>
            <View style={styles.legalSection}>
              <Text style={styles.legalHeading}>User Rights</Text>
              <Text style={styles.legalText}>You have the right to access, correct, or delete your personal data.</Text>
            </View>
            <View style={styles.legalSection}>
              <Text style={styles.legalHeading}>Security</Text>
              <Text style={styles.legalText}>We use industry-standard encryption and security measures to protect your information.</Text>
            </View>
          </ScrollView>
        );
      case "terms":
        return (
          <ScrollView style={styles.dashboard}>
            <Text style={styles.legalTitle}>Terms of Service</Text>
            <Text style={styles.legalSubtitle}>Service terms and conditions</Text>
            <View style={styles.legalSection}>
              <Text style={styles.legalHeading}>Service Purpose</Text>
              <Text style={styles.legalText}>SiliRual provides cognitive support activities for elderly citizens. This service is not a substitute for professional medical care.</Text>
            </View>
            <View style={styles.legalSection}>
              <Text style={styles.legalHeading}>User Responsibilities</Text>
              <Text style={styles.legalText}>Users must provide accurate information and use the service responsibly.</Text>
            </View>
            <View style={styles.legalSection}>
              <Text style={styles.legalHeading}>Medical Disclaimer</Text>
              <Text style={styles.legalText}>This application provides cognitive support activities only. It does not provide medical diagnosis, treatment, or advice. Always consult qualified healthcare professionals for medical concerns.</Text>
            </View>
            <View style={styles.legalSection}>
              <Text style={styles.legalHeading}>Emergency Services</Text>
              <Text style={styles.legalText}>In case of medical emergencies, call emergency services immediately. This application is not an emergency response system.</Text>
            </View>
            <View style={styles.legalSection}>
              <Text style={styles.legalHeading}>Service Modifications</Text>
              <Text style={styles.legalText}>We reserve the right to modify, suspend, or discontinue this service with or without notice for security, policy, or operational reasons.</Text>
            </View>
          </ScrollView>
        );
      default:
        return (
          <View style={styles.dashboard}>
            <Text style={styles.placeholder}>Feature coming soon</Text>
          </View>
        );
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <PageHeader title="SiliRual" subtitle={`Hello, ${name}`} />
      <ScrollView style={styles.scrollContent}>
        {renderView()}
      </ScrollView>
      <View style={styles.bottomNav}>
        {["today", "games", "activities", "reminders", "routine", "memories", "help", "settings"].map((v) => (
          <TouchableOpacity 
            key={v} 
            style={[styles.navItem, view === v && styles.navItemActive]}
            onPress={() => setView(v as ElderView)}
          >
            <Text style={styles.navText}>{v.charAt(0).toUpperCase() + v.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}


function HelperApp({ role, onLogout }: { role: "family" | "caregiver"; onLogout: () => void }) {
  const [view, setView] = useState<"home" | "elders" | "alerts" | "tasks" | "health" | "progress" | "memories" | "location" | "reminders" | "settings" | "privacy" | "terms">("home");
  const [language, setLanguage] = useState("en");
  
  const eldersUnderCare = [
    { id: 1, name: "Anima Das", age: 72, status: "Well", lastActive: "2 hours ago", location: "Home", nextTask: "Evening medication at 6 PM" },
    { id: 2, name: "Biren Sharma", age: 68, status: "Needs attention", lastActive: "30 min ago", location: "Outdoors", nextTask: "Blood pressure check" },
    { id: 3, name: "Priya Devi", age: 75, status: "Resting", lastActive: "1 hour ago", location: "Home", nextTask: "Physical therapy" },
  ];
  
  const alerts = [
    { id: 1, type: "urgent", elder: "Biren Sharma", message: "Blood pressure elevated", time: "30 min ago" },
    { id: 2, type: "warning", elder: "Anima Das", message: "Missed morning medication", time: "2 hours ago" },
  ];
  
  const careTasks = [
    { id: 1, elder: "Anima Das", task: "Evening medication", time: "6:00 PM", status: "pending", assignedTo: "You" },
    { id: 2, elder: "Biren Sharma", task: "Blood pressure check", time: "4:30 PM", status: "completed", assignedTo: "You" },
    { id: 3, elder: "Priya Devi", task: "Physical therapy", time: "5:00 PM", status: "pending", assignedTo: "Therapist" },
  ];
  
  const healthData = [
    { elder: "Anima Das", metric: "Blood Pressure", value: "120/80", status: "normal", date: "Today" },
    { elder: "Biren Sharma", metric: "Blood Pressure", value: "145/95", status: "attention", date: "Today" },
    { elder: "Priya Devi", metric: "Heart Rate", value: "72 bpm", status: "normal", date: "Today" },
  ];
  
  const renderHome = () => {
    if (role === "caregiver") {
      return (
        <View style={styles.dashboard}>
          <Text style={styles.sectionTitle}>Elder Status</Text>
          {eldersUnderCare.map(elder => (
            <TouchableOpacity key={elder.id} style={styles.elderCard} onPress={() => setView("elders")}>
              <View style={styles.elderCardHeader}>
                <Text style={styles.elderName}>{elder.name}</Text>
                <View style={[styles.statusBadge, elder.status === "Well" ? styles.statusGreen : elder.status === "Needs attention" ? styles.statusRed : styles.statusYellow]}>
                  <Text style={styles.statusBadgeText}>{elder.status === "Well" ? "✓" : elder.status === "Needs attention" ? "!" : "•"}</Text>
                </View>
              </View>
              <Text style={styles.elderDetails}>{elder.age} years · {elder.location} · {elder.lastActive}</Text>
              <Text style={styles.elderNextTask}>Next: {elder.nextTask}</Text>
            </TouchableOpacity>
          ))}
          
          <Text style={styles.sectionTitle}>Active Alerts</Text>
          {alerts.map(alert => (
            <View key={alert.id} style={[styles.alertCard, alert.type === "urgent" && styles.alertCardUrgent]}>
              <Text style={styles.alertType}>{alert.type === "urgent" ? "🚨" : "⚠️"} {alert.elder}</Text>
              <Text style={styles.alertMessage}>{alert.message}</Text>
              <Text style={styles.alertTime}>{alert.time}</Text>
            </View>
          ))}
          
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionCard} onPress={() => setView("elders")}>
              <Text style={styles.quickActionIcon}>👥</Text>
              <Text style={styles.quickActionTitle}>My Elders</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard} onPress={() => setView("alerts")}>
              <Text style={styles.quickActionIcon}>🔔</Text>
              <Text style={styles.quickActionTitle}>Alerts</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard} onPress={() => setView("tasks")}>
              <Text style={styles.quickActionIcon}>✅</Text>
              <Text style={styles.quickActionTitle}>Tasks</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard} onPress={() => setView("health")}>
              <Text style={styles.quickActionIcon}>❤️</Text>
              <Text style={styles.quickActionTitle}>Health</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard} onPress={() => setView("progress")}>
              <Text style={styles.quickActionIcon}>📊</Text>
              <Text style={styles.quickActionTitle}>Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard} onPress={() => setView("memories")}>
              <Text style={styles.quickActionIcon}>📷</Text>
              <Text style={styles.quickActionTitle}>Memories</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.dashboard}>
          <Text style={styles.sectionTitle}>Supporting Anima Das</Text>
          <Text style={styles.connectedStatus}>✓ Connected securely</Text>
          
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionCard} onPress={() => setView("memories")}>
              <Text style={styles.quickActionIcon}>📷</Text>
              <Text style={styles.quickActionTitle}>Memories</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard} onPress={() => setView("reminders")}>
              <Text style={styles.quickActionIcon}>🔔</Text>
              <Text style={styles.quickActionTitle}>Reminders</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard} onPress={() => setView("location")}>
              <Text style={styles.quickActionIcon}>📍</Text>
              <Text style={styles.quickActionTitle}>Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  };
  
  const renderDetail = () => {
    switch(view) {
      case "elders":
        return (
          <View style={styles.dashboard}>
            <Text style={styles.sectionTitle}>Elders Under Care</Text>
            {eldersUnderCare.map(elder => (
              <View key={elder.id} style={styles.elderDetailCard}>
                <View style={styles.elderDetailHeader}>
                  <Text style={styles.elderDetailName}>{elder.name}</Text>
                  <Text style={styles.elderDetailAge}>{elder.age} years</Text>
                </View>
                <View style={styles.elderDetailRow}>
                  <Text style={styles.elderDetailLabel}>Status:</Text>
                  <Text style={styles.elderDetailValue}>{elder.status}</Text>
                </View>
                <View style={styles.elderDetailRow}>
                  <Text style={styles.elderDetailLabel}>Location:</Text>
                  <Text style={styles.elderDetailValue}>{elder.location}</Text>
                </View>
                <View style={styles.elderDetailRow}>
                  <Text style={styles.elderDetailLabel}>Last active:</Text>
                  <Text style={styles.elderDetailValue}>{elder.lastActive}</Text>
                </View>
                <View style={styles.elderDetailRow}>
                  <Text style={styles.elderDetailLabel}>Next task:</Text>
                  <Text style={styles.elderDetailValue}>{elder.nextTask}</Text>
                </View>
              </View>
            ))}
          </View>
        );
      case "alerts":
        return (
          <View style={styles.dashboard}>
            <Text style={styles.sectionTitle}>Alerts</Text>
            {alerts.map(alert => (
              <View key={alert.id} style={[styles.alertDetailCard, alert.type === "urgent" && styles.alertDetailCardUrgent]}>
                <Text style={styles.alertDetailType}>{alert.type === "urgent" ? "🚨 URGENT" : "⚠️ WARNING"}</Text>
                <Text style={styles.alertDetailElder}>{alert.elder}</Text>
                <Text style={styles.alertDetailMessage}>{alert.message}</Text>
                <Text style={styles.alertDetailTime}>{alert.time}</Text>
                <View style={styles.alertActions}>
                  <ActionButton style={styles.alertButton}>Mark resolved</ActionButton>
                  <ActionButton variant="secondary" style={styles.alertButton}>Snooze</ActionButton>
                </View>
              </View>
            ))}
          </View>
        );
      case "tasks":
        return (
          <View style={styles.dashboard}>
            <Text style={styles.sectionTitle}>Care Tasks</Text>
            {careTasks.map(task => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskElder}>{task.elder}</Text>
                  <View style={[styles.taskStatus, task.status === "completed" && styles.taskStatusCompleted]}>
                    <Text style={styles.taskStatusText}>{task.status}</Text>
                  </View>
                </View>
                <Text style={styles.taskTitle}>{task.task}</Text>
                <Text style={styles.taskTime}>⏰ {task.time}</Text>
                <Text style={styles.taskAssigned}>Assigned to: {task.assignedTo}</Text>
                <ActionButton variant="secondary" style={styles.taskButton}>
                  {task.status === "completed" ? "Mark as pending" : "Mark as complete"}
                </ActionButton>
              </View>
            ))}
          </View>
        );
      case "health":
        return (
          <View style={styles.dashboard}>
            <Text style={styles.sectionTitle}>Health Monitoring</Text>
            {healthData.map((data, i) => (
              <View key={i} style={[styles.healthCard, data.status === "attention" && styles.healthCardAttention]}>
                <Text style={styles.healthElder}>{data.elder}</Text>
                <Text style={styles.healthMetric}>{data.metric}</Text>
                <Text style={styles.healthValue}>{data.value}</Text>
                <Text style={styles.healthDate}>{data.date}</Text>
                <View style={[styles.healthStatus, data.status === "normal" ? styles.healthStatusNormal : styles.healthStatusAttention]}>
                  <Text style={styles.healthStatusText}>{data.status === "normal" ? "✓ Normal" : "⚠️ Needs attention"}</Text>
                </View>
              </View>
            ))}
          </View>
        );
      case "progress":
        return (
          <View style={styles.dashboard}>
            <Text style={styles.sectionTitle}>Progress Analytics</Text>
            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsTitle}>Activity Engagement</Text>
              <Text style={styles.analyticsSubtitle}>This week's cognitive training participation</Text>
              <View style={styles.chartPlaceholder}>
                <Text style={styles.chartPlaceholderText}>📊 Activity Chart</Text>
                <Text style={styles.chartPlaceholderSubtext}>Charts coming soon</Text>
              </View>
            </View>
            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsTitle}>Elder Progress</Text>
              {eldersUnderCare.map(elder => (
                <View key={elder.id} style={styles.progressRow}>
                  <Text style={styles.progressName}>{elder.name}</Text>
                  <Text style={styles.progressTrend}>📈 Improving</Text>
                  <Text style={styles.progressEngagement}>85% engagement</Text>
                </View>
              ))}
            </View>
          </View>
        );
      case "memories":
        return (
          <View style={styles.dashboard}>
            <Text style={styles.sectionTitle}>Memory Sharing</Text>
            <View style={styles.memoryCard}>
              <View style={styles.memoryPhoto}>
                <Text style={styles.memoryPhotoText}>🏔️</Text>
              </View>
              <View style={styles.memoryContent}>
                <Text style={styles.memoryTitle}>Springtime in the hills</Text>
                <Text style={styles.memoryDescription}>Shared by: Family</Text>
                <Text style={styles.memoryDate}>12 September 2026</Text>
                <ActionButton style={styles.memoryButton}>View</ActionButton>
              </View>
            </View>
            <TouchableOpacity style={styles.addMemoryCard}>
              <Text style={styles.addMemoryIcon}>➕</Text>
              <Text style={styles.addMemoryText}>Add new memory</Text>
            </TouchableOpacity>
          </View>
        );
      case "location":
        return (
          <View style={styles.dashboard}>
            <Text style={styles.sectionTitle}>Location Sharing</Text>
            <View style={styles.locationCard}>
              <Text style={styles.locationTitle}>Current Location</Text>
              <Text style={styles.locationStatus}>📍 Home - Guwahati</Text>
              <Text style={styles.locationTime}>Last updated: 10 minutes ago</Text>
              <ToggleRow title="Location sharing" text="Allow time-limited sharing" value={true} onChange={() => {}} />
            </View>
          </View>
        );
      case "reminders":
        return (
          <View style={styles.dashboard}>
            <Text style={styles.sectionTitle}>Reminders for Anima Das</Text>
            {[
              { time: "9:00 AM", title: "Morning medicine", desc: "After breakfast" },
              { time: "6:00 PM", title: "Evening medicine", desc: "After dinner" }
            ].map((r, i) => (
              <View key={i} style={styles.reminderCard}>
                <Text style={styles.reminderTime}>🕐 {r.time}</Text>
                <Text style={styles.reminderTitle}>{r.title}</Text>
                <Text style={styles.reminderDesc}>{r.desc}</Text>
                <ActionButton style={styles.reminderButton}>Edit</ActionButton>
              </View>
            ))}
            <TouchableOpacity style={styles.addReminderCard}>
              <Text style={styles.addReminderIcon}>➕</Text>
              <Text style={styles.addReminderText}>Add new reminder</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return <Text style={styles.placeholder}>Feature coming soon</Text>;
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <PageHeader title={role === "caregiver" ? "Caregiver Dashboard" : "Family Dashboard"} />
      <ScrollView style={styles.scrollContent}>
        {view === "home" ? renderHome() : renderDetail()}
      </ScrollView>
      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.navItem, view === "home" && styles.navItemActive]} onPress={() => setView("home")}>
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        {role === "caregiver" ? (
          <>
            <TouchableOpacity style={[styles.navItem, view === "elders" && styles.navItemActive]} onPress={() => setView("elders")}>
              <Text style={styles.navText}>Elders</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.navItem, view === "alerts" && styles.navItemActive]} onPress={() => setView("alerts")}>
              <Text style={styles.navText}>Alerts</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.navItem, view === "tasks" && styles.navItemActive]} onPress={() => setView("tasks")}>
              <Text style={styles.navText}>Tasks</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={[styles.navItem, view === "memories" && styles.navItemActive]} onPress={() => setView("memories")}>
              <Text style={styles.navText}>Memories</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.navItem, view === "reminders" && styles.navItemActive]} onPress={() => setView("reminders")}>
              <Text style={styles.navText}>Reminders</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity style={[styles.navItem, view === "settings" && styles.navItemActive]} onPress={() => setView("settings")}>
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ============ MAIN APP ============

export default function App() {
  const [stage, setStage] = useState<Stage>("splash");
  const [mode, setMode] = useState<"using" | "helping">("using");
  const [role, setRole] = useState<Role>("elder");
  const [name, setName] = useState("Anima");
  const [ready, setReady] = useState(false);
  
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const saved = await AsyncStorage.getItem("silirual-demo");
        if (saved) {
          const x = JSON.parse(saved);
          if (x.name) setName(x.name);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
      setReady(true);
    };
    loadSavedData();
  }, []);
  
  const logout = () => {
    setStage("welcome");
  };
  
  if (!ready) return null;
  
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="App">
          {() => (
            <View style={styles.container}>
              <StatusBar barStyle="dark-content" />
              
              {stage === "splash" && <SplashScreen onComplete={() => setStage("welcome")} />}
              
              {stage === "welcome" && <Welcome onNext={(m) => { setMode(m); setStage("role"); }} />}
              
              {stage === "role" && (
                <RoleSelect 
                  mode={mode} 
                  onBack={() => setStage("welcome")} 
                  onChoose={(r) => { setRole(r); setStage("auth"); }} 
                />
              )}
              
              {stage === "auth" && (
                <Auth 
                  role={role} 
                  onBack={() => setStage("role")} 
                  onContinue={() => setStage(role === "elder" ? "onboarding" : "app")} 
                />
              )}
              
              {stage === "onboarding" && (
                <Onboarding onDone={(n) => { setName(n); setStage("app"); }} />
              )}
              
              {stage === "app" && (
                role === "elder" 
                  ? <ElderApp name={name} onLogout={logout} />
                  : <HelperApp role={role} onLogout={logout} />
              )}
            </View>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ============ STYLES ============

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  splashScreen: {
    flex: 1,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashScreenFadeOut: {
    opacity: 0,
  },
  splashImage: {
    width: '100%',
    height: '100%',
  },
  splashText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#ffffff',
  },
  welcomeContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  welcomeHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 12,
    zIndex: 100,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  languageBtnIcon: {
    fontSize: 18,
  },
  languageBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  languageMenu: {
    position: 'absolute',
    top: 60,
    right: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 101,
  },
  languageMenuItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  languageMenuItemSelected: {
    backgroundColor: '#7c3aed',
  },
  languageMenuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  languageMenuItemSubtext: {
    fontSize: 12,
    color: '#6b7280',
  },
  languageMenuItemSelected: {
    backgroundColor: '#7c3aed',
  },
  languageMenuItemSelected: {
    languageMenuItemText: {
      color: '#ffffff',
    },
    languageMenuItemSubtext: {
      color: '#ffffff',
    },
  },
  ministryBadge: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    padding: 4,
    alignItems: 'center',
  },
  ministryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
  heroSection: {
    height: '45%',
    minHeight: 300,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroPlaceholder: {
    alignItems: 'center',
  },
  heroText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  heroLocation: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  welcomeActions: {
    padding: 20,
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#7c3aed',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: '#7c3aed',
  },
  actionButtonSecondary: {
    backgroundColor: '#f3f4f6',
  },
  actionButtonGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#7c3aed',
  },
  actionButtonDanger: {
    backgroundColor: '#ef4444',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonTextPrimary: {
    color: '#ffffff',
  },
  actionButtonTextSecondary: {
    color: '#1f2937',
  },
  actionButtonTextGhost: {
    color: '#7c3aed',
  },
  actionButtonTextDanger: {
    color: '#ffffff',
  },
  welcomeFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    gap: 20,
  },
  footerLogos: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  govLogo: {
    width: 80,
    height: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  simpleScreen: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  pageHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  pageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  pageHeaderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  pageHeaderSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  iconButton: {
    padding: 8,
  },
  iconButtonText: {
    fontSize: 20,
    color: '#7c3aed',
  },
  segmented: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  segmentButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#7c3aed',
  },
  segmentButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  segmentButtonActive: {
    color: '#ffffff',
  },
  formStack: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  orText: {
    marginHorizontal: 12,
    color: '#6b7280',
  },
  progressSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7c3aed',
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  languageCard: {
    flex: 1,
    minWidth: '45%',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  languageCardSelected: {
    borderColor: '#7c3aed',
    backgroundColor: '#7c3aed',
  },
  languageCardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  settingsSection: {
    gap: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  toggleContent: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  toggleText: {
    fontSize: 14,
    color: '#6b7280',
  },
  switch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#d1d5db',
    padding: 2,
  },
  switchOn: {
    backgroundColor: '#7c3aed',
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  switchThumbOn: {
    transform: [{ translateX: 20 }],
  },
  onboardingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  choiceList: {
    gap: 12,
  },
  choiceCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  choiceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  choiceText: {
    fontSize: 14,
    color: '#6b7280',
  },
  dashboard: {
    padding: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  featuredActivity: {
    fontSize: 18,
    color: '#7c3aed',
    marginBottom: 4,
  },
  routinePreview: {
    fontSize: 14,
    color: '#6b7280',
  },
  placeholder: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    padding: 40,
  },
  scrollContent: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navItemActive: {
    color: '#7c3aed',
  },
  navText: {
    fontSize: 12,
    color: '#6b7280',
  },
  navItemActive: {
    color: '#7c3aed',
  },
  elderCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  elderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  elderStatus: {
    fontSize: 14,
    color: '#6b7280',
  },
  elderStatusWarning: {
    color: '#ef4444',
  },
  connectedStatus: {
    fontSize: 14,
    color: '#10b981',
    marginBottom: 20,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    minWidth: '45%',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBadgePrimary: {
    backgroundColor: '#7c3aed',
  },
  iconBadgeGreen: {
    backgroundColor: '#10b981',
  },
  iconBadgeGold: {
    backgroundColor: '#f59e0b',
  },
  iconBadgeRed: {
    backgroundColor: '#ef4444',
  },
  gameScreen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  gameCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gameHeroIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  instructionCard: {
    backgroundColor: '#f9fafb',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  examplePairs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  exampleCard: {
    fontSize: 32,
  },
  exampleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  iconBadgeLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconBadgeText: {
    fontSize: 40,
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  gameSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  celebration: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  officialLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  resultStats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  savedNote: {
    backgroundColor: '#ecfdf5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  savedNoteText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  feelingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  feelingRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  feelingButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  feelingEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  feelingLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  gameTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  gameSmallText: {
    fontSize: 12,
    color: '#6b7280',
  },
  gameStrongText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  pairBoard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    padding: 20,
  },
  pairCard: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pairCardOpen: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#7c3aed',
  },
  pairCardMatched: {
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  pairCardText: {
    fontSize: 32,
    color: '#ffffff',
  },
  pairCardTextOpen: {
    color: '#1f2937',
  },
  pairCardTextMatched: {
    color: '#ffffff',
  },
  hintBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 8,
  },
  hintIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  hintText: {
    fontSize: 14,
    color: '#92400e',
  },
  gameControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  gameControlButton: {
    alignItems: 'center',
  },
  gameControlIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  gameControlText: {
    fontSize: 12,
    color: '#6b7280',
  },
  gameCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
    alignItems: 'center',
  },
  gameEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  gameCardContent: {
    flex: 1,
  },
  gameName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  gameDesc: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  gameLevel: {
    fontSize: 12,
    color: '#10b981',
  },
  gameStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 16,
  },
  gameStatText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  memoryGameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    padding: 20,
  },
  memoryCard: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  memoryCardFlipped: {
    borderWidth: 2,
    borderColor: '#7c3aed',
  },
  memoryCardMatched: {
    opacity: 0.5,
  },
  memoryCardContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memoryCardText: {
    fontSize: 32,
    color: '#ffffff',
  },
  gameCompleteOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gameCompleteText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  gameCompleteScore: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 20,
  },
  memoryCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  memoryPhoto: {
    height: 150,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  memoryPhotoText: {
    fontSize: 48,
  },
  memoryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  memoryBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  memoryContent: {
    padding: 16,
  },
  memoryDate: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  memoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  memoryDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  memoryButton: {
    backgroundColor: '#7c3aed',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  memoryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptySoft: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  successBanner: {
    backgroundColor: '#ecfdf5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successBannerText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
  reminderCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  reminderTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reminderTimeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  reminderTimeText: {
    fontSize: 14,
    color: '#6b7280',
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  reminderDesc: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  reminderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  reminderButton: {
    flex: 1,
  },
  tabsLine: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#7c3aed',
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
  },
  tabButtonActive: {
    tabText: {
      color: '#7c3aed',
      fontWeight: '600',
    },
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activityIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTime: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  activityButton: {
    minWidth: 80,
  },
  routineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  routineNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  routineNumberComplete: {
    backgroundColor: '#10b981',
  },
  routineNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  routineNumberTextComplete: {
    color: '#ffffff',
  },
  routineContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  routineIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  routineText: {
    flex: 1,
  },
  routineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  routineDesc: {
    fontSize: 14,
    color: '#6b7280',
  },
  callButton: {
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  elderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  elderDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  elderNextTask: {
    fontSize: 14,
    color: '#7c3aed',
    fontWeight: '600',
  },
  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusGreen: {
    backgroundColor: '#10b981',
  },
  statusRed: {
    backgroundColor: '#ef4444',
  },
  statusYellow: {
    backgroundColor: '#f59e0b',
  },
  statusBadgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  alertCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  alertCardUrgent: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
  },
  alertType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  elderDetailCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  elderDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  elderDetailName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  elderDetailAge: {
    fontSize: 14,
    color: '#6b7280',
  },
  elderDetailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  elderDetailLabel: {
    fontSize: 14,
    color: '#6b7280',
    width: 100,
  },
  elderDetailValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  alertDetailCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  alertDetailCardUrgent: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
  },
  alertDetailType: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 8,
  },
  alertDetailElder: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  alertDetailMessage: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
  },
  alertDetailTime: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  alertActions: {
    flexDirection: 'row',
    gap: 8,
  },
  alertButton: {
    flex: 1,
  },
  taskCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskElder: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  taskStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#fbbf24',
  },
  taskStatusCompleted: {
    backgroundColor: '#10b981',
  },
  taskStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  taskTitle: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 4,
  },
  taskTime: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  taskAssigned: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 12,
  },
  taskButton: {
    marginTop: 8,
  },
  healthCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  healthCardAttention: {
    borderColor: '#ef4444',
    backgroundColor: '#fee2e2',
  },
  healthElder: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  healthMetric: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  healthValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  healthDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  healthStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  healthStatusNormal: {
    backgroundColor: '#10b981',
  },
  healthStatusAttention: {
    backgroundColor: '#ef4444',
  },
  healthStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  analyticsCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  analyticsSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  chartPlaceholder: {
    height: 150,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartPlaceholderText: {
    fontSize: 24,
    marginBottom: 4,
  },
  chartPlaceholderSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  progressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  progressTrend: {
    fontSize: 14,
    color: '#10b981',
  },
  progressEngagement: {
    fontSize: 14,
    color: '#6b7280',
  },
  addMemoryCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addMemoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  addMemoryText: {
    fontSize: 16,
    color: '#6b7280',
  },
  locationCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  locationStatus: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 4,
  },
  locationTime: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  addReminderCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addReminderIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  addReminderText: {
    fontSize: 16,
    color: '#6b7280',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 14,
    color: '#6b7280',
  },
  settingArrow: {
    fontSize: 20,
    color: '#9ca3af',
  },
  legalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  legalSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  legalSection: {
    marginBottom: 24,
  },
  legalHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  legalText: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  settingsSection: {
    marginBottom: 20,
  },
  settingsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  languageSelector: {
    gap: 8,
  },
  languageOption: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  languageOptionSelected: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  languageOptionNative: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  languageOptionSelected: {
    languageOptionNative: {
      color: '#ffffff',
    },
  },
  languageOptionName: {
    fontSize: 14,
    color: '#6b7280',
  },
  languageOptionSelected: {
    languageOptionName: {
      color: '#ffffff',
    },
  },
});
