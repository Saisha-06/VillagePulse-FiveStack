import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, Button, StyleSheet, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

interface Props {
  navigation: any;
  route: any;
}

export default function ReportFormPage({ navigation, route }: Props) {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImageAsync = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission needed', 'Permission to access photos is required!');
    return;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    quality: 0.7,
  });

  if (!result.canceled && result.assets && result.assets.length > 0) {
    setImageUri(result.assets[0].uri);
  }
};

  const getLocationAsync = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Permission to access location is required!');
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      Alert.alert('Validation', 'Please enter a description.');
      return;
    }
    if (!location) {
      Alert.alert('Validation', 'Please add your location.');
      return;
    }
    // TODO: Submit report data and imageUri to backend API
    Alert.alert('Report submitted', 'Thank you for your report!');
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Report an Issue</Text>

      <Text>Description:</Text>
      <TextInput
        style={styles.input}
        multiline
        placeholder="Describe the issue"
        value={description}
        onChangeText={setDescription}
      />

      <Text>Location:</Text>
      <Button title="Detect My Location" onPress={getLocationAsync} />
      {location ? (
        <Text style={{ marginVertical: 8 }}>
          Lat: {location.latitude.toFixed(5)}, Long: {location.longitude.toFixed(5)}
        </Text>
      ) : (
        <Text style={{ marginVertical: 8, fontStyle: 'italic' }}>No location detected</Text>
      )}

      <Text>Photo:</Text>
      <Button title="Select Photo" onPress={pickImageAsync} />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

      <Button title="Submit Report" onPress={handleSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    height: 100,
    padding: 10,
    marginBottom: 16,
  },
  image: {
    height: 200,
    marginVertical: 10,
    borderRadius: 6,
  },
});
