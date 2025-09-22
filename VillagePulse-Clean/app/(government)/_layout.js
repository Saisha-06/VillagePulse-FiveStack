// app/(department)/_layout.js
import { Stack } from 'expo-router';

export default function DepartmentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="reports" />
      <Stack.Screen name="analytics" />
    </Stack>
  );
}