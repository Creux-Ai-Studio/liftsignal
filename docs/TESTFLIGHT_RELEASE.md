# TestFlight + App Store Connect Release Guide

This project uses Expo + EAS for iOS release builds.

## 1. One-time setup

1. Ensure Apple Developer Program is active.
2. Ensure App Store Connect access includes:
   - `App Manager` or `Admin`
3. Install/update CLIs:

```bash
npm install -g eas-cli
```

4. Login to Expo/EAS:

```bash
cd /Users/dakotast.pierre/gym-reminder-mvp
eas login
```

5. Link/create EAS project and populate project ID:

```bash
eas project:init
```

Then set `expo.extra.eas.projectId` in [app.json](/Users/dakotast.pierre/gym-reminder-mvp/app.json).

## 2. App Store Connect app record

Create app in App Store Connect:

- Name: `LiftSignal`
- Bundle ID: `com.creux.liftsignal`
- SKU: `liftsignal-ios-001` (or your preferred unique SKU)
- Platform: `iOS`

Then copy:

- App ID (`ascAppId`)
- Apple Team ID (`appleTeamId`)

into [eas.json](/Users/dakotast.pierre/gym-reminder-mvp/eas.json) under `submit.production.ios`.

## 3. Build a TestFlight binary

```bash
cd /Users/dakotast.pierre/gym-reminder-mvp
eas build --platform ios --profile production
```

Notes:

- EAS will handle certificates/profiles if you choose managed credentials.
- Build number auto-increments due to `autoIncrement: buildNumber`.

## 4. Submit to TestFlight

After build succeeds:

```bash
eas submit --platform ios --profile production --latest
```

Or use build ID:

```bash
eas submit --platform ios --profile production --id <BUILD_ID>
```

## 5. Internal testing in App Store Connect

1. Open TestFlight tab.
2. Add Internal Testers.
3. Complete export compliance when prompted (`usesNonExemptEncryption` already set `false` in app config).
4. Add testing notes:
   - geofence reminders trigger on arrival at gym/home
   - notification and location permissions are required

## 6. External testing checklist

Before external testing, provide:

- App description
- Privacy policy URL
- Category
- Age rating
- App review contact details
- Test account details (if login is required; not needed yet for this app)

## 7. App privacy declarations (required)

In App Store Connect privacy section, declare at minimum:

- Location (precise location, app functionality)
- Identifiers (if added later)
- Diagnostics (if crash analytics added later)

Current app behavior relevant to privacy:

- foreground + background location for geofence reminders
- local notifications
- local on-device storage of routine settings

## 8. Store assets checklist

Prepare:

- iPhone screenshots (6.7" and 6.5" recommended)
- App icon 1024x1024
- Promotional text
- Keywords
- Support URL
- Marketing URL (optional)

## 9. Common blockers

- Bundle identifier mismatch between app config and App Store Connect
- Missing location/notification usage text in `infoPlist`
- Build number not increasing between uploads
- Apple agreements/tax/banking not completed in App Store Connect
- Missing privacy policy URL for external testing
