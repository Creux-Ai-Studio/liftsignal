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
import {
  loadSettings,
  saveSettings,
} from "../src/services/storage";
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
      const next = [...current.workoutDays];
      next[index] = value;
      return {
        ...current,
        workoutDays: next,
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
        "Reminder zones updated",
        "Your workout and supplement reminders are now synced on this device."
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
        <Text style={styles.loadingText}>Loading reminder profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Location-Aware Routine Coach</Text>
          <Text style={styles.title}>Trigger the right reminder at the right place.</Text>
          <Text style={styles.subtitle}>
            Save one gym zone and one home zone. When the phone enters the gym,
            it sends today&apos;s workout. When it enters home, it sends the supplement reminder.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.sectionTitle}>Reminders Enabled</Text>
              <Text style={styles.helper}>
                Turn this off to stop all arrival-based reminders.
              </Text>
            </View>
            <Switch
              value={settings.remindersEnabled}
              onValueChange={(value) =>
                setSettings((current) => ({ ...current, remindersEnabled: value }))
              }
              trackColor={{ false: "#334155", true: "#22c55e" }}
              thumbColor="#f8fafc"
            />
          </View>
        </View>

        <PlaceEditor
          label="Gym Zone"
          place={settings.gym}
          onFieldChange={(field, value) => updatePlaceField("gym", field, value)}
          onUseCurrentLocation={() => void autofillFromCurrentLocation("gym")}
        />

        <PlaceEditor
          label="Home Zone"
          place={settings.home}
          onFieldChange={(field, value) => updatePlaceField("home", field, value)}
          onUseCurrentLocation={() => void autofillFromCurrentLocation("home")}
        />

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Workout Of The Day</Text>
          <Text style={styles.helper}>
            Edit each day so the gym alert feels personal instead of generic.
          </Text>
          {settings.workoutDays.map((day, index) => (
            <View key={DAY_LABELS[index]} style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{DAY_LABELS[index]}</Text>
              <TextInput
                style={styles.input}
                value={day}
                onChangeText={(value) => updateWorkout(index, value)}
                placeholder="Push day, lower body, cardio..."
                placeholderTextColor="#64748b"
              />
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Supplement Reminder</Text>
          <Text style={styles.helper}>
            Keep this message general and accurate for the person using the app.
          </Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Reminder Message</Text>
            <TextInput
              style={[styles.input, styles.multiLineInput]}
              value={settings.supplementMessage}
              onChangeText={(value) =>
                setSettings((current) => ({ ...current, supplementMessage: value }))
              }
              placeholder="Take evening supplements and log them."
              placeholderTextColor="#64748b"
              multiline
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>How This MVP Works</Text>
          <Text style={styles.infoLine}>1. Save your gym and home coordinates.</Text>
          <Text style={styles.infoLine}>2. Grant background location and notifications.</Text>
          <Text style={styles.infoLine}>3. The app registers two geofences on-device.</Text>
          <Text style={styles.infoLine}>4. Arrival at the gym sends the workout plan for today.</Text>
          <Text style={styles.infoLine}>5. Arrival at home sends the supplement reminder message.</Text>
        </View>

        <Pressable
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={() => void saveAndActivate()}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? "Saving..." : "Save And Activate"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
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
        <View>
          <Text style={styles.sectionTitle}>{label}</Text>
          <Text style={styles.helper}>
            Radius controls how close someone needs to be before the reminder fires.
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
        <Text style={styles.inputLabel}>Name</Text>
        <TextInput
          style={styles.input}
          value={place.name}
          onChangeText={(value) => onFieldChange("name", value)}
          placeholder="My main gym"
          placeholderTextColor="#64748b"
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
          <Text style={styles.inputLabel}>Autofill</Text>
          <Pressable style={styles.secondaryButton} onPress={onUseCurrentLocation}>
            <Text style={styles.secondaryButtonText}>Use Current Location</Text>
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
    backgroundColor: "#0f172a",
  },
  loadingShell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
  },
  loadingText: {
    color: "#e2e8f0",
    fontSize: 16,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  hero: {
    paddingTop: 12,
    paddingBottom: 10,
    gap: 10,
  },
  eyebrow: {
    color: "#38bdf8",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  title: {
    color: "#f8fafc",
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "800",
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1e293b",
    gap: 14,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
    gap: 8,
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
    marginTop: 4,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#020617",
    color: "#f8fafc",
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
  },
  multiLineInput: {
    minHeight: 92,
    textAlignVertical: "top",
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: "#1d4ed8",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  secondaryButtonText: {
    color: "#eff6ff",
    fontWeight: "700",
    textAlign: "center",
  },
  infoLine: {
    color: "#cbd5e1",
    fontSize: 14,
    lineHeight: 21,
  },
  saveButton: {
    marginTop: 4,
    marginBottom: 18,
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#052e16",
    fontSize: 17,
    fontWeight: "800",
  },
});
