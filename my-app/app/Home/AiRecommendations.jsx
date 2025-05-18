import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { getBaseUrl } from '../../config';

export default function AIRecommendations() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`${getBaseUrl()}/getAnalysisHistory`);
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('Error fetching history:', error);
      Alert.alert('Error', 'Failed to load analysis history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const saveAnalysis = async (analysisData) => {
    try {
      // Convert diseases to array if it's a string
      let diseases = analysisData.diseases;
      if (typeof diseases === 'string') {
        diseases = diseases === 'None detected' ? [] : [diseases];
      } else if (!Array.isArray(diseases)) {
        diseases = [];
      }

      const response = await fetch(`${getBaseUrl()}/saveAnalysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: selectedImage,
          plantName: analysisData.plantName,
          diseases: diseases,
          confidence: parseFloat(analysisData.confidence),
          recommendations: analysisData.recommendations
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save analysis');
      }
    } catch (error) {
      console.error('Error saving analysis:', error);
      Alert.alert('Error', 'Failed to save analysis result');
    }
  };

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
        const result = data.result;
        
        // Process diseases
        let diseases = [];
        if (result.diseases) {
          if (Array.isArray(result.diseases)) {
            diseases = result.diseases;
          } else if (typeof result.diseases === 'string') {
            diseases = result.diseases === 'None detected' ? [] : [result.diseases];
          }
        }
        
        // Process recommendations
        let recommendations = [];
        if (result.recommendations) {
          if (Array.isArray(result.recommendations)) {
            recommendations = result.recommendations.map(item => 
              typeof item === 'string' ? item.trim() : String(item).trim()
            ).filter(item => item.length > 0);
          } else if (typeof result.recommendations === 'string') {
            recommendations = result.recommendations
              .split(/[;\n]/)
              .map(item => item.trim())
              .filter(item => item.length > 0);
          }
        }
        
        const analysisData = {
          plantName: result.plantName || 'Unknown',
          diseases: diseases,
          confidence: typeof result.confidence === 'number' 
            ? result.confidence.toFixed(2) 
            : (result.confidence || 'Unknown'),
          recommendations: recommendations
        };

        setAnalysis(analysisData);
        await saveAnalysis(analysisData);
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

  const toggleExpand = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const deleteAnalysis = async (id) => {
    try {
      const response = await fetch(`${getBaseUrl()}/deleteAnalysis/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete analysis');
      }

      // Refresh history after deletion
      fetchHistory();
    } catch (error) {
      console.error('Error deleting analysis:', error);
      Alert.alert('Error', 'Failed to delete analysis');
    }
  };

  const clearAllHistory = async () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all analysis history? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${getBaseUrl()}/clearAnalysisHistory`, {
                method: 'DELETE',
              });

              if (!response.ok) {
                throw new Error('Failed to clear history');
              }

              // Refresh history after clearing
              fetchHistory();
            } catch (error) {
              console.error('Error clearing history:', error);
              Alert.alert('Error', 'Failed to clear history');
            }
          },
        },
      ],
    );
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
          <Text style={styles.sectionValue}>{analysis.plantName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Diseases / Health Issues:</Text>
          <Text style={styles.sectionValue}>{analysis.diseases.join(', ')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Confidence Level:</Text>
          <Text style={styles.sectionValue}>
            {typeof analysis.confidence === 'number' || !isNaN(parseFloat(analysis.confidence)) 
              ? `${(parseFloat(analysis.confidence) * 100).toFixed()}%` 
              : analysis.confidence}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Care Recommendations:</Text>
          {analysis.recommendations && analysis.recommendations.length > 0 ? (
            <View style={styles.recommendationsList}>
              {analysis.recommendations.map((rec, idx) => (
                <View key={idx} style={styles.recommendationRow}>
                  <Text style={styles.recommendationBullet}>•</Text>
                  <Text style={styles.recommendationText}>{rec}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.sectionValue}>No recommendations available</Text>
          )}
        </View>
      </View>
    );
  };

  const renderHistoryView = () => (
    <View style={styles.historyContainer}>
      <View style={styles.historyHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setShowHistory(false)}
        >
          <Icon name="arrow-left" size={24} color="#0d986a" />
        </TouchableOpacity>
        <Text style={styles.historyTitle}>Analysis History</Text>
        {history.length > 0 && (
          <TouchableOpacity 
            style={styles.clearAllButton}
            onPress={clearAllHistory}
          >
            <Icon name="delete-sweep" size={24} color="#ff4444" />
          </TouchableOpacity>
        )}
      </View>

      {loadingHistory ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0d986a" />
        </View>
      ) : history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="history" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No analysis history yet</Text>
        </View>
      ) : (
        <ScrollView style={styles.historyList}>
          {history.map((item, index) => (
            <View key={index} style={styles.historyCard}>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => {
                  Alert.alert(
                    'Delete Analysis',
                    'Are you sure you want to delete this analysis?',
                    [
                      {
                        text: 'Cancel',
                        style: 'cancel',
                      },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => deleteAnalysis(item._id),
                      },
                    ],
                  );
                }}
              >
                <Icon name="delete" size={20} color="#ff4444" />
              </TouchableOpacity>
              <Image 
                source={{ uri: item.imageUrl }} 
                style={styles.historyImage}
              />
              <View style={styles.historyContent}>
                <Text style={styles.historyPlantName}>{item.plantName}</Text>
                <Text style={styles.historyDate}>
                  {new Date(item.timestamp).toLocaleDateString()}
                </Text>
                <View style={styles.historyStatus}>
                  <Icon 
                    name={item.diseases.length === 0 ? 'check-circle' : 'alert-circle'} 
                    size={16} 
                    color={item.diseases.length === 0 ? '#0d986a' : '#ff4444'} 
                  />
                  <Text style={[
                    styles.historyStatusText,
                    { color: item.diseases.length === 0 ? '#0d986a' : '#ff4444' }
                  ]}>
                    {item.diseases.length === 0 ? 'Healthy' : 'Issues Detected'}
                  </Text>
                </View>

                {item.diseases.length > 0 && (
                  <View style={styles.diseasesContainer}>
                    <Text style={styles.diseasesTitle}>Detected Issues</Text>
                    <Text 
                      style={styles.diseasesText}
                      numberOfLines={expandedItems[`diseases-${index}`] ? undefined : 2}
                    >
                      {item.diseases.join(', ')}
                    </Text>
                    {item.diseases.length > 2 && (
                      <TouchableOpacity 
                        style={styles.showMoreButton}
                        onPress={() => toggleExpand(`diseases-${index}`)}
                      >
                        <Text style={styles.showMoreText}>
                          {expandedItems[`diseases-${index}`] ? 'Show Less' : 'Show More'}
                        </Text>
                        <Icon 
                          name={expandedItems[`diseases-${index}`] ? 'chevron-up' : 'chevron-down'} 
                          size={16} 
                          color="#0d986a" 
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                <View style={styles.confidenceContainer}>
                  <Text style={styles.confidenceLabel}>Confidence</Text>
                  <View style={styles.confidenceBar}>
                    <View 
                      style={[
                        styles.confidenceFill, 
                        { width: `${item.confidence * 100}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.confidenceValue}>
                    {(item.confidence * 100).toFixed()}%
                  </Text>
                </View>

                <View style={styles.recommendationsContainer}>
                  <Text style={styles.recommendationsTitle}>Recommendations</Text>
                  <View style={styles.recommendationsList}>
                    {item.recommendations.slice(0, expandedItems[`recs-${index}`] ? undefined : 2).map((rec, idx) => (
                      <View key={idx} style={styles.recommendationItem}>
                        <Icon name="check-circle" size={16} color="#0d986a" />
                        <Text style={styles.recommendationText}>{rec}</Text>
                      </View>
                    ))}
                  </View>
                  {item.recommendations.length > 2 && (
                    <TouchableOpacity 
                      style={styles.showMoreButton}
                      onPress={() => toggleExpand(`recs-${index}`)}
                    >
                      <Text style={styles.showMoreText}>
                        {expandedItems[`recs-${index}`] ? 'Show Less' : 'Show More'}
                      </Text>
                      <Icon 
                        name={expandedItems[`recs-${index}`] ? 'chevron-up' : 'chevron-down'} 
                        size={16} 
                        color="#0d986a" 
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {!showHistory && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AI Plant Analysis</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.historyButton}
              onPress={() => {
                setShowHistory(true);
                fetchHistory();
              }}
            >
              <Icon name="history" size={24} color="#0d986a" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.helpButton}>
              <Icon name="help-circle-outline" size={24} color="#0d986a" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showHistory ? renderHistoryView() : (
        <>
          {renderUploadSection()}
          {renderAnalysisResult()}
        </>
      )}
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
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingBottom: 8,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontWeight: 'bold',
    color: '#0d986a',
    marginBottom: 6,
    fontSize: 16,
  },
  sectionValue: {
    color: '#333',
    fontSize: 15,
    marginLeft: 4,
  },
  recommendationsList: {
    marginTop: 4,
  },
  recommendationRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingRight: 8,
  },
  recommendationBullet: {
    color: '#0d986a',
    fontSize: 15,
    marginRight: 6,
    marginLeft: 4,
  },
  recommendationText: {
    color: '#333',
    fontSize: 15,
    flex: 1,
  },
  historyContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  historyList: {
    padding: 16,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyImage: {
    width: '100%',
    height: 200,
  },
  historyContent: {
    padding: 16,
  },
  historyPlantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  historyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyStatusText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  confidenceContainer: {
    marginBottom: 12,
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  confidenceBar: {
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    marginBottom: 4,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#0d986a',
    borderRadius: 3,
  },
  confidenceValue: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  recommendationsContainer: {
    marginTop: 8,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  diseasesContainer: {
    marginBottom: 12,
  },
  diseasesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  diseasesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  showMoreText: {
    color: '#0d986a',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  clearAllButton: {
    padding: 8,
    marginLeft: 'auto',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 20,
    zIndex: 1,
  },
});