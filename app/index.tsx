import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import {
  DEFAULT_SETTINGS,
  type AppSettings,
  type PlaceConfig,
} from "../src/types";
import { loadSettings, saveSettings } from "../src/services/storage";
import {
  registerGeofences,
  unregisterGeofences,
} from "../src/services/geofencing";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const DAILY_QUOTES = [
  "Discipline is deciding your future self matters right now.",
  "The workout counts more when you do it without negotiation.",
  "Small consistent reps beat dramatic resets.",
  "Your plan should remove doubt before the first set starts.",
];

const REMINDER_METRICS = [
  { label: "Gym arrivals", value: "18", detail: "This month" },
  { label: "Reminders hit", value: "92%", detail: "Delivery rate" },
  { label: "Home follow-through", value: "14", detail: "Checkoffs" },
];

const WEIGHT_LOG = [
  { date: "Mon", weight: "184.2 lb", change: "+0.4" },
  { date: "Wed", weight: "183.6 lb", change: "-0.6" },
  { date: "Fri", weight: "184.0 lb", change: "+0.4" },
];

export default function HomeScreen() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      const stored = await loadSettings();
      setSettings(stored);
      setIsReady(true);
    };

    void bootstrap();
  }, []);

  const updatePlaceField = (
    placeKey: "gym" | "home",
    field: keyof PlaceConfig,
    value: string | number | boolean
  ) => {
    setSettings((current) => ({
      ...current,
      [placeKey]: {
        ...current[placeKey],
        [field]: value,
      },
    }));
  };

  const updateWorkout = (index: number, value: string) => {
    setSettings((current) => {
      const workoutDays = [...current.workoutDays];
      workoutDays[index] = value;
      return {
        ...current,
        workoutDays,
      };
    });
  };

  const requestPermissions = async () => {
    const foreground = await Location.requestForegroundPermissionsAsync();
    if (foreground.status !== "granted") {
      throw new Error("Foreground location permission was denied.");
    }

    const background = await Location.requestBackgroundPermissionsAsync();
    if (background.status !== "granted") {
      throw new Error("Background location permission was denied.");
    }

    const notifications = await Notifications.requestPermissionsAsync();
    if (!notifications.granted) {
      throw new Error("Notification permission was denied.");
    }
  };

  const saveAndActivate = async () => {
    setIsSaving(true);

    try {
      await requestPermissions();
      await saveSettings(settings);

      if (settings.remindersEnabled) {
        await registerGeofences(settings);
      } else {
        await unregisterGeofences();
      }

      Alert.alert(
        "Dashboard synced",
        "The reminder dashboard and arrival automations are updated on this device."
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to save settings.";
      Alert.alert("Setup incomplete", message);
    } finally {
      setIsSaving(false);
    }
  };

  const autofillFromCurrentLocation = async (placeKey: "gym" | "home") => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        throw new Error("Location permission is required to autofill.");
      }

      const current = await Location.getCurrentPositionAsync({});
      updatePlaceField(placeKey, "latitude", round(current.coords.latitude));
      updatePlaceField(placeKey, "longitude", round(current.coords.longitude));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to read location.";
      Alert.alert("Location unavailable", message);
    }
  };

  if (!isReady) {
    return (
      <SafeAreaView style={styles.loadingShell}>
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </SafeAreaView>
    );
  }

  const todayIndex = new Date().getDay();
  const dailyQuote = DAILY_QUOTES[todayIndex % DAILY_QUOTES.length];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>LiftSignal</Text>
            </View>
            <Text style={styles.heroDate}>{DAY_LABELS[todayIndex]}</Text>
          </View>
          <Text style={styles.heroTitle}>A dashboard for routine, not just reminders.</Text>
          <Text style={styles.heroSubtitle}>
            Solo mode should feel like a calm control center: today&apos;s workout,
            your next reminder, your progress trend, and quick edits when your
            routine changes.
          </Text>

          <View style={styles.heroStatsRow}>
            <StatChip label="Today" value="Workout ready" />
            <StatChip label="Next reminder" value="Home supplements" />
          </View>
        </View>

        <View style={styles.dashboardGrid}>
          <View style={[styles.card, styles.quoteCard]}>
            <Text style={styles.cardEyebrow}>Daily quote</Text>
            <Text style={styles.quoteText}>{dailyQuote}</Text>
            <Text style={styles.cardHint}>Rotate this automatically each day.</Text>
          </View>

          <View style={[styles.card, styles.todayCard]}>
            <Text style={styles.cardEyebrow}>Today&apos;s workout</Text>
            <Text style={styles.mainCardTitle}>{settings.workoutDays[todayIndex]}</Text>
            <Text style={styles.cardHint}>
              This becomes the gym arrival notification body.
            </Text>
            <View style={styles.todoList}>
              <TaskPill text="Warm-up done" />
              <TaskPill text="Main lift logged" />
              <TaskPill text="Recovery note" />
            </View>
          </View>
        </View>

        <View style={styles.metricsRow}>
          {REMINDER_METRICS.map((metric) => (
            <View key={metric.label} style={styles.metricCard}>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text style={styles.metricDetail}>{metric.detail}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderTitle}>Feature direction</Text>
          <Text style={styles.sectionHeaderText}>
            These are the strongest ideas from your brainstorm translated into product pieces.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Reminder tracking</Text>
          <Text style={styles.helper}>
            Instead of only sending reminders, the app should show whether they were delivered,
            opened, and completed.
          </Text>
          <FeatureRow
            title="Workout reminder tracking"
            description="Track whether the gym notification resulted in a completed session."
          />
          <FeatureRow
            title="Supplement follow-through"
            description="Mark home reminders complete so the user can build consistency."
          />
          <FeatureRow
            title="Missed reminder recovery"
            description="If a reminder is skipped, show a catch-up CTA inside the dashboard."
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Weight log preview</Text>
          <Text style={styles.helper}>
            A lightweight bodyweight trend gives the app a real sense of progress.
          </Text>
          {WEIGHT_LOG.map((entry) => (
            <View key={entry.date} style={styles.listRow}>
              <Text style={styles.listTitle}>{entry.date}</Text>
              <Text style={styles.listValue}>{entry.weight}</Text>
              <Text style={styles.listAccent}>{entry.change}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Solo mode vision</Text>
          <Text style={styles.helper}>
            Solo mode should stay private, fast, and habit-driven.
          </Text>
          {SOLO_FEATURES.map((feature) => (
            <Text key={feature} style={styles.infoLine}>
              • {feature}
            </Text>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Later ideas, not now</Text>
          <Text style={styles.helper}>
            These are worth keeping in mind, but they should stay out of the
            first solo build until the core routine loop feels right.
          </Text>
          <FeatureRow
            title="Google Sheets import"
            description="Useful later for bulk workout setup once the core app is stable."
          />
          <FeatureRow
            title="Coach mode"
            description="Useful later if another person will program workouts remotely."
          />
          <FeatureRow
            title="Expanded analytics"
            description="Useful later after reminder completion and daily logging are in place."
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderTitle}>Setup and content</Text>
          <Text style={styles.sectionHeaderText}>
            These controls power the dashboard until we split them into proper onboarding and detail pages.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.flexText}>
              <Text style={styles.sectionTitle}>Reminders enabled</Text>
              <Text style={styles.helper}>
                Toggle all arrival-based automations without deleting the plan.
              </Text>
            </View>
            <Switch
              value={settings.remindersEnabled}
              onValueChange={(value) =>
                setSettings((current) => ({ ...current, remindersEnabled: value }))
              }
              trackColor={{ false: "#334155", true: "#f97316" }}
              thumbColor="#fff7ed"
            />
          </View>
        </View>

        <PlaceEditor
          label="Gym zone"
          place={settings.gym}
          onFieldChange={(field, value) => updatePlaceField("gym", field, value)}
          onUseCurrentLocation={() => void autofillFromCurrentLocation("gym")}
        />

        <PlaceEditor
          label="Home zone"
          place={settings.home}
          onFieldChange={(field, value) => updatePlaceField("home", field, value)}
          onUseCurrentLocation={() => void autofillFromCurrentLocation("home")}
        />

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Weekly split editor</Text>
          <Text style={styles.helper}>
            Daily workout reminders feel much stronger when the plan is filled in clearly.
          </Text>
          {settings.workoutDays.map((day, index) => (
            <View key={DAY_LABELS[index]} style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{DAY_LABELS[index]}</Text>
              <TextInput
                style={styles.input}
                value={day}
                onChangeText={(value) => updateWorkout(index, value)}
                placeholder="Push, pull, legs, conditioning..."
                placeholderTextColor="#94a3b8"
              />
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Home reminder message</Text>
          <Text style={styles.helper}>
            Keep it flexible so it can later represent supplements, recovery, hydration, or sleep.
          </Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Reminder copy</Text>
            <TextInput
              style={[styles.input, styles.multiLineInput]}
              value={settings.supplementMessage}
              onChangeText={(value) =>
                setSettings((current) => ({ ...current, supplementMessage: value }))
              }
              placeholder="Take your evening supplements and log how you feel."
              placeholderTextColor="#94a3b8"
              multiline
            />
          </View>
        </View>

        <Pressable
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={() => void saveAndActivate()}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? "Saving..." : "Save dashboard setup"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statChip}>
      <Text style={styles.statChipLabel}>{label}</Text>
      <Text style={styles.statChipValue}>{value}</Text>
    </View>
  );
}

function TaskPill({ text }: { text: string }) {
  return (
    <View style={styles.taskPill}>
      <Text style={styles.taskPillText}>{text}</Text>
    </View>
  );
}

function FeatureRow({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  );
}

type PlaceEditorProps = {
  label: string;
  place: PlaceConfig;
  onFieldChange: (field: keyof PlaceConfig, value: string | number | boolean) => void;
  onUseCurrentLocation: () => void;
};

function PlaceEditor({
  label,
  place,
  onFieldChange,
  onUseCurrentLocation,
}: PlaceEditorProps) {
  return (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <View style={styles.flexText}>
          <Text style={styles.sectionTitle}>{label}</Text>
          <Text style={styles.helper}>
            Radius controls how close the person has to be before the app fires the reminder.
          </Text>
        </View>
        <Switch
          value={place.enabled}
          onValueChange={(value) => onFieldChange("enabled", value)}
          trackColor={{ false: "#334155", true: "#38bdf8" }}
          thumbColor="#f8fafc"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Place name</Text>
        <TextInput
          style={styles.input}
          value={place.name}
          onChangeText={(value) => onFieldChange("name", value)}
          placeholder="Main gym or home base"
          placeholderTextColor="#94a3b8"
        />
      </View>

      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Text style={styles.inputLabel}>Latitude</Text>
          <TextInput
            style={styles.input}
            value={String(place.latitude)}
            keyboardType="numeric"
            onChangeText={(value) => onFieldChange("latitude", safeNumber(value, place.latitude))}
          />
        </View>
        <View style={styles.halfInput}>
          <Text style={styles.inputLabel}>Longitude</Text>
          <TextInput
            style={styles.input}
            value={String(place.longitude)}
            keyboardType="numeric"
            onChangeText={(value) => onFieldChange("longitude", safeNumber(value, place.longitude))}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Text style={styles.inputLabel}>Radius (meters)</Text>
          <TextInput
            style={styles.input}
            value={String(place.radiusMeters)}
            keyboardType="numeric"
            onChangeText={(value) =>
              onFieldChange("radiusMeters", safeNumber(value, place.radiusMeters))
            }
          />
        </View>
        <View style={styles.halfInput}>
          <Text style={styles.inputLabel}>Quick action</Text>
          <Pressable style={styles.secondaryButton} onPress={onUseCurrentLocation}>
            <Text style={styles.secondaryButtonText}>Use current location</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const SOLO_FEATURES = [
  "Fast daily dashboard with zero coach overhead",
  "Personal reminders, quote, and weight trend",
  "Simple fill-in workout plan editing",
];

function safeNumber(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function round(value: number) {
  return Math.round(value * 1000000) / 1000000;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#08111f",
  },
  loadingShell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#08111f",
  },
  loadingText: {
    color: "#dbeafe",
    fontSize: 16,
  },
  content: {
    padding: 18,
    paddingBottom: 32,
    gap: 16,
  },
  heroCard: {
    backgroundColor: "#0f172a",
    borderRadius: 30,
    padding: 22,
    borderWidth: 1,
    borderColor: "#1e293b",
    gap: 14,
    shadowColor: "#000000",
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pill: {
    borderRadius: 999,
    backgroundColor: "#172554",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillText: {
    color: "#bfdbfe",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  heroDate: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
  },
  heroTitle: {
    color: "#f8fafc",
    fontSize: 32,
    lineHeight: 37,
    fontWeight: "800",
  },
  heroSubtitle: {
    color: "#cbd5e1",
    fontSize: 15,
    lineHeight: 24,
  },
  heroStatsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statChip: {
    flex: 1,
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  statChipLabel: {
    color: "#94a3b8",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "700",
  },
  statChipValue: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "700",
  },
  dashboardGrid: {
    gap: 16,
  },
  card: {
    backgroundColor: "#0f172a",
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1e293b",
    gap: 12,
  },
  quoteCard: {
    backgroundColor: "#172033",
  },
  todayCard: {
    backgroundColor: "#111827",
  },
  cardEyebrow: {
    color: "#38bdf8",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  quoteText: {
    color: "#f8fafc",
    fontSize: 24,
    lineHeight: 31,
    fontWeight: "700",
  },
  mainCardTitle: {
    color: "#f8fafc",
    fontSize: 22,
    lineHeight: 29,
    fontWeight: "800",
  },
  cardHint: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 20,
  },
  todoList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  taskPill: {
    borderRadius: 999,
    backgroundColor: "#1e293b",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  taskPillText: {
    color: "#e2e8f0",
    fontSize: 13,
    fontWeight: "600",
  },
  metricsRow: {
    gap: 12,
  },
  metricCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  metricValue: {
    color: "#fb923c",
    fontSize: 28,
    fontWeight: "800",
  },
  metricLabel: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4,
  },
  metricDetail: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 2,
  },
  sectionHeader: {
    gap: 6,
    paddingHorizontal: 2,
    paddingTop: 4,
  },
  sectionHeaderTitle: {
    color: "#f8fafc",
    fontSize: 21,
    fontWeight: "800",
  },
  sectionHeaderText: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 21,
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
  },
  helper: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 20,
  },
  featureRow: {
    paddingTop: 2,
    gap: 4,
  },
  featureTitle: {
    color: "#e2e8f0",
    fontSize: 15,
    fontWeight: "700",
  },
  featureDescription: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 20,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    paddingTop: 12,
  },
  listTitle: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "700",
  },
  listValue: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "700",
  },
  listAccent: {
    color: "#38bdf8",
    fontSize: 14,
    fontWeight: "700",
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  flexText: {
    flex: 1,
    gap: 4,
  },
  halfInput: {
    flex: 1,
    gap: 8,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#020617",
    color: "#f8fafc",
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
  },
  multiLineInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: "#1d4ed8",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  secondaryButtonText: {
    color: "#eff6ff",
    textAlign: "center",
    fontWeight: "700",
  },
  infoLine: {
    color: "#cbd5e1",
    fontSize: 14,
    lineHeight: 20,
  },
  saveButton: {
    minHeight: 58,
    borderRadius: 22,
    backgroundColor: "#f97316",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#fff7ed",
    fontSize: 17,
    fontWeight: "800",
  },
});
