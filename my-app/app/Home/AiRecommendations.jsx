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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock analysis result
      setAnalysis({
        health: 'Healthy',
        confidence: 95,
        recommendations: [
          'Maintain current watering schedule',
          'Ensure adequate sunlight exposure',
          'Monitor for any pest activity'
        ],
        issues: []
      });
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
          <View style={styles.healthBadge}>
            <Icon name="check-circle" size={16} color="#0d986a" />
            <Text style={styles.healthText}>{analysis.health}</Text>
          </View>
        </View>

        <View style={styles.confidenceContainer}>
          <Text style={styles.confidenceLabel}>Confidence Score</Text>
          <View style={styles.confidenceBar}>
            <View 
              style={[
                styles.confidenceFill, 
                { width: `${analysis.confidence}%` }
              ]} 
            />
          </View>
          <Text style={styles.confidenceValue}>{analysis.confidence}%</Text>
        </View>

        <View style={styles.recommendationsContainer}>
          <Text style={styles.recommendationsTitle}>Recommendations</Text>
          {analysis.recommendations.map((recommendation, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Icon name="check-circle" size={20} color="#0d986a" />
              <Text style={styles.recommendationText}>{recommendation}</Text>
            </View>
          ))}
        </View>

        {analysis.issues.length > 0 && (
          <View style={styles.issuesContainer}>
            <Text style={styles.issuesTitle}>Potential Issues</Text>
            {analysis.issues.map((issue, index) => (
              <View key={index} style={styles.issueItem}>
                <Icon name="alert-circle" size={20} color="#ff4444" />
                <Text style={styles.issueText}>{issue}</Text>
              </View>
            ))}
          </View>
        )}
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
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f9f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  healthText: {
    marginLeft: 4,
    color: '#0d986a',
    fontSize: 14,
    fontWeight: '500',
  },
  confidenceContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginBottom: 8,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#0d986a',
    borderRadius: 4,
  },
  confidenceValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    textAlign: 'right',
  },
  recommendationsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  issuesContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  issuesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  issueText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
}); 