import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { Slot } from 'expo-router';
import AuthContainer from '../src/components/Auth/AuthContainer';

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return <AuthContainer />;
  }

  return <Slot />;  // show children routes (tab navigator, etc.) if logged in
}
