import { ScrollView, Text, View } from "react-native";
import { MotiView } from "moti";
import { AppShell } from "../src/app-shell";

const QUOTE = "Discipline compounds quietly. Show up, and it will show up for you.";

export default function HomeScreen() {
  return (
    <AppShell title="Home">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }} className="gap-4">
        <MotiView 
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600 }}
          className="bg-bgElevated border border-[#323a54] rounded-3xl p-6 gap-2"
        >
          <Text className="text-text text-3xl font-extrabold">Welcome back, Elijah</Text>
          <Text className="text-accentGlow text-sm font-bold uppercase tracking-widest">Command Center</Text>
          <Text className="text-[#dfe5f2] text-xl font-bold leading-8 mt-1">{QUOTE}</Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 100 }}
        >
          <SectionPreview
            title="Reminders"
            subtitle="Supplements and injections"
            lines={[
              "Morning supplements • 7:00 AM",
              "Testosterone • Monday 8:00 PM",
              "Retatrutide • Thursday 8:00 PM",
            ]}
          />
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 200 }}
        >
          <SectionPreview
            title="Workout"
            subtitle="Check-in and split"
            lines={[
              "Near-gym proximity check",
              "Daily check-in logging",
              "Weekly split editor",
            ]}
          />
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 300 }}
        >
          <SectionPreview
            title="Profile"
            subtitle="Settings and automation"
            lines={[
              "Enable or pause reminders",
              "Tune daily plan",
              "Manage reminder copy",
            ]}
          />
        </MotiView>
      </ScrollView>
    </AppShell>
  );
}

function SectionPreview({
  title,
  subtitle,
  lines,
}: {
  title: string;
  subtitle: string;
  lines: string[];
}) {
  return (
    <View className="bg-card border border-line rounded-3xl p-5 gap-2">
      <Text className="text-text text-2xl font-extrabold">{title}</Text>
      <Text className="text-muted text-sm mb-1">{subtitle}</Text>
      {lines.map((line) => (
        <View key={line} className="flex-row items-center gap-2">
          <View className="w-1.5 h-1.5 rounded-full bg-accentSoft" />
          <Text className="text-[#d5dbea] text-[15px] font-semibold">{line}</Text>
        </View>
      ))}
    </View>
  );
}

