import { Link, usePathname } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

const TABS = [
  { href: "/", label: "Home" },
  { href: "/reminders", label: "Reminders" },
  { href: "/workout", label: "Workout" },
  { href: "/profile", label: "Profile" },
] as const;

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const pathname = usePathname();

  return (
    <View className="flex-1 bg-bg">
      <View className="px-5 pt-4 pb-3 border-b border-[#141824]">
        <Text className="text-accentGlow text-[10px] font-extrabold tracking-widest uppercase">Lift Signal</Text>
        <Text className="text-text text-3xl font-extrabold mt-1.5">{title}</Text>
      </View>

      <View className="flex-1 pb-[72px]">{children}</View>

      <View className="absolute left-3 right-3 bottom-3 h-14 rounded-2xl border border-line bg-[#11141c] flex-row items-center px-2">
        {TABS.map((tab) => {
          const active = pathname === tab.href;

          return (
            <View key={tab.href} className="flex-1 px-0.5">
              <Link href={tab.href} asChild>
                <Pressable 
                  className={`h-10 items-center justify-center rounded-xl ${active ? 'bg-[#23293a]' : ''}`}
                >
                  <Text className={`text-[11px] font-bold ${active ? 'text-text' : 'text-muted'}`}>
                    {tab.label}
                  </Text>
                </Pressable>
              </Link>
            </View>
          );
        })}
      </View>
    </View>
  );
}

