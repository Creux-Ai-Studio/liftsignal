import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_SETTINGS, type AppSettings } from "../types";

const SETTINGS_KEY = "gym-reminder-settings";

export async function loadSettings(): Promise<AppSettings> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    return DEFAULT_SETTINGS;
  }

  try {
    const parsed = JSON.parse(raw) as AppSettings;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      gym: {
        ...DEFAULT_SETTINGS.gym,
        ...parsed.gym,
      },
      home: {
        ...DEFAULT_SETTINGS.home,
        ...parsed.home,
      },
      workoutDays:
        parsed.workoutDays?.length === 7
          ? parsed.workoutDays
          : DEFAULT_SETTINGS.workoutDays,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings) {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
