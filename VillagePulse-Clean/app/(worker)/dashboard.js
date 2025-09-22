// app/(worker)/dashboard.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function WorkerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    if (!user || !user.uid) {
      setLoading(false);
      return;
    }

    // Listener for assignments assigned to the current worker
    const q = query(collection(db, 'assignments'), where('assignedTo', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const liveAssignments = [];
      querySnapshot.forEach((doc) => {
        liveAssignments.push({ id: doc.id, ...doc.data() });
      });
      setAssignments(liveAssignments);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching assignments:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    router.replace('/(auth)/login');
  };

  const openStatusModal = (assignment, status) => {
    setSelectedAssignment(assignment);
    setNewStatus(status);
    setShowStatusModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedAssignment || !newStatus) return;

    try {
      // Step 1: Update the assignment status in the 'assignments' collection
      const assignmentRef = doc(db, 'assignments', selectedAssignment.id);
      await updateDoc(assignmentRef, {
        status: newStatus,
        completedAt: newStatus === 'Completed' ? new Date() : null,
      });

      // Step 2: Update the linked report status in the 'reports' collection
      if (selectedAssignment.reportId) {
        const reportRef = doc(db, 'reports', selectedAssignment.reportId);
        await updateDoc(reportRef, {
          status: newStatus === 'Completed' ? 'Resolved' : 'In Progress',
        });
      }

      console.log(`Assignment and report statuses updated to ${newStatus}`);
      setShowStatusModal(false);
    } catch (error) {
      console.error("Error updating assignment status:", error);
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
      case 'Completed': return '#388E3C';
      case 'Active': return '#FBC02D';
      case 'Pending': return '#D32F2F';
      default: return '#4F5D75';
    }
  };

  const pendingCount = assignments.filter(a => a.status === 'Pending').length;
  const activeCount = assignments.filter(a => a.status === 'Active').length;
  const completedCount = assignments.filter(a => a.status === 'Completed').length;

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={styles.loadingText}>Fetching your assignments...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Worker Dashboard</Text>
          <Text style={styles.subGreeting}>Hello, {user?.name || 'Field Worker'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#FFF8E1' }]}>
          <Text style={styles.statNumber}>{activeCount}</Text>
          <Text style={styles.statLabel}>Active Tasks</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFEBEE' }]}>
          <Text style={styles.statNumber}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E8' }]}>
          <Text style={styles.statNumber}>{completedCount}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* Team Assignments */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Assignments</Text>
        
        {assignments.length > 0 ? (
          assignments.map((assignment) => (
            <View key={assignment.id} style={styles.assignmentCard}>
              <View style={styles.assignmentHeader}>
                <View style={styles.assignmentInfo}>
                  <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                  <View style={styles.assignmentMeta}>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(assignment.priority) }]}>
                      <Text style={styles.badgeText}>{assignment.priority}</Text>
                    </View>
                    <Text style={styles.metaText}>📍 {assignment.location}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(assignment.status) }]}>
                  <Text style={styles.statusText}>{assignment.status}</Text>
                </View>
              </View>

              <Text style={styles.assignmentDescription}>{assignment.description}</Text>
              
              <View style={styles.assignmentDetails}>
                <Text style={styles.detailText}>📅 Assigned: {assignment.assignedAt?.toDate()?.toLocaleDateString()}</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                {assignment.status === 'Pending' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.startButton]}
                    onPress={() => openStatusModal(assignment, 'Active')}
                  >
                    <Text style={styles.actionButtonText}>Start Work</Text>
                  </TouchableOpacity>
                )}
                {assignment.status === 'Active' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.completeButton]}
                    onPress={() => openStatusModal(assignment, 'Completed')}
                  >
                    <Text style={styles.actionButtonText}>Mark Complete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🙌</Text>
            <Text style={styles.emptyStateTitle}>No Assignments</Text>
            <Text style={styles.emptyStateText}>
              You currently don't have any tasks assigned to you.
            </Text>
          </View>
        )}
      </View>
      
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

      {/* Custom Status Update Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showStatusModal}
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Status</Text>
            <Text style={styles.modalText}>
              Are you sure you want to change the status of "{selectedAssignment?.title}" to "{newStatus}"?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowStatusModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleUpdateStatus}
              >
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FFF9',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#1976D2',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subGreeting: {
    fontSize: 16,
    color: '#E3F2FD',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0D1B2A',
  },
  statLabel: {
    fontSize: 12,
    color: '#4F5D75',
    marginTop: 4,
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0D1B2A',
    marginBottom: 16,
  },
  assignmentCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D1B2A',
    marginBottom: 8,
  },
  assignmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
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
  assignmentDescription: {
    fontSize: 14,
    color: '#4F5D75',
    marginBottom: 12,
    lineHeight: 20,
  },
  assignmentDetails: {
    marginBottom: 16,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#FBC02D',
  },
  completeButton: {
    backgroundColor: '#388E3C',
  },
  confirmButton: {
    backgroundColor: '#1976D2',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
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