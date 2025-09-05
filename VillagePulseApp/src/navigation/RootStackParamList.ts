import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Departments: undefined;
  DepartmentDashboard: { departmentId: string; departmentName: string };
  ReportForm: { departmentId: string };
  ReportDetail: { reportId: string };
};
