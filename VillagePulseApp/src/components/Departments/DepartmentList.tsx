import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import departments from '../../constants/departments';

export default function DepartmentList({ navigation }) {
  const handleSelect = (dept) => {
    navigation.navigate('DepartmentDashboard', { departmentId: dept.id, departmentName: dept.name });
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 28, marginBottom: 20 }}>Select Department</Text>
      <FlatList
        data={departments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => handleSelect(item)}>
            <Text style={styles.itemText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
  },
  itemText: {
    color: 'white',
    fontSize: 18,
  },
});
