import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { type AppSettings } from "../types";
import { loadSettings } from "./storage";

const GEOFENCE_TASK = "gym-reminder-geofence-task";

if (!TaskManager.isTaskDefined(GEOFENCE_TASK)) {
  TaskManager.defineTask(
    GEOFENCE_TASK,
    async ({
      data,
      error,
    }: TaskManager.TaskManagerTaskBody<{
      eventType?: Location.GeofencingEventType;
      region?: Location.LocationRegion;
    }>) => {
      if (error) {
        console.error("Geofencing task failed", error);
        return;
      }

      if (!data || data.eventType !== Location.GeofencingEventType.Enter) {
        return;
      }

      const settings = await loadSettings();
      if (!settings.remindersEnabled || !data.region?.identifier) {
        return;
      }

      if (data.region.identifier === "gym-region" && settings.gym.enabled) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Workout ready for ${todayLabel()}`,
            body: workoutMessage(settings),
          },
          trigger: null,
        });
        return;
      }

      if (data.region.identifier === "home-region" && settings.home.enabled) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Home routine reminder",
            body: settings.supplementMessage,
          },
          trigger: null,
        });
      }
    }
  );
}

export async function registerGeofences(settings: AppSettings) {
  const regions = buildRegions(settings);
  if (regions.length === 0) {
    await unregisterGeofences();
    return;
  }

  const alreadyStarted = await Location.hasStartedGeofencingAsync(GEOFENCE_TASK);
  if (alreadyStarted) {
    await Location.stopGeofencingAsync(GEOFENCE_TASK);
  }

  await Location.startGeofencingAsync(GEOFENCE_TASK, regions);
}

export async function unregisterGeofences() {
  const alreadyStarted = await Location.hasStartedGeofencingAsync(GEOFENCE_TASK);
  if (alreadyStarted) {
    await Location.stopGeofencingAsync(GEOFENCE_TASK);
  }
}

function buildRegions(settings: AppSettings): Location.LocationRegion[] {
  const regions: Location.LocationRegion[] = [];

  if (settings.gym.enabled) {
    regions.push({
      identifier: "gym-region",
      latitude: settings.gym.latitude,
      longitude: settings.gym.longitude,
      radius: settings.gym.radiusMeters,
      notifyOnEnter: true,
      notifyOnExit: false,
    });
  }

  if (settings.home.enabled) {
    regions.push({
      identifier: "home-region",
      latitude: settings.home.latitude,
      longitude: settings.home.longitude,
      radius: settings.home.radiusMeters,
      notifyOnEnter: true,
      notifyOnExit: false,
    });
  }

  return regions;
}

function workoutMessage(settings: AppSettings) {
  return `${settings.gym.name}: ${settings.workoutDays[new Date().getDay()]}`;
}

function todayLabel() {
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date());
}
