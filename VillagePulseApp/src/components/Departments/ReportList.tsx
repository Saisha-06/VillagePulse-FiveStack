import React from 'react';
import { FlatList, Text, View } from 'react-native';
import ReportItem from './ReportItem';

interface Report {
  id: string;
  description: string;
  status: string;
  supportersCount: number;
}

interface Props {
  reports: Report[];
  title: string;
}

const ReportList: React.FC<Props> = ({ reports, title }) => {
  if (!reports.length) {
    return (
      <View style={{ marginVertical: 10 }}>
        <Text style={{ fontSize: 16, fontStyle: 'italic' }}>No {title.toLowerCase()} found.</Text>
      </View>
    );
  }

  return (
    <View style={{ marginVertical: 10 }}>
      <Text style={{ fontSize: 20, marginVertical: 8 }}>{title}</Text>
      <FlatList
        data={reports}
        keyExtractor={r => r.id}
        renderItem={({ item }) => <ReportItem report={item} />}
      />
    </View>
  );
};

export default ReportList;
