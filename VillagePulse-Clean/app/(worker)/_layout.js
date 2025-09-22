// app/(leader)/_layout.js
import { Stack } from 'expo-router';

export default function LeaderLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="assignments" />
    </Stack>
  );
}