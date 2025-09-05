import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Report {
  id: string;
  description: string;
  status: string;
  supportersCount: number;
}

interface Props {
  report: Report;
}

const ReportItem: React.FC<Props> = ({ report }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.desc}>{report.description}</Text>
      <Text>Status: {report.status}</Text>
      <Text>Supporters: {report.supportersCount}</Text>
    </View>
  );
};

export default ReportItem;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    marginBottom: 10,
    borderRadius: 6,
  },
  desc: {
    fontWeight: 'bold',
  },
});
