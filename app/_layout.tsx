import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../src/services/geofencing";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#111827",
          },
          headerTintColor: "#f8fafc",
          headerTitleStyle: {
            fontWeight: "700",
          },
          contentStyle: {
            backgroundColor: "#0f172a",
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "LiftSignal",
          }}
        />
      </Stack>
    </>
  );
}
