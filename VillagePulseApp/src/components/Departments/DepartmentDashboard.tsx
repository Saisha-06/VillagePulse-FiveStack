import React, { useState } from 'react';
import { View, Text, Button, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';

import { getAuth, signOut } from 'firebase/auth';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootStackParamList';

type Props = NativeStackScreenProps<RootStackParamList, 'DepartmentDashboard'>;

const MOCK_REPORTS = [
  { id: '1', description: 'Power outage near park', status: 'Pending', userId: 'user1', supportersCount: 10 },
  { id: '2', description: 'Transformer broken', status: 'In Progress', userId: 'user2', supportersCount: 5 },
];

export default function DepartmentDashboard({ navigation, route }: Props) {
  const { departmentId, departmentName } = route.params;
  const [currentList, setCurrentList] = useState('my');

  const myReports = MOCK_REPORTS.filter(r => r.userId === 'user1');
  const nearbyReports = MOCK_REPORTS; // Replace with real location filtering
  const allReports = MOCK_REPORTS;

  const getReportsToShow = () => {
    if (currentList === 'my') return myReports;
    if (currentList === 'nearby') return nearbyReports;
    return allReports;
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      // onAuthStateChanged listener elsewhere will handle redirect to auth screen
    } catch (error: any) {
      Alert.alert('Logout failed', error.message);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Button title="Logout" onPress={handleLogout} />

      <Button title="Want to report?" onPress={() => navigation.navigate('ReportForm', { departmentId })} />

      <View style={styles.tabsContainer}>
        <TouchableOpacity onPress={() => setCurrentList('my')} style={[styles.tab, currentList === 'my' && styles.activeTab]}>
          <Text style={styles.tabText}>My Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCurrentList('nearby')} style={[styles.tab, currentList === 'nearby' && styles.activeTab]}>
          <Text style={styles.tabText}>Nearby Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCurrentList('all')} style={[styles.tab, currentList === 'all' && styles.activeTab]}>
          <Text style={styles.tabText}>All Reports</Text>
        </TouchableOpacity>
      </View>

      {getReportsToShow().map(report => (
        <TouchableOpacity key={report.id} style={styles.reportCard} onPress={() => navigation.navigate('ReportDetail', { reportId: report.id })}>
          <Text style={styles.reportDesc}>{report.description}</Text>
          <Text>Status: {report.status}</Text>
          <Text>Supporters: {report.supportersCount}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16 },
  tab: { padding: 10, borderRadius: 6, backgroundColor: '#ccc' },
  activeTab: { backgroundColor: '#007bff' },
  tabText: { color: 'white' },
  reportCard: { backgroundColor: '#f5f5f5', padding: 14, marginBottom: 12, borderRadius: 8 },
  reportDesc: { fontWeight: 'bold', marginBottom: 6 },
});
