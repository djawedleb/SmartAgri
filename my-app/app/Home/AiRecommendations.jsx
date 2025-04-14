import { View, Text, StyleSheet, Pressable } from 'react-native';
import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function AiRecommendations() {
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = () => {
    setAnalyzing(true);
    // Add your AI analysis logic here
  };

  return (
    <View style={styles.container}>
      <View style={styles.uploadSection}>
        <Text style={styles.uploadText}>Please upload size less than 100KB</Text>
        <View style={styles.uploadArea}>
          <Icon name="image-outline" size={40} color="#666" />
          <Pressable style={styles.chooseButton}>
            <Text style={styles.chooseButtonText}>Choose File</Text>
          </Pressable>
          <Text style={styles.imageText}>[image1]</Text>
        </View>
      </View>

      <Pressable 
        style={styles.analyzeButton}
        onPress={handleAnalyze}
      >
        <Text style={styles.analyzeButtonText}>suggest fixes</Text>
      </Pressable>

      {analyzing && (
        <View style={styles.analyzerSection}>
          <View style={styles.analyzerHeader}>
            <Icon name="brain" size={24} color="#0d986a" />
            <Text style={styles.analyzerTitle}>AI Analyser</Text>
          </View>
          <View style={styles.analyzerContent}>
            <Text style={styles.waitingText}>Please wait ...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d986a',
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
  waitingText: {
    color: '#666',
    fontSize: 16,
  },
}); 