export type PlaceConfig = {
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  enabled: boolean;
};

export type AppSettings = {
  remindersEnabled: boolean;
  gym: PlaceConfig;
  home: PlaceConfig;
  workoutDays: string[];
  supplementMessage: string;
};

export const DEFAULT_SETTINGS: AppSettings = {
  remindersEnabled: true,
  gym: {
    name: "Main Gym",
    latitude: 30.2672,
    longitude: -97.7431,
    radiusMeters: 180,
    enabled: true,
  },
  home: {
    name: "Home",
    latitude: 30.2669,
    longitude: -97.7428,
    radiusMeters: 150,
    enabled: true,
  },
  workoutDays: [
    "Mobility + recovery",
    "Push day: bench, incline DB, dips, triceps",
    "Pull day: rows, pulldowns, curls",
    "Leg day: squat, RDL, lunges, calves",
    "Upper hypertrophy circuit",
    "Conditioning + abs",
    "Full rest and meal prep",
  ],
  supplementMessage:
    "Take your planned supplements for today and log them before dinner.",
};
