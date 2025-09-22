// app/(head)/resources.js
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

// Mock budget data for village head resource management
const mockBudgetData = {
  totalBudget: 1500000, // 15 Lakhs
  allocated: 1200000,   // 12 Lakhs  
  utilized: 850000,     // 8.5 Lakhs
  remaining: 650000,    // 6.5 Lakhs
  currentYear: '2024-25',
  departments: [
    {
      id: 'water',
      name: 'Water & Sanitation',
      allocated: 450000,
      utilized: 320000,
      pending: 25000,
      priority: 'High',
      projects: [
        { name: 'Bore well maintenance', budget: 80000, status: 'Completed' },
        { name: 'Pipeline repairs', budget: 120000, status: 'In Progress' },
        { name: 'Water tank cleaning', budget: 45000, status: 'Pending' }
      ]
    },
    {
      id: 'roads',
      name: 'Roads & Infrastructure', 
      allocated: 350000,
      utilized: 245000,
      pending: 35000,
      priority: 'High',
      projects: [
        { name: 'Main road resurfacing', budget: 180000, status: 'In Progress' },
        { name: 'Pothole repairs', budget: 65000, status: 'Completed' },
        { name: 'Street signage', budget: 25000, status: 'Pending' }
      ]
    },
    {
      id: 'electricity',
      name: 'Electricity',
      allocated: 200000,
      utilized: 140000,
      pending: 15000,
      priority: 'Medium',
      projects: [
        { name: 'Street light installation', budget: 95000, status: 'Completed' },
        { name: 'Electrical maintenance', budget: 45000, status: 'In Progress' }
      ]
    },
    {
      id: 'waste',
      name: 'Waste Management',
      allocated: 200000,
      utilized: 145000,
      pending: 20000,
      priority: 'Medium',
      projects: [
        { name: 'Garbage collection vehicles', budget: 120000, status: 'Completed' },
        { name: 'Waste segregation bins', budget: 25000, status: 'In Progress' }
      ]
    }
  ],
  emergencyFund: {
    total: 150000,
    used: 45000,
    available: 105000
  }
};

