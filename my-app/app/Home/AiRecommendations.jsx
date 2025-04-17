import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as DocumentPicker from 'expo-document-picker';

export default function AiRecommendations() {
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Mock AI classification results (replace with actual API call)
  const mockClassifyImage = async (imageUri) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock classification results
    return {
      predictions: [
        { label: 'Leaf Spot Disease', confidence: 0.85 },
        { label: 'Powdery Mildew', confidence: 0.10 },
        { label: 'Healthy Leaf', confidence: 0.05 }
      ],
      solutions: [
        'Remove affected leaves to prevent spread',
        'Apply fungicide treatment every 7-10 days',
        'Improve air circulation around plants',
        'Water plants at the base to avoid wetting leaves'
      ]
    };
  };

  const handleFileSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      
      if (file.size > 5 * 1024 * 1024) { // 5MB in bytes
        alert('File size must be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
      setAnalyzing(false);
      setAnalysisResult(null);
    } catch (err) {
      console.error('Error picking file:', err);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }
    
    setAnalyzing(true);
    try {
      const result = await mockClassifyImage(selectedFile.uri);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Error analyzing image:', error);
      alert('Error analyzing image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const renderAnalysisResult = () => {
    if (!analysisResult) return null;

    const topPrediction = analysisResult.predictions[0];
    
    return (
      <View style={styles.resultContainer}>
        <View style={styles.predictionCard}>
          <Text style={styles.predictionTitle}>Diagnosis</Text>
          <Text style={styles.predictionLabel}>{topPrediction.label}</Text>
          <View style={styles.confidenceBar}>
            <View 
              style={[
                styles.confidenceFill, 
                { width: `${topPrediction.confidence * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.confidenceText}>
            Confidence: {(topPrediction.confidence * 100).toFixed(1)}%
          </Text>
        </View>

        <View style={styles.solutionsCard}>
          <Text style={styles.solutionsTitle}>Recommended Solutions</Text>
          {analysisResult.solutions.map((solution, index) => (
            <View key={index} style={styles.solutionItem}>
              <Icon name="check-circle" size={20} color="#0d986a" />
              <Text style={styles.solutionText}>{solution}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <View style={styles.uploadSection}>
          <Text style={styles.uploadText}>Please upload size less than 5MB</Text>
          <View style={styles.uploadArea}>
            <Icon name="image-outline" size={40} color="#666" />
            <Pressable style={styles.chooseButton} onPress={handleFileSelect}>
              <Text style={styles.chooseButtonText}>Choose File</Text>
            </Pressable>
            <Text style={styles.imageText}>
              {selectedFile ? selectedFile.name : '[image1]'}
            </Text>
          </View>
        </View>

        <Pressable 
          style={styles.analyzeButton}
          onPress={handleAnalyze}
        >
          <Text style={styles.analyzeButtonText}>suggest fixes</Text>
        </Pressable>

        <View style={styles.analyzerSection}>
          <View style={styles.analyzerHeader}>
            <Icon name="brain" size={24} color="#0d986a" />
            <Text style={styles.analyzerTitle}>AI Analyser</Text>
          </View>
          <View style={styles.analyzerContent}>
            {analyzing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0d986a" />
                <Text style={styles.waitingText}>Analyzing image...</Text>
              </View>
            ) : (
              renderAnalysisResult() || (
                <Text style={styles.waitingText}>
                  Upload an image and click suggest fixes to analyze
                </Text>
              )
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex:2,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 2,
  },
  container: {
    padding: 20,
  },
  uploadSection: {
    marginBottom: 20,
  },
  uploadText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    height: 200,
  },
  chooseButton: {
    backgroundColor: '#0d986a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  chooseButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  imageText: {
    color: '#666',
    marginTop: 10,
  },
  analyzeButton: {
    backgroundColor: '#0d986a',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  analyzerSection: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 20,
  },
  analyzerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  analyzerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  analyzerContent: {
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 5,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  waitingText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  resultContainer: {
    gap: 15,
  },
  predictionCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  predictionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  predictionLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0d986a',
    marginBottom: 10,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 5,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#0d986a',
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 14,
    color: '#666',
  },
  solutionsCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  solutionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  solutionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  solutionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
});