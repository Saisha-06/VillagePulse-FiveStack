// app/(resident)/report.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image // Import for Image component
} from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { db, storage } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import Ionicons from '@expo/vector-icons/Ionicons';

const categories = [
  { label: 'Select Category', value: '' },
  { label: 'Roads & Infrastructure', value: 'Roads & Infrastructure' },
  { label: 'Water Supply', value: 'Water Supply' },
  { label: 'Electricity', value: 'Electricity' },
  { label: 'Sanitation & Waste', value: 'Sanitation & Waste' },
  { label: 'Public Safety', value: 'Public Safety' },
  { label: 'Environmental', value: 'Environmental' },
  { label: 'Other', value: 'Other' }
];

const priorityLevels = [
  { label: 'Select Priority', value: '' },
  { label: 'Low', value: 'Low' },
  { label: 'Medium', value: 'Medium' },
  { label: 'High', value: 'High' },
  { label: 'Emergency', value: 'Emergency' }
];

export default function ReportIssue() {
  const { user } = useAuth();
  const [reportData, setReportData] = useState({
    title: '',
    category: '',
    priority: '',
    description: '',
    location: '',
    contactInfo: user?.phone || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const router = useRouter();

  const updateReportData = (key, value) => {
    setReportData(prev => ({ ...prev, [key]: value }));
  };

  const pickImage = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // <-- fix here
      allowsMultipleSelection: true,
      quality: 0.5,
    });

    if (!result.canceled && result.assets) {
      setImages(prevImages => [...prevImages, ...result.assets.map(asset => asset.uri)]);
    }
  } catch (error) {
    console.error("Image Picker Error:", error);
    Alert.alert("Error", "Failed to open image picker. Please try again.");
  }
};

  const removeImage = (imageUri) => {
    setImages(prevImages => prevImages.filter(uri => uri !== imageUri));
  };

  const uploadImages = async (imageUris) => {
    const uploadedUrls = [];
    for (const uri of imageUris) {
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function () {
          reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", uri, true);
        xhr.send(null);
      });

      const filename = `reports/${user.uid}-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const imageRef = ref(storage, filename);
      await uploadBytes(imageRef, blob);
      blob.close();
      const url = await getDownloadURL(imageRef);
      uploadedUrls.push(url);
    }
    return uploadedUrls;
  };

  const handleSubmit = async () => {
    const { title, category, priority, description, location } = reportData;
    
    if (!title || !category || !priority || !description || !location) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const uploadedImageUrls = await uploadImages(images);

      await addDoc(collection(db, 'reports'), {
        ...reportData,
        submittedBy: user.uid,
        citizenName: user.name,
        status: 'Pending',
        createdAt: new Date(),
        photoURLs: uploadedImageUrls,
      });
      
      Alert.alert(
        'Report Submitted!',
        'Your report has been submitted successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(resident)/home')
          }
        ]
      );
      
      setReportData({
        title: '',
        category: '',
        priority: '',
        description: '',
        location: '',
        contactInfo: user?.phone || '',
      });
      setImages([]);
    } catch (error) {
      console.error("Failed to submit report:", error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Emergency': return '#D32F2F';
      case 'High': return '#FF5722';
      case 'Medium': return '#FBC02D';
      case 'Low': return '#388E3C';
      default: return '#4F5D75';
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Report an Issue</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Issue Title */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Issue Title <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Brief description of the issue"
              value={reportData.title}
              onChangeText={(value) => updateReportData('title', value)}
              maxLength={100}
            />
          </View>

          {/* Category */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Category <Text style={styles.required}>*</Text></Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={reportData.category}
                onValueChange={(value) => updateReportData('category', value)}
                style={styles.picker}
              >
                {categories.map((category) => (
                  <Picker.Item 
                    key={category.value} 
                    label={category.label} 
                    value={category.value} 
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Priority */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Priority Level <Text style={styles.required}>*</Text></Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={reportData.priority}
                onValueChange={(value) => updateReportData('priority', value)}
                style={styles.picker}
              >
                {priorityLevels.map((priority) => (
                  <Picker.Item 
                    key={priority.value} 
                    label={priority.label} 
                    value={priority.value} 
                  />
                ))}
              </Picker>
            </View>
            {reportData.priority && (
              <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(reportData.priority) }]}>
                <Text style={styles.priorityText}>
                  {priorityLevels.find(p => p.value === reportData.priority)?.label}
                </Text>
              </View>
            )}
          </View>

          {/* Location */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Location <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Street, area, or landmark"
              value={reportData.location}
              onChangeText={(value) => updateReportData('location', value)}
            />
            <TouchableOpacity style={styles.locationButton}>
              <Text style={styles.locationButtonText}>📍 Use Current Location</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Detailed Description <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Please provide detailed information about the issue, when it started, and any other relevant details..."
              value={reportData.description}
              onChangeText={(value) => updateReportData('description', value)}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          {/* Contact Info */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contact Information (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Phone number for updates (optional)"
              value={reportData.contactInfo}
              onChangeText={(value) => updateReportData('contactInfo', value)}
              keyboardType="phone-pad"
            />
          </View>

          {/* Photo Upload */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Photos (Optional)</Text>
            <TouchableOpacity style={styles.photoUpload} onPress={pickImage}>
              <Text style={styles.photoUploadText}>📸 Add Photos</Text>
              <Text style={styles.photoUploadSubtext}>Help us understand the issue better</Text>
            </TouchableOpacity>
            {images.length > 0 && (
              <View style={styles.imagePreviewContainer}>
                {images.map((imageUri, index) => (
                  <View key={index} style={styles.imagePreviewWrapper}>
                    <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => removeImage(imageUri)}
                    >
                      <Ionicons name="close-circle" size={24} color="#D32F2F" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : 'Submit Report'}
            </Text>
          </TouchableOpacity>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>What happens next?</Text>
            <Text style={styles.infoText}>
              • Your report will be reviewed by the relevant department{'\n'}
              • You can track its progress on your report history page{'\n'}
              • Updates will be sent as work progresses
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FFF9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#2E7D32',
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
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D1B2A',
    marginBottom: 8,
  },
  required: {
    color: '#D32F2F',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#0D1B2A',
  },
  textArea: {
    height: 120,
    paddingTop: 16,
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
  },
  picker: {
    height: 50,
  },
  priorityIndicator: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  locationButton: {
    marginTop: 8,
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  locationButtonText: {
    color: '#2E7D32',
    fontWeight: '500',
  },
  photoUpload: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  photoUploadText: {
    fontSize: 16,
    color: '#4F5D75',
    fontWeight: '500',
  },
  photoUploadSubtext: {
    fontSize: 12,
    color: '#4F5D75',
    marginTop: 4,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
  },
  imagePreviewWrapper: {
    position: 'relative',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  submitButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginVertical: 20,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#0D47A1',
    lineHeight: 18,
  },
});