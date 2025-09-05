import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Button, StyleSheet, Alert } from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootStackParamList';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportDetail'>;

interface ReportDetails {
  id: string;
  description: string;
  status: string;
  supportersCount: number;
  feedbacks: { id: string; user: string; rating: number; comment: string }[];
}

export default function ReportDetailPage({ route, navigation }: Props) {
  const { reportId } = route.params;
  const [report, setReport] = useState<ReportDetails | null>(null);

  useEffect(() => {
    // TODO: Replace with backend API call
    setReport({
      id: reportId,
      description: 'Power outage near park',
      status: 'Pending',
      supportersCount: 12,
      feedbacks: [
        { id: 'f1', user: 'Alice', rating: 5, comment: 'Thanks for reporting!' },
        { id: 'f2', user: 'Bob', rating: 4, comment: 'Hope it gets fixed soon.' },
      ],
    });
  }, [reportId]);

  const handleSupport = () => {
    // TODO: Backend API call to support report
    Alert.alert('Supported', 'You have supported this report.');
    setReport(prev => prev ? { ...prev, supportersCount: prev.supportersCount + 1 } : prev);
  };

  if (!report) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading report details...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Report Detail</Text>

      <Text style={styles.label}>Description:</Text>
      <Text style={styles.text}>{report.description}</Text>

      <Text style={styles.label}>Status:</Text>
      <Text style={styles.text}>{report.status}</Text>

      <Text style={styles.label}>Supporters:</Text>
      <Text style={styles.text}>{report.supportersCount}</Text>

      <Button title="Support this Report" onPress={handleSupport} />

      <Text style={styles.sectionTitle}>User Feedback</Text>
      {report.feedbacks.length === 0 && <Text>No feedback yet.</Text>}
      {report.feedbacks.map(fb => (
        <View key={fb.id} style={styles.feedback}>
          <Text style={{ fontWeight: 'bold' }}>{fb.user} - Rating: {fb.rating}/5</Text>
          <Text>{fb.comment}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: { fontSize: 24, marginBottom: 16 },
  label: { fontWeight: 'bold', marginTop: 12, fontSize: 16 },
  text: { fontSize: 15 },
  sectionTitle: { marginTop: 20, fontSize: 20, fontWeight: 'bold' },
  feedback: { marginTop: 10, padding: 10, backgroundColor: '#f2f2f2', borderRadius: 6 },
});
