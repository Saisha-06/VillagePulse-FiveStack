// app/(head)/performance.js
import { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Alert,
  Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

// Mock performance analytics data
const mockPerformanceData = {
  overallScore: 78,
  totalReports: 245,
  resolvedReports: 180,
  avgResolutionTime: 2.8,
  citizenSatisfaction: 4.2,
  monthlyTrend: [
    { month: 'Oct', performance: 72, reports: 42, resolved: 35 },
    { month: 'Nov', performance: 75, reports: 48, resolved: 40 },  
    { month: 'Dec', performance: 76, reports: 52, resolved: 45 },
    { month: 'Jan', performance: 78, reports: 14, resolved: 12 }
  ],
  departmentPerformance: [
    {
      name: 'Water & Sanitation',
      performance: 88,
      reports: 89,
      resolved: 78,
      avgTime: 2.2,
      satisfaction: 4.4,
      trend: 'up',
      issues: []
    },
    {
      name: 'Roads & Infrastructure', 
      performance: 85,
      reports: 76,
      resolved: 64,
      avgTime: 3.1,
      satisfaction: 4.1,
      trend: 'up',
      issues: ['Slow pothole repairs']
    },
    {
      name: 'Electricity',
      performance: 72,
      reports: 45,
      resolved: 32,
      avgTime: 2.8,
      satisfaction: 3.8,
      trend: 'down',
      issues: ['Delayed response to outages', 'Equipment shortages']
    },
    {
      name: 'Waste Management',
      performance: 69,
      reports: 35,
      resolved: 24,
      avgTime: 3.5,
      satisfaction: 3.9,
      trend: 'stable',
      issues: ['Collection delays', 'Vehicle maintenance']
    }
  ],
  teamPerformance: [
    {
      id: 'TEAM_WATER_001',
      leader: 'Ramesh Kumar',
      category: 'Water & Sanitation',
      performance: 92,
      tasksCompleted: 28,
      avgTime: 1.8,
      efficiency: 94,
      trend: 'up'
    },
    {
      id: 'TEAM_ROADS_002',
      leader: 'Priya Desai', 
      category: 'Roads & Infrastructure',
      performance: 87,
      tasksCompleted: 22,
      avgTime: 2.5,
      efficiency: 89,
      trend: 'up'
    },
    {
      id: 'TEAM_ELECT_003',
      leader: 'Santosh Naik',
      category: 'Electricity',
      performance: 74,
      tasksCompleted: 15,
      avgTime: 3.2,
      efficiency: 76,
      trend: 'down'
    }
  ],
  citizenFeedback: {
    totalRatings: 156,
    averageRating: 4.2,
    breakdown: [
      { rating: 5, count: 68, percentage: 44 },
      { rating: 4, count: 52, percentage: 33 },
      { rating: 3, count: 24, percentage: 15 },
      { rating: 2, count: 8, percentage: 5 },
      { rating: 1, count: 4, percentage: 3 }
    ],
    topComplaints: [
      'Slow response time',
      'Poor communication',
      'Incomplete repairs'
    ],
    topPraise: [
      'Good quality work',
      'Professional behavior',
      'Follow up properly'
    ]
  }
};

export default function PerformanceAnalytics() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const getPerformanceColor = (score) => {
    if (score >= 85) return '#388E3C';
    if (score >= 70) return '#FBC02D';
    return '#D32F2F';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '➡️';
    }
  };

  const resolutionRate = Math.round((mockPerformanceData.resolvedReports / mockPerformanceData.totalReports) * 100);
  const isWeb = Platform.OS === 'web';

  return (
    <View style={[styles.container, isWeb && styles.webContainer]}>
      {/* Header */}
      <View style={[styles.header, isWeb && styles.webHeader]}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Performance Analytics</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {['This Week', 'This Month', 'Last 3 Months', 'This Year'].map(period => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.activePeriod
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodText,
                selectedPeriod === period && styles.activePeriodText
              ]}>
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overall Performance Score */}
        <View style={styles.scoreSection}>
          <Text style={styles.sectionTitle}>Village Performance Score</Text>
          
          <View style={styles.scoreCard}>
            <View style={styles.scoreCircle}>
              <Text style={[styles.scoreNumber, { color: getPerformanceColor(mockPerformanceData.overallScore) }]}>
                {mockPerformanceData.overallScore}
              </Text>
              <Text style={styles.scoreLabel}>Overall Score</Text>
            </View>
            
            <View style={styles.scoreMetrics}>
              <View style={styles.scoreMetric}>
                <Text style={styles.metricValue}>{resolutionRate}%</Text>
                <Text style={styles.metricLabel}>Resolution Rate</Text>
              </View>
              <View style={styles.scoreMetric}>
                <Text style={styles.metricValue}>{mockPerformanceData.avgResolutionTime}</Text>
                <Text style={styles.metricLabel}>Avg Days</Text>
              </View>
              <View style={styles.scoreMetric}>
                <Text style={styles.metricValue}>{mockPerformanceData.citizenSatisfaction}</Text>
                <Text style={styles.metricLabel}>Satisfaction</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Monthly Trend */}
        <View style={styles.trendSection}>
          <Text style={styles.sectionTitle}>Performance Trend</Text>
          
          <View style={styles.trendChart}>
            {mockPerformanceData.monthlyTrend.map((month, index) => (
              <View key={month.month} style={styles.trendBar}>
                <View style={styles.barContainer}>
                  <View 
                    style={[
                      styles.performanceBar,
                      { 
                        height: `${month.performance}%`,
                        backgroundColor: getPerformanceColor(month.performance)
                      }
                    ]}
                  />
                </View>
                <Text style={styles.monthLabel}>{month.month}</Text>
                <Text style={styles.monthScore}>{month.performance}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Department Performance */}
        <View style={styles.departmentSection}>
          <Text style={styles.sectionTitle}>Department Performance</Text>
          
          {mockPerformanceData.departmentPerformance.map((dept) => (
            <View key={dept.name} style={styles.deptCard}>
              <View style={styles.deptHeader}>
                <View style={styles.deptInfo}>
                  <Text style={styles.deptName}>{dept.name}</Text>
                  <Text style={styles.deptTrend}>
                    {getTrendIcon(dept.trend)} {dept.performance}% Performance
                  </Text>
                </View>
                <View style={[styles.performanceCircle, { backgroundColor: getPerformanceColor(dept.performance) }]}>
                  <Text style={styles.performanceText}>{dept.performance}</Text>
                </View>
              </View>

              <View style={styles.deptMetrics}>
                <View style={styles.deptMetric}>
                  <Text style={styles.deptMetricValue}>{Math.round((dept.resolved / dept.reports) * 100)}%</Text>
                  <Text style={styles.deptMetricLabel}>Resolved</Text>
                </View>
                <View style={styles.deptMetric}>
                  <Text style={styles.deptMetricValue}>{dept.avgTime}d</Text>
                  <Text style={styles.deptMetricLabel}>Avg Time</Text>
                </View>
                <View style={styles.deptMetric}>
                  <Text style={styles.deptMetricValue}>{dept.satisfaction}/5</Text>
                  <Text style={styles.deptMetricLabel}>Rating</Text>
                </View>
              </View>

              {dept.issues.length > 0 && (
                <View style={styles.issuesContainer}>
                  <Text style={styles.issuesTitle}>Issues:</Text>
                  {dept.issues.map((issue, index) => (
                    <Text key={index} style={styles.issueText}>• {issue}</Text>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Team Performance */}
        <View style={styles.teamSection}>
          <Text style={styles.sectionTitle}>Field Team Performance</Text>
          
          <View style={styles.teamGrid}>
            {mockPerformanceData.teamPerformance.map((team) => (
              <View key={team.id} style={styles.teamCard}>
                <View style={styles.teamHeader}>
                  <Text style={styles.teamLeader}>{team.leader}</Text>
                  <Text style={styles.teamTrend}>{getTrendIcon(team.trend)}</Text>
                </View>
                
                <Text style={styles.teamCategory}>{team.category}</Text>
                
                <View style={styles.teamMetrics}>
                  <View style={styles.teamMetric}>
                    <Text style={[styles.teamMetricValue, { color: getPerformanceColor(team.performance) }]}>
                      {team.performance}%
                    </Text>
                    <Text style={styles.teamMetricLabel}>Performance</Text>
                  </View>
                  <View style={styles.teamMetric}>
                    <Text style={styles.teamMetricValue}>{team.tasksCompleted}</Text>
                    <Text style={styles.teamMetricLabel}>Tasks Done</Text>
                  </View>
                </View>

                <View style={styles.efficiencyBar}>
                  <View 
                    style={[
                      styles.efficiencyFill,
                      { 
                        width: `${team.efficiency}%`,
                        backgroundColor: getPerformanceColor(team.efficiency)
                      }
                    ]}
                  />
                </View>
                <Text style={styles.efficiencyLabel}>{team.efficiency}% Efficiency</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Citizen Feedback */}
        <View style={styles.feedbackSection}>
          <Text style={styles.sectionTitle}>Citizen Feedback Analysis</Text>
          
          <View style={styles.feedbackCard}>
            <View style={styles.feedbackHeader}>
              <View style={styles.ratingOverview}>
                <Text style={styles.averageRating}>{mockPerformanceData.citizenFeedback.averageRating}</Text>
                <View style={styles.stars}>
                  {[1,2,3,4,5].map(star => (
                    <Text key={star} style={[
                      styles.star,
                      star <= Math.round(mockPerformanceData.citizenFeedback.averageRating) 
                        ? styles.filledStar 
                        : styles.emptyStar
                    ]}>
                      ★
                    </Text>
                  ))}
                </View>
                <Text style={styles.totalRatings}>
                  {mockPerformanceData.citizenFeedback.totalRatings} ratings
                </Text>
              </View>
            </View>

            <View style={styles.ratingBreakdown}>
              {mockPerformanceData.citizenFeedback.breakdown.map((rating) => (
                <View key={rating.rating} style={styles.ratingRow}>
                  <Text style={styles.starLabel}>{rating.rating}★</Text>
                  <View style={styles.ratingBarContainer}>
                    <View 
                      style={[
                        styles.ratingBar,
                        { width: `${rating.percentage}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.ratingCount}>{rating.count}</Text>
                </View>
              ))}
            </View>

            <View style={styles.feedbackInsights}>
              <View style={styles.insightColumn}>
                <Text style={styles.insightTitle}>Top Complaints:</Text>
                {mockPerformanceData.citizenFeedback.topComplaints.map((complaint, index) => (
                  <Text key={index} style={styles.complaintText}>• {complaint}</Text>
                ))}
              </View>
              
              <View style={styles.insightColumn}>
                <Text style={styles.insightTitle}>Top Praise:</Text>
                {mockPerformanceData.citizenFeedback.topPraise.map((praise, index) => (
                  <Text key={index} style={styles.praiseText}>• {praise}</Text>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Action Items */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Recommended Actions</Text>
          
          <View style={styles.actionCard}>
            <Text style={styles.actionTitle}>🔧 Improve Electricity Department</Text>
            <Text style={styles.actionDescription}>
              Performance below target (72%). Address equipment shortages and response delays.
            </Text>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Create Action Plan</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.actionCard}>
            <Text style={styles.actionTitle}>⚡ Enhance Team Training</Text>
            <Text style={styles.actionDescription}>
              Focus on communication skills and technical efficiency to improve satisfaction ratings.
            </Text>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Schedule Training</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  webContainer: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    backgroundColor: '#6A1B9A',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  webHeader: {
    paddingTop: 20,
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
    padding: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activePeriod: {
    backgroundColor: '#6A1B9A',
  },
  periodText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activePeriodText: {
    color: '#FFFFFF',
  },
  scoreSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
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
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
  },
  scoreCircle: {
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  scoreMetrics: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  scoreMetric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0D1B2A',
  },
  metricLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  trendSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  trendChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  trendBar: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 80,
    width: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    justifyContent: 'flex-end',
  },
  performanceBar: {
    borderRadius: 10,
    width: '100%',
  },
  monthLabel: {
    fontSize: 10,
    color: '#0D1B2A',
    fontWeight: '500',
    marginTop: 4,
  },
  monthScore: {
    fontSize: 8,
    color: '#666',
  },
  departmentSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  deptCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  deptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  deptInfo: {
    flex: 1,
  },
  deptName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D1B2A',
  },
  deptTrend: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  performanceCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  performanceText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  deptMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  deptMetric: {
    alignItems: 'center',
  },
  deptMetricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D1B2A',
  },
  deptMetricLabel: {
    fontSize: 10,
    color: '#666',
  },
  issuesContainer: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  issuesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 4,
  },
  issueText: {
    fontSize: 11,
    color: '#E65100',
    marginBottom: 2,
  },
  teamSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  teamCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  teamLeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D1B2A',
  },
  teamTrend: {
    fontSize: 16,
  },
  teamCategory: {
    fontSize: 10,
    color: '#666',
    marginBottom: 8,
  },
  teamMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  teamMetric: {
    alignItems: 'center',
  },
  teamMetricValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  teamMetricLabel: {
    fontSize: 8,
    color: '#666',
  },
  efficiencyBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 4,
  },
  efficiencyFill: {
    height: '100%',
    borderRadius: 2,
  },
  efficiencyLabel: {
    fontSize: 8,
    color: '#666',
    textAlign: 'center',
  },
  feedbackSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  feedbackCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 16,
  },
  feedbackHeader: {
    marginBottom: 16,
  },
  ratingOverview: {
    alignItems: 'center',
  },
  averageRating: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2E7D32',
  },
  stars: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  star: {
    fontSize: 16,
  },
  filledStar: {
    color: '#FBC02D',
  },
  emptyStar: {
    color: '#E0E0E0',
  },
  totalRatings: {
    fontSize: 12,
    color: '#666',
  },
  ratingBreakdown: {
    marginBottom: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  starLabel: {
    fontSize: 12,
    color: '#666',
    width: 20,
  },
  ratingBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginHorizontal: 8,
  },
  ratingBar: {
    height: '100%',
    backgroundColor: '#FBC02D',
    borderRadius: 3,
  },
  ratingCount: {
    fontSize: 12,
    color: '#666',
    width: 25,
    textAlign: 'right',
  },
  feedbackInsights: {
    flexDirection: 'row',
    gap: 20,
  },
  insightColumn: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0D1B2A',
    marginBottom: 6,
  },
  complaintText: {
    fontSize: 11,
    color: '#D32F2F',
    marginBottom: 2,
  },
  praiseText: {
    fontSize: 11,
    color: '#388E3C',
    marginBottom: 2,
  },
  actionsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FBC02D',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F57F17',
    marginBottom: 6,
  },
  actionDescription: {
    fontSize: 12,
    color: '#F57F17',
    marginBottom: 10,
    lineHeight: 16,
  },
  actionButton: {
    backgroundColor: '#FBC02D',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});