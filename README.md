# LiftSignal MVP

An Expo-based mobile MVP for a gym reminder app that sends:

- a workout reminder when the phone enters the saved gym geofence
- a supplement reminder when the phone enters the saved home geofence

## What is included

- one-screen setup UI for gym and home locations
- editable workout plan for each day of the week
- editable supplement reminder message
- AsyncStorage persistence on-device
- Expo geofencing with local notifications

## Important platform note

Background geofencing does not work reliably in Expo Go. Test this with:

- an iOS development build
- an Android development build

That means the next real step is:

```bash
cd /Users/dakotast.pierre/gym-reminder-mvp
npm install
npx expo start
```

For background location testing, you will likely want:

```bash
npx expo run:ios
```

or

```bash
npx expo run:android
```

## Core files

- `app/index.tsx`: setup UI and permissions flow
- `src/services/geofencing.ts`: geofence registration and arrival-triggered notifications
- `src/services/storage.ts`: local persistence
- `src/types.ts`: app settings and defaults

## Product direction after MVP

Useful next additions:

- auth and cloud sync so friends can share routines
- multiple gyms and more than one reminder per place
- streaks, logging, and adherence tracking
- server-driven programs and coach-managed plans

## Planning docs

- `docs/PRODUCT_PLAN.md`: product brief, MVP scope, and next build priorities
