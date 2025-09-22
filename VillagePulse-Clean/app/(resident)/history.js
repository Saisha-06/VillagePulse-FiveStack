// app/(resident)/history.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ReportHistory() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('All');

  // States for the new rating modal
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    if (!user || !user.uid) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'reports'),
      where('submittedBy', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userReports = [];
      querySnapshot.forEach((doc) => {
        userReports.push({ id: doc.id, ...doc.data() });
      });
      setReports(userReports);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching report history:", error);
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#D32F2F';
      case 'Medium': return '#FBC02D';
      case 'Low': return '#388E3C';
      default: return '#4F5D75';
    }
  };

  const filteredReports = selectedFilter === 'All' 
    ? reports 
    : reports.filter(report => report.status === selectedFilter);

  const openRatingModal = (report) => {
    setSelectedReport(report);
    setRating(report.rating || 0);
    setFeedbackText(report.feedback || '');
    setRatingModalVisible(true);
  };
  
  const openFeedbackModal = (report) => {
    setSelectedReport(report);
    setFeedbackModalVisible(true);
  };

  const submitRating = async () => {
    if (!selectedReport) return;

    setSubmittingRating(true);
    try {
      const reportRef = doc(db, 'reports', selectedReport.id);
      await updateDoc(reportRef, {
        rating: rating,
        feedback: feedbackText,
        ratedAt: new Date(),
      });
      Alert.alert('Success', 'Thank you for your feedback!');
      setRatingModalVisible(false);
      setFeedbackText('');
      setRating(0);
    } catch (error) {
      console.error("Error submitting rating:", error);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Fetching your reports...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header is now handled by the layout file */}
      <ScrollView style={styles.content}>
        {/* Summary Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
            <Text style={styles.statNumber}>{reports.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FFEBEE' }]}>
            <Text style={styles.statNumber}>{reports.filter(r => r.status === 'Pending').length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FFF8E1' }]}>
            <Text style={styles.statNumber}>{reports.filter(r => r.status === 'In Progress').length}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#E8F5E8' }]}>
            <Text style={styles.statNumber}>{reports.filter(r => r.status === 'Resolved').length}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
          </ScrollView>
        </View>

        {/* Reports List */}
        <View style={styles.reportsContainer}>
          {filteredReports.length > 0 ? (
            filteredReports.map((report) => (
              <TouchableOpacity 
                key={report.id} 
                style={styles.reportCard}
                onPress={() => openFeedbackModal(report)}
              >
                <View style={styles.reportHeader}>
                  <View style={styles.reportInfo}>
                    <Text style={styles.reportTitle}>{report.title}</Text>
                    <View style={styles.reportMeta}>
                      <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(report.priority) }]}>
                        <Text style={styles.badgeText}>{report.priority}</Text>
                      </View>
                      <Text style={styles.metaText}>{report.category}</Text>
                      <Text style={styles.metaText}>{report.createdAt?.toDate().toLocaleDateString()}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) }]}>
                    <Text style={styles.statusText}>{report.status}</Text>
                  </View>
                </View>

                <Text style={styles.reportLocation}>📍 {report.location}</Text>
                <Text style={styles.trackingNumber}>Tracking: {report.id.substring(0, 8).toUpperCase()}</Text>
                
                {report.status === 'Resolved' && (
                  <View style={styles.resolutionContainer}>
                    {report.rating ? (
                      <View>
                        <Text style={styles.resolutionTitle}>Your Rating:</Text>
                        <View style={{ flexDirection: 'row', gap: 2, marginTop: 4 }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons 
                              key={star} 
                              name={star <= report.rating ? 'star' : 'star-outline'} 
                              size={18} 
                              color="#FFD700" 
                            />
                          ))}
                        </View>
                        {report.feedback && <Text style={styles.resolutionText}>Feedback: {report.feedback}</Text>}
                      </View>
                    ) : (
                      <TouchableOpacity 
                        style={styles.rateButton}
                        onPress={() => openRatingModal(report)}
                      >
                        <Text style={styles.rateButtonText}>Rate Service</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📄</Text>
              <Text style={styles.emptyStateTitle}>No reports found</Text>
              <Text style={styles.emptyStateText}>
                {selectedFilter === 'All' 
                  ? "You haven't submitted any reports yet"
                  : `No ${selectedFilter.toLowerCase()} reports found`
                }
              </Text>
              {selectedFilter === 'All' && (
                <TouchableOpacity 
                  style={styles.newReportButton}
                  onPress={() => router.push('/(resident)/report')}
                >
                  <Text style={styles.newReportButtonText}>Submit First Report</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Report Details Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={feedbackModalVisible}
        onRequestClose={() => setFeedbackModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedReport && (
              <ScrollView>
                <Text style={styles.modalTitle}>{selectedReport.title}</Text>
                {selectedReport.photoURLs && selectedReport.photoURLs.length > 0 && (
                  <View style={styles.modalImageContainer}>
                    {selectedReport.photoURLs.map((url, index) => (
                      <Image key={index} source={{ uri: url }} style={styles.modalImage} />
                    ))}
                  </View>
                )}
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedReport.status), alignSelf: 'flex-start', marginBottom: 12 }]}>
                  <Text style={styles.statusText}>{selectedReport.status}</Text>
                </View>
                <Text style={styles.modalDetailText}><Text style={styles.modalDetailLabel}>Tracking ID:</Text> {selectedReport.id.substring(0, 8).toUpperCase()}</Text>
                <Text style={styles.modalDetailText}><Text style={styles.modalDetailLabel}>Submitted On:</Text> {selectedReport.createdAt?.toDate().toLocaleDateString()}</Text>
                <Text style={styles.modalDetailText}><Text style={styles.modalDetailLabel}>Category:</Text> {selectedReport.category}</Text>
                <Text style={styles.modalDetailText}><Text style={styles.modalDetailLabel}>Priority:</Text> {selectedReport.priority}</Text>
                <Text style={styles.modalDetailText}><Text style={styles.modalDetailLabel}>Location:</Text> {selectedReport.location}</Text>
                <Text style={[styles.modalDetailText, { marginTop: 12 }]}><Text style={styles.modalDetailLabel}>Description:</Text> {selectedReport.description}</Text>
                {selectedReport.feedback && (
                  <Text style={[styles.modalDetailText, { marginTop: 12 }]}><Text style={styles.modalDetailLabel}>Feedback:</Text> {selectedReport.feedback}</Text>
                )}
                {selectedReport.resolution && (
                  <Text style={[styles.modalDetailText, { marginTop: 12 }]}><Text style={styles.modalDetailLabel}>Resolution:</Text> {selectedReport.resolution}</Text>
                )}
                {selectedReport.rating && (
                  <View style={{flexDirection:'row', alignItems:'center', marginTop: 12}}>
                    <Text style={styles.modalDetailLabel}>Rating:</Text>
                    <View style={{ flexDirection: 'row', gap: 2, marginLeft: 8 }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons 
                              key={star} 
                              name={star <= selectedReport.rating ? 'star' : 'star-outline'} 
                              size={18} 
                              color="#FFD700" 
                            />
                          ))}
                        </View>
                  </View>
                )}
              </ScrollView>
            )}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setFeedbackModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Rating Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={ratingModalVisible}
        onRequestClose={() => setRatingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.ratingModalContent}>
            <Text style={styles.modalTitle}>Rate Your Experience</Text>
            <Text style={styles.modalText}>How would you rate the service?</Text>
            <View style={styles.starContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicons name={star <= rating ? 'star' : 'star-outline'} size={40} color="#FFD700" />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.feedbackInput}
              placeholder="Your feedback (optional)"
              value={feedbackText}
              onChangeText={setFeedbackText}
              multiline
              textAlignVertical="top"
              numberOfLines={4}
            />
            <TouchableOpacity 
              style={[styles.submitRatingButton, submittingRating && styles.submitRatingButtonDisabled]}
              onPress={submitRating}
              disabled={submittingRating}
            >
              <Text style={styles.submitRatingButtonText}>
                {submittingRating ? <ActivityIndicator color="#FFFFFF" /> : 'Submit Rating'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelRatingButton}
              onPress={() => setRatingModalVisible(false)}
            >
              <Text style={styles.cancelRatingButtonText}>Cancel</Text>
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
    backgroundColor: '#F9FFF9',
  },
  centerContent: {
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
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#2E7D32',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 8,
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
  filterContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
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
    fontSize: 14,
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
    padding: 16,
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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D1B2A',
    marginBottom: 6,
  },
  reportMeta: {
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
  reportLocation: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  trackingNumber: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
  },
  resolutionContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
  },
  resolutionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  resolutionText: {
    fontSize: 12,
    color: '#1B5E20',
    lineHeight: 16,
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
    width: '90%',
    maxHeight: '80%',
    alignItems: 'center',
  },
  modalImageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  modalImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDetailText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#4F5D75',
    textAlign: 'left',
    width: '100%',
  },
  modalDetailLabel: {
    fontWeight: '600',
    color: '#0D1B2A',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#2E7D32',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  // New styles for rating modal
  ratingModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    alignItems: 'center',
  },
  starContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  feedbackInput: {
    backgroundColor: '#F5F5F5',
    width: '100%',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitRatingButton: {
    backgroundColor: '#1976D2',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  submitRatingButtonDisabled: {
    opacity: 0.7,
  },
  submitRatingButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  cancelRatingButton: {
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  cancelRatingButtonText: {
    color: '#4F5D75',
    fontWeight: '600',
  },
  rateButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  rateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
});