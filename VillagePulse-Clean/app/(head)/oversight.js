// app/(head)/oversight.js
import { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Alert,
  TextInput,
  Modal 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

// Mock team data for village head oversight
const mockTeams = [
  {
    id: 'TEAM_WATER_001',
    category: 'Water & Sanitation',
    leader: 'Ramesh Kumar',
    members: ['Suresh Patel', 'Amit Singh', 'Raj Sharma'],
    performance: 88,
    activeAssignments: 5,
    completedThisMonth: 12,
    status: 'Active'
  },
  {
    id: 'TEAM_ROADS_002', 
    category: 'Roads & Infrastructure',
    leader: 'Priya Desai',
    members: ['Vikram Rao', 'Mohan Das'],
    performance: 92,
    activeAssignments: 3,
    completedThisMonth: 8,
    status: 'Active'
  },
  {
    id: 'TEAM_ELECT_003',
    category: 'Electricity',
    leader: 'Santosh Naik',
    members: ['Ravi Gowda', 'Deepak Shet', 'Ganesh Pai'],
    performance: 75,
    activeAssignments: 2,
    completedThisMonth: 6,
    status: 'Active'
  }
];

const mockOfficials = [
  {
    id: 'GOV_WATER_001',
    name: 'Rajesh Sharma',
    department: 'Water & Sanitation',
    performance: 85,
    reportsHandled: 34,
    avgResolutionTime: 2.5,
    status: 'Active'
  },
  {
    id: 'GOV_ROADS_002',
    name: 'Sunita Patel', 
    department: 'Roads & Infrastructure',
    performance: 90,
    reportsHandled: 28,
    avgResolutionTime: 3.2,
    status: 'Active'
  },
  {
    id: 'GOV_ELECT_003',
    name: 'Amit Naik',
    department: 'Electricity',
    performance: 82,
    reportsHandled: 19,
    avgResolutionTime: 1.8,
    status: 'Active'
  }
];

export default function TeamOversight() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState(mockTeams);
  const [officials, setOfficials] = useState(mockOfficials);
  const [selectedTab, setSelectedTab] = useState('teams');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeamData, setNewTeamData] = useState({
    category: '',
    leader: '',
    members: ''
  });

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

  const createNewTeam = () => {
    if (!newTeamData.category || !newTeamData.leader || !newTeamData.members) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const teamId = `TEAM_${newTeamData.category.toUpperCase().slice(0,4)}_${String(teams.length + 1).padStart(3, '0')}`;
    const password = `${newTeamData.category.toLowerCase()}team${String(teams.length + 1).padStart(2, '0')}`;
    
    const newTeam = {
      id: teamId,
      category: newTeamData.category,
      leader: newTeamData.leader,
      members: newTeamData.members.split(',').map(m => m.trim()),
      performance: 0,
      activeAssignments: 0,
      completedThisMonth: 0,
      status: 'Active'
    };

    setTeams([...teams, newTeam]);
    
    Alert.alert(
      'Team Created Successfully',
      `Team ID: ${teamId}\nPassword: ${password}\n\nProvide these credentials to the team leader.`,
      [{ text: 'OK' }]
    );

    setShowCreateModal(false);
    setNewTeamData({ category: '', leader: '', members: '' });
  };

  const suspendTeam = (teamId) => {
    Alert.alert(
      'Suspend Team',
      'Are you sure you want to suspend this team?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Suspend',
          style: 'destructive',
          onPress: () => {
            setTeams(teams.map(team => 
              team.id === teamId ? { ...team, status: 'Suspended' } : team
            ));
            Alert.alert('Success', 'Team has been suspended');
          }
        }
      ]
    );
  };

  const getPerformanceColor = (performance) => {
    if (performance >= 85) return '#388E3C';
    if (performance >= 70) return '#FBC02D'; 
    return '#D32F2F';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Team Management</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'teams' && styles.activeTab]}
          onPress={() => setSelectedTab('teams')}
        >
          <Text style={[styles.tabText, selectedTab === 'teams' && styles.activeTabText]}>
            Field Teams
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'officials' && styles.activeTab]}
          onPress={() => setSelectedTab('officials')}
        >
          <Text style={[styles.tabText, selectedTab === 'officials' && styles.activeTabText]}>
            Officials
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {selectedTab === 'teams' ? (
          <>
            {/* Create Team Button */}
            <View style={styles.actionHeader}>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={() => setShowCreateModal(true)}
              >
                <Text style={styles.createButtonText}>+ Create New Team</Text>
              </TouchableOpacity>
            </View>

            {/* Teams List */}
            {teams.map((team) => (
              <View key={team.id} style={styles.teamCard}>
                <View style={styles.teamHeader}>
                  <View>
                    <Text style={styles.teamCategory}>{team.category}</Text>
                    <Text style={styles.teamId}>Team ID: {team.id}</Text>
                    <Text style={styles.teamLeader}>Leader: {team.leader}</Text>
                  </View>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: team.status === 'Active' ? '#388E3C' : '#D32F2F' 
                  }]}>
                    <Text style={styles.statusText}>{team.status}</Text>
                  </View>
                </View>

                <View style={styles.teamMetrics}>
                  <View style={styles.metric}>
                    <Text style={[styles.metricValue, { color: getPerformanceColor(team.performance) }]}>
                      {team.performance}%
                    </Text>
                    <Text style={styles.metricLabel}>Performance</Text>
                  </View>
                  <View style={styles.metric}>
                    <Text style={styles.metricValue}>{team.activeAssignments}</Text>
                    <Text style={styles.metricLabel}>Active Tasks</Text>
                  </View>
                  <View style={styles.metric}>
                    <Text style={styles.metricValue}>{team.completedThisMonth}</Text>
                    <Text style={styles.metricLabel}>Completed</Text>
                  </View>
                </View>

                <View style={styles.teamMembers}>
                  <Text style={styles.membersTitle}>Team Members:</Text>
                  <Text style={styles.membersList}>
                    {team.members.join(', ')}
                  </Text>
                </View>

                <View style={styles.teamActions}>
                  <TouchableOpacity style={styles.viewButton}>
                    <Text style={styles.actionButtonText}>View Details</Text>
                  </TouchableOpacity>
                  {team.status === 'Active' && (
                    <TouchableOpacity 
                      style={styles.suspendButton}
                      onPress={() => suspendTeam(team.id)}
                    >
                      <Text style={styles.actionButtonText}>Suspend</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </>
        ) : (
          /* Officials List */
          <>
            {officials.map((official) => (
              <View key={official.id} style={styles.officialCard}>
                <View style={styles.officialHeader}>
                  <View>
                    <Text style={styles.officialName}>{official.name}</Text>
                    <Text style={styles.officialDept}>{official.department}</Text>
                    <Text style={styles.officialId}>ID: {official.id}</Text>
                  </View>
                  <View style={[styles.performanceCircle, { 
                    backgroundColor: getPerformanceColor(official.performance) 
                  }]}>
                    <Text style={styles.performanceText}>{official.performance}%</Text>
                  </View>
                </View>

                <View style={styles.officialMetrics}>
                  <View style={styles.metric}>
                    <Text style={styles.metricValue}>{official.reportsHandled}</Text>
                    <Text style={styles.metricLabel}>Reports Handled</Text>
                  </View>
                  <View style={styles.metric}>
                    <Text style={styles.metricValue}>{official.avgResolutionTime} days</Text>
                    <Text style={styles.metricLabel}>Avg Resolution</Text>
                  </View>
                </View>

                <View style={styles.officialActions}>
                  <TouchableOpacity style={styles.viewButton}>
                    <Text style={styles.actionButtonText}>View Performance</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.contactButton}>
                    <Text style={styles.actionButtonText}>Contact</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Create Team Modal */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Team</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Team Category (e.g., Water & Sanitation)"
              value={newTeamData.category}
              onChangeText={(text) => setNewTeamData({...newTeamData, category: text})}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Team Leader Name"
              value={newTeamData.leader}
              onChangeText={(text) => setNewTeamData({...newTeamData, leader: text})}
            />
            
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="Team Members (comma separated)"
              value={newTeamData.members}
              onChangeText={(text) => setNewTeamData({...newTeamData, members: text})}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={createNewTeam}
              >
                <Text style={styles.saveButtonText}>Create Team</Text>
              </TouchableOpacity>
            </View>
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
  header: {
    backgroundColor: '#6A1B9A',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#6A1B9A',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#6A1B9A',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  actionHeader: {
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#6A1B9A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  teamCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  teamCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D1B2A',
  },
  teamId: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  teamLeader: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  teamMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0D1B2A',
  },
  metricLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  teamMembers: {
    marginBottom: 12,
  },
  membersTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0D1B2A',
    marginBottom: 4,
  },
  membersList: {
    fontSize: 12,
    color: '#666',
  },
  teamActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#1976D2',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  suspendButton: {
    flex: 1,
    backgroundColor: '#D32F2F',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#388E3C',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  officialCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  officialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  officialName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D1B2A',
  },
  officialDept: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  officialId: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  performanceCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  performanceText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  officialMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  officialActions: {
    flexDirection: 'row',
    gap: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0D1B2A',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#6A1B9A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});