// app/(head)/dashboard.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get("window").width;

export default function VillageHeadDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [reports, setReports] = useState([]);
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    // Listener for all reports
    const reportsQuery = query(collection(db, 'reports'));
    const unsubscribeReports = onSnapshot(reportsQuery, (querySnapshot) => {
      const allReports = [];
      querySnapshot.forEach(doc => allReports.push({ id: doc.id, ...doc.data() }));
      setReports(allReports);
    }, (error) => {
      console.error("Error fetching reports:", error);
    });
    
    // Listener for all government officials and workers
    const officialsQuery = query(collection(db, 'users'), where('role', 'in', ['government', 'worker']));
    const unsubscribeOfficials = onSnapshot(officialsQuery, (querySnapshot) => {
      const allOfficials = [];
      querySnapshot.forEach(doc => allOfficials.push({ id: doc.id, ...doc.data() }));
      setOfficials(allOfficials);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching officials:", error);
      setLoading(false);
    });

    return () => {
      unsubscribeReports();
      unsubscribeOfficials();
    };
  }, []);

  const handleLogout = async () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    router.replace('/(auth)/login');
  };

  // --- Dynamic Calculations ---
  const totalReports = reports.length;
  const resolvedReports = reports.filter(r => r.status === 'Resolved');
  const pendingReports = reports.filter(r => r.status === 'Pending');
  const inProgressReports = reports.filter(r => r.status === 'In Progress');
  const resolutionRate = totalReports > 0 ? Math.round((resolvedReports.length / totalReports) * 100) : 0;
  
  const totalPopulation = 12500;
  const totalHouseholds = 2800;
  const averageResolutionTime = 'N/A'; // Placeholder
  const budgetAllocated = 850000; // Placeholder
  const budgetUsed = 632000; // Placeholder
  const budgetUtilization = Math.round((budgetUsed / budgetAllocated) * 100);
  
  const chartData = [
    {
      name: 'Resolved',
      count: resolvedReports.length,
      color: '#388E3C',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: 'In Progress',
      count: inProgressReports.length,
      color: '#FBC02D',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: 'Pending',
      count: pendingReports.length,
      color: '#D32F2F',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
  ];

  const isWeb = Platform.OS === 'web';

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#6A1B9A" />
        <Text style={styles.loadingText}>Fetching Analytics...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isWeb && styles.webContainer]}>
      {/* Header */}
      <View style={[styles.header, isWeb && styles.webHeader]}>
        <View>
          <Text style={styles.title}>Village Head Dashboard</Text>
          <Text style={styles.subtitle}>Welcome, {user?.name || 'Panchayat Leader'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Village Overview Cards */}
        <View style={[styles.overviewGrid, isWeb && styles.webOverviewGrid]}>
          <View style={[styles.overviewCard, { backgroundColor: '#E3F2FD' }]}>
            <Text style={styles.overviewNumber}>{totalPopulation.toLocaleString()}</Text>
            <Text style={styles.overviewLabel}>Total Population</Text>
            <Text style={styles.overviewSub}>{totalHouseholds} households</Text>
          </View>
          <View style={[styles.overviewCard, { backgroundColor: '#E8F5E8' }]}>
            <Text style={styles.overviewNumber}>{resolutionRate}%</Text>
            <Text style={styles.overviewLabel}>Issue Resolution</Text>
            <Text style={styles.overviewSub}>{resolvedReports.length}/{totalReports} resolved</Text>
          </View>
          <View style={[styles.overviewCard, { backgroundColor: '#FFF8E1' }]}>
            <Text style={styles.overviewNumber}>{inProgressReports.length}</Text>
            <Text style={styles.overviewLabel}>In Progress</Text>
            <Text style={styles.overviewSub}>{pendingReports.length} pending</Text>
          </View>
          <View style={[styles.overviewCard, { backgroundColor: '#FCE4EC' }]}>
            <Text style={styles.overviewNumber}>₹{(budgetUsed/100000).toFixed(1)}L</Text>
            <Text style={styles.overviewLabel}>Budget Utilized</Text>
            <Text style={styles.overviewSub}>{budgetUtilization}% of ₹{(budgetAllocated/100000).toFixed(1)}L</Text>
          </View>
        </View>

        {/* Report Distribution Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Report Distribution</Text>
          {totalReports > 0 ? (
            <PieChart
              data={chartData}
              width={screenWidth - 40}
              height={180}
              chartConfig={{
                backgroundColor: '#f6f6f6',
                backgroundGradientFrom: '#f6f6f6',
                backgroundGradientTo: '#f6f6f6',
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="count"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          ) : (
            <Text style={styles.noDataText}>No reports to display yet.</Text>
          )}
        </View>

        {/* Officials & Workers Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Officials & Workers Overview</Text>
          <View style={styles.officialsGrid}>
            {officials.length > 0 ? (
              officials.map((official) => (
                <View key={official.id} style={styles.officialCard}>
                  <Text style={styles.officialName}>{official.name}</Text>
                  <Text style={styles.officialDept}>{official.role === 'worker' ? 'Field Worker' : 'Government Official'}</Text>
                  <View style={styles.officialMetrics}>
                    <View style={styles.officialStat}>
                      <Text style={styles.officialStatValue}>N/A</Text>
                      <Text style={styles.officialStatLabel}>Reports Handled</Text>
                    </View>
                    <View style={styles.officialStat}>
                      <Text style={styles.officialStatValue}>N/A</Text>
                      <Text style={styles.officialStatLabel}>Performance</Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>No officials or workers found.</Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => Alert.alert("Feature Coming Soon!", "Team Management is the next step for this dashboard.")}
            >
              <Text style={styles.actionIcon}>👥</Text>
              <Text style={styles.actionTitle}>Team Management</Text>
              <Text style={styles.actionSubtitle}>Manage officials & workers</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => Alert.alert("Feature Coming Soon!", "Budget Allocation is the next step for this dashboard.")}
            >
              <Text style={styles.actionIcon}>💰</Text>
              <Text style={styles.actionTitle}>Budget Allocation</Text>
              <Text style={styles.actionSubtitle}>Allocate department budgets</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => Alert.alert("Feature Coming Soon!", "Performance Review is the next step for this dashboard.")}
            >
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionTitle}>Performance Review</Text>
              <Text style={styles.actionSubtitle}>Review team performance</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Custom Logout Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showLogoutModal}
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Logout</Text>
            <Text style={styles.modalText}>Are you sure you want to log out?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.logoutConfirmButton]}
                onPress={confirmLogout}
              >
                <Text style={styles.modalButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#4F5D75',
  },
  noDataText: {
    textAlign: 'center',
    color: '#4F5D75',
    marginTop: 20,
  },
  webContainer: {
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    backgroundColor: '#6A1B9A',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  webHeader: {
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#E1BEE7',
    marginTop: 2,
  },
  userInfo: {
    fontSize: 14,
    color: '#E1BEE7',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  webOverviewGrid: {
    flexWrap: 'nowrap',
  },
  overviewCard: {
    flex: 1,
    minWidth: 160,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  overviewNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0D1B2A',
  },
  overviewLabel: {
    fontSize: 12,
    color: '#4F5D75',
    marginTop: 4,
    textAlign: 'center',
  },
  overviewSub: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  chartSection: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0D1B2A',
    marginBottom: 16,
  },
  officialsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  officialCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 8,
  },
  officialName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D1B2A',
  },
  officialDept: {
    fontSize: 10,
    color: '#4F5D75',
    marginBottom: 8,
  },
  officialMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  officialStat: {
    alignItems: 'center',
  },
  officialStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D1B2A',
  },
  officialStatLabel: {
    fontSize: 8,
    color: '#4F5D75',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0D1B2A',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 10,
    color: '#4F5D75',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#4F5D75',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  logoutConfirmButton: {
    backgroundColor: '#D32F2F',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});