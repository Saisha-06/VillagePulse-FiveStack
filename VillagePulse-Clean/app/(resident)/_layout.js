// app/(resident)/_layout.js
import { Drawer } from 'expo-router/drawer';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';

export default function ResidentDrawerLayout() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        }}
      ]
    );
  };
  
  const CustomDrawerContent = (props) => {
    return (
      <View style={{ flex: 1 }}>
        <View style={[styles.drawerHeader, { paddingTop: insets.top }]}>
          <Text style={styles.drawerHeaderTitle}>Village Pulse</Text>
          <Text style={styles.drawerHeaderSubtitle}>Hello, {user?.name || 'Resident'}</Text>
        </View>
        <DrawerContentScrollView {...props}>
          <DrawerItemList {...props} />
        </DrawerContentScrollView>
        <View style={styles.drawerFooter}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const CustomHeaderTitle = () => (
    <View>
      <Text style={styles.headerTitleText}>Hello, {user?.name || 'Resident'}!</Text>
      <Text style={styles.headerSubtitleText}>Welcome to Village Pulse</Text>
    </View>
  );

  return (
    <Drawer
      initialRouteName="home"
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: '#2E7D32',
          height: 90 + insets.top,
        },
        headerTintColor: '#FFFFFF',
        headerTitle: CustomHeaderTitle, // Use the custom component here
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerLeft: () => (
          <TouchableOpacity
            style={{ marginLeft: 15 }}
            onPress={() => navigation.toggleDrawer()}
          >
            <Ionicons name="menu" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <View style={styles.headerRightContainer}>
            <TouchableOpacity onPress={() => router.push('/(resident)/profile')}>
              <Ionicons name="person-circle-outline" size={32} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ),
      })}
      drawerContent={CustomDrawerContent}
    >
      <Drawer.Screen
        name="home"
        options={{
          drawerLabel: 'Home',
          title: 'Resident Dashboard',
          drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="history"
        options={{
          drawerLabel: 'My Reports',
          title: 'My Reports',
          drawerIcon: ({ color, size }) => <Ionicons name="document-text-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          drawerLabel: 'My Profile',
          title: 'My Profile',
          drawerIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="report"
        options={{
          drawerItemStyle: { height: 0, overflow: 'hidden' },
          title: 'Report an Issue',
        }}
      />
      <Drawer.Screen
        name="nearby"
        options={{
          drawerLabel: 'Nearby',
          title: 'Nearby Reports',
          drawerIcon: ({ color, size }) => <Ionicons name="location-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="notification"
        options={{
          drawerLabel: 'Notifications',
          title: 'Notifications',
          drawerIcon: ({ color, size }) => <Ionicons name="notifications-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          drawerLabel: 'Settings',
          title: 'Settings',
          drawerIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  headerTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitleText: {
    fontSize: 12,
    color: '#E8F5E8',
    marginTop: 2,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 15,
  },
  drawerContainer: {
    flex: 1,
  },
  drawerHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#2E7D32',
  },
  drawerHeaderTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  drawerHeaderSubtitle: {
    fontSize: 14,
    color: '#E8F5E8',
    marginTop: 4,
  },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  logoutButton: {
    backgroundColor: '#D32F2F',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});