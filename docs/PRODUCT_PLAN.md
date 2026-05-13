# LiftSignal Product Plan

## One-line pitch

LiftSignal is a location-aware fitness app that delivers the right action at the right place: your workout when you get to the gym and your recovery or supplement reminder when you get home.

## Problem

Gym-goers usually know what they want to accomplish, but they forget details in the moment:

- what workout they planned for today
- what sets or split they are supposed to run
- what supplements or recovery steps they need later

Most reminder apps are time-based. This product should be context-based.

## MVP outcome

A user can:

- save one gym location
- save one home location
- define a workout plan for each day of the week
- define one home supplement reminder
- receive a local notification on arrival at the gym or home

## Target user

Primary user:

- regular gym-goers following a weekly split

Early expansion:

- people with coaches
- users on supplement or recovery protocols
- athletes with multiple training locations

## Core product loop

1. User opens the app and saves home and gym.
2. User sets their daily workout schedule.
3. User arrives at the gym and gets the workout prompt.
4. User arrives at home and gets the supplement or recovery prompt.
5. User trusts the app because reminders happen at the right time, not at random times.

## MVP features

- geofence-based arrival reminders
- editable weekly split
- editable home reminder text
- local notification delivery
- local device storage

## Version 2 candidates

- check-in logging
- completion confirmation after each workout
- streaks and consistency score
- coach mode with remote programming
- cloud sync across devices
- Apple Health or Google Fit integrations
- multiple geofences per user
- reminders for meals, water, sleep, and recovery

## Product risks

- background geofencing can be inconsistent if permission flow is weak
- users may not understand why Expo Go is not enough for testing
- supplement reminders need careful wording and should not encourage unsafe medical behavior
- false triggers can reduce trust quickly

## Build priorities

### Phase 1

- stable device permissions
- reliable geofence registration
- understandable setup flow
- clean reminder content

### Phase 2

- onboarding polish
- habit tracking
- shared plans and accounts

### Phase 3

- monetization
- coach dashboard
- analytics and retention tuning

## Technical direction

Frontend:

- Expo + React Native

Core device services:

- `expo-location`
- `expo-task-manager`
- `expo-notifications`
- `@react-native-async-storage/async-storage`

Potential backend later:

- Supabase for auth, profiles, cloud sync, workout templates, and analytics events

## Repo next tasks

1. Install dependencies and run a development build on a phone.
2. Replace raw coordinate editing with a cleaner onboarding flow.
3. Add notification preview and test trigger utilities.
4. Add a completion screen when a reminder fires.
5. Introduce Supabase once the on-device flow works.
