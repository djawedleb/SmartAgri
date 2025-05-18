import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { getBaseUrl } from '../../config';

export default function AIRecommendations() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        setAnalysis(null);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera permission to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        setAnalysis(null);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first.');
      return;
    }

    setLoading(true);
    try {
      // Convert image to base64 if not already
      let base64Image = selectedImage;
      if (!base64Image.startsWith('data:image')) {
        const response = await fetch(base64Image);
        const blob = await response.blob();
        base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      // Send to backend Gemini endpoint
      const backendUrl = `${getBaseUrl()}/identify-crop-gemini`;
      const res = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      });
      const data = await res.json();

      if (data.result) {
        setAnalysis({
          health: data.result.diseases || 'Unknown',
          confidence: data.result.confidence || 0,
          recommendations: Array.isArray(data.result.recommendations)
            ? data.result.recommendations
            : [data.result.recommendations || 'No recommendations'],
          issues: data.result.diseases ? [data.result.diseases] : []
        });
      } else {
        Alert.alert('Error', 'No analysis result received.');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert('Error', 'Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderUploadSection = () => (
    <View style={styles.uploadSection}>
      <View style={styles.uploadArea}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
        ) : (
          <>
            <Icon name="camera-plus" size={40} color="#0d986a" />
            <Text style={styles.uploadText}>Upload or take a photo of your plant</Text>
          </>
        )}
      </View>

      <View style={styles.uploadButtons}>
        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
          <Icon name="image-plus" size={24} color="#0d986a" />
          <Text style={styles.uploadButtonText}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
          <Icon name="camera" size={24} color="#0d986a" />
          <Text style={styles.uploadButtonText}>Camera</Text>
        </TouchableOpacity>
      </View>

      {selectedImage && (
        <TouchableOpacity 
          style={[styles.analyzeButton, loading && styles.analyzeButtonDisabled]}
          onPress={analyzeImage}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="brain" size={24} color="#fff" />
              <Text style={styles.analyzeButtonText}>Analyze Plant</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  const renderAnalysisResult = () => {
    if (!analysis) return null;

    return (
      <View style={styles.analysisSection}>
        <View style={styles.analysisHeader}>
          <Text style={styles.analysisTitle}>Analysis Results</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Plant Name:</Text>
          <Text style={styles.sectionValue}>{analysis.plantName || 'Unknown'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Diseases / Health Issues:</Text>
          <Text style={styles.sectionValue}>{analysis.diseases || 'None detected'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Confidence Level:</Text>
          <Text style={styles.sectionValue}>{analysis.confidence || 'Unknown'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Care Recommendations:</Text>
          {Array.isArray(analysis.recommendations) && analysis.recommendations.length > 0 ? (
            analysis.recommendations.map((rec, idx) => (
              <Text key={idx} style={styles.sectionValue}>• {rec}</Text>
            ))
          ) : (
            <Text style={styles.sectionValue}>No recommendations</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Plant Analysis</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.historyButton}
            onPress={() => {
              // TODO: Implement history view
              Alert.alert('Coming Soon', 'History feature will be available soon!');
            }}
          >
            <Icon name="history" size={24} color="#0d986a" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.helpButton}>
            <Icon name="help-circle-outline" size={24} color="#0d986a" />
          </TouchableOpacity>
        </View>
      </View>

      {renderUploadSection()}
      {renderAnalysisResult()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#f1f9f5',
  },
  helpButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#f1f9f5',
  },
  uploadSection: {
    padding: 16,
  },
  uploadArea: {
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#0d986a',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  uploadText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  uploadButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f9f5',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  uploadButtonText: {
    marginLeft: 8,
    color: '#0d986a',
    fontSize: 16,
    fontWeight: '500',
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d986a',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  analyzeButtonDisabled: {
    opacity: 0.7,
  },
  analyzeButtonText: {
    marginLeft: 8,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  analysisSection: {
    padding: 16,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontWeight: 'bold',
    color: '#0d986a',
    marginBottom: 2,
  },
  sectionValue: {
    color: '#333',
    marginLeft: 8,
  },
}); 