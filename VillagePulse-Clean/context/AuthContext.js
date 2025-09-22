// context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import * as Notifications from 'expo-notifications';
import { auth, db } from '../config/firebase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

async function registerForPushNotificationsAsync(user) {
  let token;
  if (!Notifications.isDevice) {
    console.warn("Must be using a physical device for Push Notifications.");
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.warn("Failed to get push token for push notification!");
    return;
  }
  
  try {
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Push Token:", token);
    
    if (user && user.uid && token) {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        pushToken: token,
      });
      console.log("Push token saved to user profile.");
    }
    
  } catch (error) {
    console.error("Error getting or saving push token:", error);
  }
  return token;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      try {
        if (authUser) {
          const userRef = doc(db, 'users', authUser.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser(userData);
            setUserRole(userData.role);
          } else {
            await signOut(auth);
            setUser(null);
            setUserRole(null);
          }
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error("Error in auth listener:", error);
        await signOut(auth);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && user.uid) {
      registerForPushNotificationsAsync(user);
    }
  }, [user]);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Logout Failed", "There was a problem logging you out. Please try again.");
    }
  };

  const value = {
    user,
    userRole,
    loading,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};