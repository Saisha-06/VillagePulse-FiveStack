import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DepartmentList from '../components/Departments/DepartmentList';
import DepartmentDashboard from '../components/Departments/DepartmentDashboard';
import ReportFormPage from '../pages/ReportFormPage';
import ReportDetailPage from '../pages/ReportDetailPage';

import type { RootStackParamList } from './RootStackParamList';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Departments">
      <Stack.Screen name="Departments" component={DepartmentList} />
      <Stack.Screen
        name="DepartmentDashboard"
        component={DepartmentDashboard}
        options={({ route }) => ({
          title: route.params?.departmentName ?? 'Department',
        })}
      />
      <Stack.Screen name="ReportForm" component={ReportFormPage} options={{ title: 'New Report' }} />
      <Stack.Screen name="ReportDetail" component={ReportDetailPage} options={{ title: 'Report Details' }} />
    </Stack.Navigator>
  );
}
