// app/(government)/dashboard.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { collection, query, onSnapshot, updateDoc, doc, addDoc, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function GovernmentDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [reports, setReports] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedReportToAssign, setSelectedReportToAssign] = useState(null);

  useEffect(() => {
    const reportsRef = collection(db, 'reports');
    const q = query(reportsRef);

    const unsubscribeReports = onSnapshot(q, (querySnapshot) => {
      const liveReports = [];
      const newStats = { total: 0, pending: 0, inProgress: 0, resolved: 0 };
      
      querySnapshot.forEach((doc) => {
        const report = { id: doc.id, ...doc.data() };
        liveReports.push(report);

        newStats.total++;
        switch (report.status) {
          case 'Pending':
            newStats.pending++;
            break;
          case 'In Progress':
            newStats.inProgress++;
            break;
          case 'Resolved':
            newStats.resolved++;
            break;
        }
      });
      setReports(liveReports);
      setStats(newStats);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching reports:", error);
      setLoading(false);
    });

    const workersRef = collection(db, 'users');
    const workersQuery = query(workersRef, where('role', '==', 'worker'));

    const unsubscribeWorkers = onSnapshot(workersQuery, (querySnapshot) => {
      const liveWorkers = [];
      querySnapshot.forEach((doc) => {
        liveWorkers.push({ id: doc.id, ...doc.data() });
      });
      setWorkers(liveWorkers);
    }, (error) => {
      console.error("Error fetching workers:", error);
    });

    return () => {
      unsubscribeReports();
      unsubscribeWorkers();
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

  const openAssignModal = (report) => {
    setSelectedReportToAssign(report);
    setShowAssignModal(true);
  };

  const assignReportToWorker = async (workerId, workerName) => {
    if (!selectedReportToAssign) return;

    try {
      const newAssignmentRef = await addDoc(collection(db, 'assignments'), {
        reportId: selectedReportToAssign.id,
        assignedTo: workerId,
        workerName: workerName,
        title: selectedReportToAssign.title,
        description: selectedReportToAssign.description,
        location: selectedReportToAssign.location,
        priority: selectedReportToAssign.priority,
        status: 'Pending',
        assignedAt: new Date(),
      });

      const reportRef = doc(db, 'reports', selectedReportToAssign.id);
      await updateDoc(reportRef, {
        status: 'In Progress',
        assignedToAssignmentId: newAssignmentRef.id,
        assignedToWorkerId: workerId,
      });

      console.log(`Report assigned and status updated to In Progress.`);
      setShowAssignModal(false);
    } catch (error) {
      console.error("Error assigning report:", error);
      Alert.alert('Assignment Failed', 'Could not assign report. Please try again.');
    }
  };
  
  const updateReportStatus = async (reportId, newStatus) => {
    try {
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, {
        status: newStatus,
      });
      console.log(`Report ${reportId} status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating report status:", error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#D32F2F';
      case 'Medium': return '#FBC02D';
      case 'Low': return '#388E3C';
      default: return '#4F5D75';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return '#388E3C';
      case 'In Progress': return '#FBC02D';
      case 'Pending': return '#D32F2F';
      default: return '#4F5D75';
    }
  };

  const filteredReports = reports.filter(report => {
    if (selectedFilter === 'All') return true;
    return report.status === selectedFilter;
  });

  const isWeb = Platform.OS === 'web';

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Fetching Reports...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isWeb && styles.webContainer]}>
      {/* Header */}
      <View style={[styles.header, isWeb && styles.webHeader]}>
        <View>
          <Text style={styles.title}>Government Dashboard</Text>
          <Text style={styles.subtitle}>Welcome, {user?.name || 'Government Staff'}</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => router.push('/(government)/users')} style={[styles.logoutButton, { marginRight: 10 }]}>
            <Text style={styles.logoutText}>Manage Users</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Stats Cards */}
        <View style={[styles.statsContainer, isWeb && styles.webStatsContainer]}>
          <View style={[styles.statCard, styles.totalCard]}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Reports</Text>
          </View>
          <View style={[styles.statCard, styles.pendingCard]}>
            <Text style={styles.statNumber}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statCard, styles.progressCard]}>
            <Text style={styles.statNumber}>{stats.inProgress}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={[styles.statCard, styles.resolvedCard]}>
            <Text style={styles.statNumber}>{stats.resolved}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <Text style={styles.sectionTitle}>Recent Reports</Text>
          <View style={styles.filterButtons}>
            {['All', 'Pending', 'In Progress', 'Resolved'].map(filter => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  selectedFilter === filter && styles.activeFilter
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text style={[
                  styles.filterText,
                  selectedFilter === filter && styles.activeFilterText
                ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reports List */}
        <View style={styles.reportsContainer}>
          {filteredReports.length > 0 ? (
            filteredReports.map((report) => (
              <View key={report.id} style={[styles.reportCard, isWeb && styles.webReportCard]}>
                <View style={styles.reportHeader}>
                  <View style={styles.reportInfo}>
                    <Text style={styles.reportTitle}>{report.title}</Text>
                    <View style={styles.reportMeta}>
                      <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(report.priority) }]}>
                        <Text style={styles.badgeText}>{report.priority}</Text>
                      </View>
                      <Text style={styles.metaText}>{report.category}</Text>
                      <Text style={styles.metaText}>{report.createdAt?.toDate?.().toLocaleDateString()}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) }]}>
                    <Text style={styles.statusText}>{report.status}</Text>
                  </View>
                </View>

                <Text style={styles.reportDescription}>{report.description}</Text>
                <Text style={styles.reportLocation}>Location: {report.location}</Text>
                {report.assignedToWorkerId && (
                  <Text style={styles.reportAssignment}>Assigned To: {workers.find(w => w.uid === report.assignedToWorkerId)?.name || 'N/A'}</Text>
                )}
                <Text style={styles.reportCitizen}>Reported by: {report.citizenName || 'Anonymous'}</Text>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  {report.status === 'Pending' && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.assignButton]}
                      onPress={() => openAssignModal(report)}
                    >
                      <Text style={styles.actionButtonText}>Assign Team</Text>
                    </TouchableOpacity>
                  )}
                  {report.status === 'In Progress' && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.resolveButton]}
                      onPress={() => updateReportStatus(report.id, 'Resolved')}
                    >
                      <Text style={styles.actionButtonText}>Mark Resolved</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={[styles.actionButton, styles.viewButton]}>
                    <Text style={styles.actionButtonText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noReportsContainer}>
              <Text style={styles.noReportsText}>No reports found for this filter.</Text>
            </View>
          )}
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

      {/* Assign Worker Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showAssignModal}
        onRequestClose={() => setShowAssignModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assign to a Worker</Text>
            <Text style={styles.modalText}>Select a worker to assign this report:</Text>
            <ScrollView style={styles.workerList}>
              {workers.length > 0 ? (
                workers.map(worker => (
                  <TouchableOpacity
                    key={worker.id}
                    style={styles.workerItem}
                    onPress={() => assignReportToWorker(worker.uid, worker.name)}
                  >
                    <Text style={styles.workerName}>{worker.name}</Text>
                    <Text style={styles.workerEmail}>{worker.email}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noWorkersText}>No workers available.</Text>
              )}
            </ScrollView>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowAssignModal(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#4F5D75',
  },
  noReportsContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noReportsText: {
    fontSize: 16,
    color: '#4F5D75',
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
  webContainer: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    backgroundColor: '#2E7D32',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    color: '#E8F5E8',
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
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  webStatsContainer: {
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  totalCard: {
    backgroundColor: '#E3F2FD',
  },
  pendingCard: {
    backgroundColor: '#FFEBEE',
  },
  progressCard: {
    backgroundColor: '#FFF8E1',
  },
  resolvedCard: {
    backgroundColor: '#E8F5E8',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0D1B2A',
  },
  statLabel: {
    fontSize: 14,
    color: '#4F5D75',
    marginTop: 4,
  },
  filtersContainer: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0D1B2A',
    marginBottom: 16,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeFilter: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  filterText: {
    color: '#4F5D75',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  reportsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  webReportCard: {
    shadowOpacity: 0.05,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0D1B2A',
    marginBottom: 8,
  },
  reportMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  metaText: {
    fontSize: 12,
    color: '#4F5D75',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  reportDescription: {
    fontSize: 14,
    color: '#4F5D75',
    marginBottom: 8,
    lineHeight: 20,
  },
  reportLocation: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  reportCitizen: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  assignButton: {
    backgroundColor: '#FBC02D',
  },
  resolveButton: {
    backgroundColor: '#388E3C',
  },
  viewButton: {
    backgroundColor: '#1976D2',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  workerList: {
    maxHeight: 200,
    width: '100%',
    marginBottom: 20,
  },
  workerItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    width: '100%',
  },
  workerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D1B2A',
  },
  workerEmail: {
    fontSize: 12,
    color: '#4F5D75',
  },
  noWorkersText: {
    textAlign: 'center',
    color: '#4F5D75',
  },
  reportAssignment: {
    fontSize: 12,
    color: '#1976D2',
    marginBottom: 4,
    fontWeight: '500',
  }
});