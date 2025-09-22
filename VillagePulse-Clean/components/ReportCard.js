// components/ReportCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import StatusBadge from './StatusBadge';

export default function ReportCard({ report, onPress, showActions = false, onStatusUpdate }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.title}>{report.title}</Text>
          <View style={styles.meta}>
            {report.priority && <StatusBadge status={report.priority} />}
            <Text style={styles.metaText}>{report.category}</Text>
            <Text style={styles.metaText}>{report.date}</Text>
          </View>
        </View>
        <StatusBadge status={report.status} />
      </View>

      {report.description && (
        <Text style={styles.description} numberOfLines={2}>
          {report.description}
        </Text>
      )}

      <View style={styles.details}>
        {report.location && (
          <Text style={styles.detailText}>📍 {report.location}</Text>
        )}
        {report.citizen && (
          <Text style={styles.detailText}>👤 {report.citizen}</Text>
        )}
        {report.trackingNumber && (
          <Text style={styles.trackingText}>ID: {report.trackingNumber}</Text>
        )}
      </View>

      {showActions && onStatusUpdate && (
        <View style={styles.actions}>
          {report.status === 'Pending' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#FBC02D' }]}
              onPress={() => onStatusUpdate(report.id, 'In Progress')}
            >
              <Text style={styles.actionText}>Assign</Text>
            </TouchableOpacity>
          )}
          {report.status === 'In Progress' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#388E3C' }]}
              onPress={() => onStatusUpdate(report.id, 'Resolved')}
            >
              <Text style={styles.actionText}>Resolve</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D1B2A',
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 12,
    color: '#4F5D75',
  },
  description: {
    fontSize: 14,
    color: '#4F5D75',
    marginBottom: 8,
    lineHeight: 20,
  },
  details: {
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  trackingText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});