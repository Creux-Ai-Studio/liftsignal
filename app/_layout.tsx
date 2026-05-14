import "react-native-gesture-handler";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
// import "../src/services/geofencing";
import "../global.css";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: "#050507",
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="reminders" />
        <Stack.Screen name="workout" />
        <Stack.Screen name="profile" />
      </Stack>
    </>
  );
}
