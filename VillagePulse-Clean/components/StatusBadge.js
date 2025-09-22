// components/StatusBadge.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const statusColors = {
  'Pending': '#D32F2F',
  'In Progress': '#FBC02D',
  'Resolved': '#388E3C',
  'Completed': '#388E3C',
  'Active': '#FBC02D',
  'High': '#D32F2F',
  'Medium': '#FBC02D',
  'Low': '#388E3C',
  'Emergency': '#B71C1C'
};

export default function StatusBadge({ status, variant = 'status' }) {
  const backgroundColor = statusColors[status] || '#4F5D75';
  
  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={styles.text}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});