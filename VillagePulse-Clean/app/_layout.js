// app/_layout.js
import { Stack, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth, AuthProvider } from '../context/AuthContext';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar style="auto" />
        <RootLayoutNav />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

// This component handles all the navigation logic using conditional rendering
function RootLayoutNav() {
  const { user, userRole, loading } = useAuth();

  // Show a loading screen while the app checks for an existing session
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // If there is no user, return the Auth stack
  if (!user) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/register" />
      </Stack>
    );
  }
  
  // If a user is logged in, return the stack for their specific role
  switch (userRole) {
    case 'citizen':
      return (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(resident)" />
        </Stack>
      );
    case 'government':
      return (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(government)" />
        </Stack>
      );
    case 'worker':
      return (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(worker)" />
        </Stack>
      );
    case 'leader':
      return (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(head)" />
        </Stack>
      );
    default:
      return (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)/login" />
        </Stack>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FFF9',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4F5D75',
  },
});