// app/(head)/_layout.js
import { Stack } from 'expo-router';

export default function HeadLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="oversight" />
      <Stack.Screen name="resources" />
      <Stack.Screen name="performance" />
    </Stack>
  );
}