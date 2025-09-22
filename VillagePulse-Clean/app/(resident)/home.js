// app/(resident)/home.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Modal,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function CitizenHome() {
  const { user } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.uid) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'reports'),
      where('submittedBy', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(3)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userReports = [];
      querySnapshot.forEach((doc) => {
        userReports.push({ id: doc.id, ...doc.data() });
      });
      setReports(userReports);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching recent reports:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return '#388E3C';
      case 'In Progress': return '#FBC02D';
      case 'Pending': return '#D32F2F';
      default: return '#4F5D75';
    }
  };

  const pendingCount = reports.filter(r => r.status === 'Pending').length;
  const inProgressCount = reports.filter(r => r.status === 'In Progress').length;
  const resolvedCount = reports.filter(r => r.status === 'Resolved').length;

  return (
    <ScrollView style={styles.container}>
      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/(resident)/report')}
          >
            <Text style={styles.actionIcon}>📝</Text>
            <Text style={styles.actionTitle}>Report Issue</Text>
            <Text style={styles.actionSubtitle}>Report a problem in your area</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/(resident)/history')}
          >
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionTitle}>My Reports</Text>
            <Text style={styles.actionSubtitle}>Track your submissions</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* My Report Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Report Status</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#2E7D32" style={styles.loadingIndicator} />
        ) : (
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: '#FFEBEE' }]}>
              <Text style={styles.statNumber}>{pendingCount}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#FFF8E1' }]}>
              <Text style={styles.statNumber}>{inProgressCount}</Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#E8F5E8' }]}>
              <Text style={styles.statNumber}>{resolvedCount}</Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </View>
          </View>
        )}
      </View>

      {/* Recent Reports */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Reports</Text>
          <TouchableOpacity onPress={() => router.push('/(resident)/history')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color="#2E7D32" />
        ) : (
          reports.length > 0 ? (
            reports.map((report) => (
              <View key={report.id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <Text style={styles.reportTitle}>{report.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) }]}>
                    <Text style={styles.statusText}>{report.status}</Text>
                  </View>
                </View>
                
                <View style={styles.reportDetails}>
                  <Text style={styles.reportMeta}>📍 {report.location}</Text>
                  <Text style={styles.reportMeta}>🗂️ {report.category}</Text>
                  <Text style={styles.reportMeta}>📅 {report.createdAt?.toDate().toLocaleDateString()}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📄</Text>
              <Text style={styles.emptyStateTitle}>No reports found</Text>
              <Text style={styles.emptyStateText}>
                You haven't submitted any reports yet.
              </Text>
              <TouchableOpacity 
                style={styles.newReportButton}
                onPress={() => router.push('/(resident)/report')}
              >
                <Text style={styles.newReportButtonText}>Submit First Report</Text>
              </TouchableOpacity>
            </View>
          )
        )}
      </View>

      {/* Emergency Contact */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        <View style={styles.emergencyCard}>
          <Text style={styles.emergencyTitle}>🚨 Emergency Hotline</Text>
          <Text style={styles.emergencyNumber}>102 / 108</Text>
          <Text style={styles.emergencyText}>For immediate assistance</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FFF9',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0D1B2A',
  },
  seeAllText: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D1B2A',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#4F5D75',
    textAlign: 'center',
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D1B2A',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  reportDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  reportMeta: {
    fontSize: 12,
    color: '#4F5D75',
    marginRight: 16,
    marginBottom: 4,
  },
  emergencyCard: {
    backgroundColor: '#FFEBEE',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D32F2F',
    marginBottom: 8,
  },
  emergencyNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#D32F2F',
    marginBottom: 4,
  },
  emergencyText: {
    fontSize: 14,
    color: '#B71C1C',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0D1B2A',
  },
  statLabel: {
    fontSize: 12,
    color: '#4F5D75',
    marginTop: 4,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0D1B2A',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#4F5D75',
    textAlign: 'center',
    marginBottom: 20,
  },
  newReportButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  newReportButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});