export default function ResourceAllocation() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [budgetData, setBudgetData] = useState(mockBudgetData);
  const [selectedDept, setSelectedDept] = useState(null);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [allocationData, setAllocationData] = useState({
    department: '',
    amount: '',
    purpose: '',
    priority: 'Medium'
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

  const allocateBudget = () => {
    if (!allocationData.department || !allocationData.amount || !allocationData.purpose) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const amount = parseInt(allocationData.amount);
    if (amount > budgetData.remaining) {
      Alert.alert('Error', 'Insufficient budget remaining');
      return;
    }

    // Update department allocation
    const updatedDepartments = budgetData.departments.map(dept => 
      dept.id === allocationData.department 
        ? { 
            ...dept, 
            allocated: dept.allocated + amount,
            projects: [...dept.projects, {
              name: allocationData.purpose,
              budget: amount,
              status: 'Pending'
            }]
          }
        : dept
    );

    setBudgetData({
      ...budgetData,
      allocated: budgetData.allocated + amount,
      remaining: budgetData.remaining - amount,
      departments: updatedDepartments
    });

    Alert.alert('Success', `₹${amount.toLocaleString()} allocated to ${allocationData.purpose}`);
    setShowAllocationModal(false);
    setAllocationData({ department: '', amount: '', purpose: '', priority: 'Medium' });
  };

  const approveEmergencyFund = (amount) => {
    Alert.alert(
      'Emergency Fund Approval',
      `Approve ₹${amount.toLocaleString()} from emergency fund?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => {
            if (amount > budgetData.emergencyFund.available) {
              Alert.alert('Error', 'Insufficient emergency fund');
              return;
            }
            
            setBudgetData({
              ...budgetData,
              emergencyFund: {
                ...budgetData.emergencyFund,
                used: budgetData.emergencyFund.used + amount,
                available: budgetData.emergencyFund.available - amount
              }
            });
            
            Alert.alert('Approved', 'Emergency fund has been allocated');
          }
        }
      ]
    );
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
      case 'In Progress': return '#FBC02D';
      case 'Pending': return '#D32F2F';
      default: return '#4F5D75';
    }
  };

  const utilizationRate = Math.round((budgetData.utilized / budgetData.allocated) * 100);

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
        <Text style={styles.title}>Budget & Resources</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Budget Overview */}
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>Budget Overview ({budgetData.currentYear})</Text>
          
          <View style={styles.budgetGrid}>
            <View style={[styles.budgetCard, { backgroundColor: '#E3F2FD' }]}>
              <Text style={styles.budgetAmount}>₹{(budgetData.totalBudget/100000).toFixed(1)}L</Text>
              <Text style={styles.budgetLabel}>Total Budget</Text>
            </View>
            
            <View style={[styles.budgetCard, { backgroundColor: '#FFF8E1' }]}>
              <Text style={styles.budgetAmount}>₹{(budgetData.allocated/100000).toFixed(1)}L</Text>
              <Text style={styles.budgetLabel}>Allocated</Text>
            </View>
            
            <View style={[styles.budgetCard, { backgroundColor: '#E8F5E8' }]}>
              <Text style={styles.budgetAmount}>₹{(budgetData.utilized/100000).toFixed(1)}L</Text>
              <Text style={styles.budgetLabel}>Utilized</Text>
            </View>
            
            <View style={[styles.budgetCard, { backgroundColor: '#FCE4EC' }]}>
              <Text style={styles.budgetAmount}>₹{(budgetData.remaining/100000).toFixed(1)}L</Text>
              <Text style={styles.budgetLabel}>Remaining</Text>
            </View>
          </View>

          <View style={styles.utilizationBar}>
            <Text style={styles.utilizationLabel}>Budget Utilization: {utilizationRate}%</Text>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar,
                  { width: `${utilizationRate}%` }
                ]}
              />
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={styles.allocateButton}
            onPress={() => setShowAllocationModal(true)}
          >
            <Text style={styles.allocateButtonText}>+ Allocate Budget</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.emergencyButton}
            onPress={() => approveEmergencyFund(25000)}
          >
            <Text style={styles.emergencyButtonText}>🚨 Emergency Fund</Text>
          </TouchableOpacity>
        </View>

        {/* Department Budgets */}
        <View style={styles.departmentsSection}>
          <Text style={styles.sectionTitle}>Department Budgets</Text>
          
          {budgetData.departments.map((dept) => {
            const deptUtilization = Math.round((dept.utilized / dept.allocated) * 100);
            
            return (
              <View key={dept.id} style={styles.deptBudgetCard}>
                <View style={styles.deptHeader}>
                  <View style={styles.deptInfo}>
                    <Text style={styles.deptName}>{dept.name}</Text>
                    <View style={styles.deptMeta}>
                      <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(dept.priority) }]}>
                        <Text style={styles.priorityText}>{dept.priority}</Text>
                      </View>
                      <Text style={styles.utilizationText}>{deptUtilization}% utilized</Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.expandButton}
                    onPress={() => setSelectedDept(selectedDept === dept.id ? null : dept.id)}
                  >
                    <Text style={styles.expandText}>
                      {selectedDept === dept.id ? '−' : '+'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.deptBudgetNumbers}>
                  <View style={styles.budgetNumber}>
                    <Text style={styles.numberValue}>₹{(dept.allocated/100000).toFixed(1)}L</Text>
                    <Text style={styles.numberLabel}>Allocated</Text>
                  </View>
                  <View style={styles.budgetNumber}>
                    <Text style={styles.numberValue}>₹{(dept.utilized/100000).toFixed(1)}L</Text>
                    <Text style={styles.numberLabel}>Utilized</Text>
                  </View>
                  <View style={styles.budgetNumber}>
                    <Text style={styles.numberValue}>₹{(dept.pending/1000).toFixed(0)}K</Text>
                    <Text style={styles.numberLabel}>Pending</Text>
                  </View>
                </View>

                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar,
                      { 
                        width: `${deptUtilization}%`,
                        backgroundColor: deptUtilization > 80 ? '#D32F2F' : deptUtilization > 60 ? '#FBC02D' : '#388E3C'
                      }
                    ]}
                  />
                </View>

                {/* Expanded Project Details */}
                {selectedDept === dept.id && (
                  <View style={styles.projectsSection}>
                    <Text style={styles.projectsTitle}>Projects:</Text>
                    {dept.projects.map((project, index) => (
                      <View key={index} style={styles.projectItem}>
                        <View style={styles.projectInfo}>
                          <Text style={styles.projectName}>{project.name}</Text>
                          <Text style={styles.projectBudget}>₹{project.budget.toLocaleString()}</Text>
                        </View>
                        <View style={[styles.projectStatus, { backgroundColor: getStatusColor(project.status) }]}>
                          <Text style={styles.projectStatusText}>{project.status}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Emergency Fund */}
        <View style={styles.emergencySection}>
          <Text style={styles.sectionTitle}>Emergency Fund</Text>
          
          <View style={styles.emergencyCard}>
            <View style={styles.emergencyNumbers}>
              <View style={styles.emergencyNumber}>
                <Text style={styles.emergencyValue}>₹{(budgetData.emergencyFund.total/100000).toFixed(1)}L</Text>
                <Text style={styles.emergencyLabel}>Total Fund</Text>
              </View>
              <View style={styles.emergencyNumber}>
                <Text style={styles.emergencyValue}>₹{(budgetData.emergencyFund.used/100000).toFixed(1)}L</Text>
                <Text style={styles.emergencyLabel}>Used</Text>
              </View>
              <View style={styles.emergencyNumber}>
                <Text style={styles.emergencyValue}>₹{(budgetData.emergencyFund.available/100000).toFixed(1)}L</Text>
                <Text style={styles.emergencyLabel}>Available</Text>
              </View>
            </View>
            
            <View style={styles.emergencyActions}>
              <TouchableOpacity 
                style={styles.emergencyActionButton}
                onPress={() => approveEmergencyFund(50000)}
              >
                <Text style={styles.emergencyActionText}>Approve ₹50K</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.emergencyActionButton}
                onPress={() => approveEmergencyFund(100000)}
              >
                <Text style={styles.emergencyActionText}>Approve ₹1L</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Budget Allocation Modal */}
      <Modal
        visible={showAllocationModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Allocate Budget</Text>
            
            <Text style={styles.inputLabel}>Department</Text>
            <View style={styles.pickerContainer}>
              {budgetData.departments.map((dept) => (
                <TouchableOpacity
                  key={dept.id}
                  style={[
                    styles.deptOption,
                    allocationData.department === dept.id && styles.selectedDeptOption
                  ]}
                  onPress={() => setAllocationData({...allocationData, department: dept.id})}
                >
                  <Text style={[
                    styles.deptOptionText,
                    allocationData.department === dept.id && styles.selectedDeptOptionText
                  ]}>
                    {dept.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.inputLabel}>Amount (₹)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter amount"
              value={allocationData.amount}
              onChangeText={(text) => setAllocationData({...allocationData, amount: text})}
              keyboardType="numeric"
            />
            
            <Text style={styles.inputLabel}>Purpose</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="Purpose of allocation"
              value={allocationData.purpose}
              onChangeText={(text) => setAllocationData({...allocationData, purpose: text})}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowAllocationModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={allocateBudget}
              >
                <Text style={styles.saveButtonText}>Allocate</Text>
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
  content: {
    flex: 1,
    padding: 20,
  },
  overviewSection: {
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
  budgetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  budgetCard: {
    flex: 1,
    minWidth: 100,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  budgetAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0D1B2A',
  },
  budgetLabel: {
    fontSize: 10,
    color: '#4F5D75',
    marginTop: 4,
  },
  utilizationBar: {
    marginTop: 10,
  },
  utilizationLabel: {
    fontSize: 12,
    color: '#4F5D75',
    marginBottom: 6,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6A1B9A',
    borderRadius: 4,
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  allocateButton: {
    flex: 1,
    backgroundColor: '#6A1B9A',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  allocateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emergencyButton: {
    flex: 1,
    backgroundColor: '#D32F2F',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  emergencyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  departmentsSection: {
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
  deptBudgetCard: {
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
    marginBottom: 4,
  },
  deptMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  utilizationText: {
    fontSize: 10,
    color: '#4F5D75',
  },
  expandButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4F5D75',
  },
  deptBudgetNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  budgetNumber: {
    alignItems: 'center',
  },
  numberValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D1B2A',
  },
  numberLabel: {
    fontSize: 10,
    color: '#4F5D75',
    marginTop: 2,
  },
  projectsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  projectsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0D1B2A',
    marginBottom: 8,
  },
  projectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 12,
    color: '#0D1B2A',
  },
  projectBudget: {
    fontSize: 10,
    color: '#4F5D75',
  },
  projectStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  projectStatusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  emergencySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emergencyCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 16,
  },
  emergencyNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  emergencyNumber: {
    alignItems: 'center',
  },
  emergencyValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D32F2F',
  },
  emergencyLabel: {
    fontSize: 10,
    color: '#B71C1C',
    marginTop: 2,
  },
  emergencyActions: {
    flexDirection: 'row',
    gap: 8,
  },
  emergencyActionButton: {
    flex: 1,
    backgroundColor: '#D32F2F',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  emergencyActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
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
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0D1B2A',
    marginBottom: 6,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  deptOption: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    marginBottom: 4,
  },
  selectedDeptOption: {
    backgroundColor: '#6A1B9A',
    borderColor: '#6A1B9A',
  },
  deptOptionText: {
    fontSize: 12,
    color: '#4F5D75',
  },
  selectedDeptOptionText: {
    color: '#FFFFFF',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
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