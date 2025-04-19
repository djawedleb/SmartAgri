import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal, Alert, Platform } from 'react-native';
import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';

const GreenHouses = () => {
  const router = useRouter();
  const [selectedGreenhouse, setSelectedGreenhouse] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    image: null,
  });

  const greenhouses = [
    {
      id: 1,
      name: 'GreenHouse 1',
      image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae',
      temperature: '30°C',
      light: '59%',
      humidity: 'Off',
      water: 'Off',
      owner: 'Victor Hugo Rivero Muñiz',
      location: { lat: 40.7128, lng: -74.0060 }
    },
    {
      id: 2,
      name: 'GreenHouse 2',
      image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae',
      temperature: '30°C',
      light: '59%',
      humidity: 'Off',
      water: 'Off',
      owner: 'Victor Hugo Rivero Muñiz',
      location: { lat: 40.7128, lng: -74.0060 }
    }
  ];

  const plants = [
    {
      id: 1,
      name: 'Echeveria',
      image: 'https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797',
      rating: 5.0,
      size: '3 inch'
    },
    {
      id: 2,
      name: 'Prickly Pear',
      image: 'https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797',
      rating: 4.8,
      size: '5 inch'
    }
  ];

  const tabs = ['All', 'Cacti', 'In pots', 'Dried flowers'];

  const renderReadings = (greenhouse) => (
    <View style={styles.readingsContainer}>
      <View style={styles.readingItem}>
        <Icon name="white-balance-sunny" size={24} color="#333" />
        <Text style={styles.readingValue}>{greenhouse.light}</Text>
      </View>
      <View style={styles.readingItem}>
        <Icon name="thermometer" size={24} color="#333" />
        <Text style={styles.readingValue}>{greenhouse.temperature}</Text>
      </View>
      <View style={styles.readingItem}>
        <Icon name="water-percent" size={24} color="#999" />
        <Text style={styles.readingValue}>{greenhouse.humidity}</Text>
      </View>
      <View style={styles.readingItem}>
        <Icon name="waves" size={24} color="#999" />
        <Text style={styles.readingValue}>{greenhouse.water}</Text>
      </View>
    </View>
  );

  const renderPlantCard = (plant) => (
    <TouchableOpacity key={plant.id} style={styles.plantCard}>
      <Image 
        source={{ uri: plant.image }}
        style={styles.plantImage} 
      />
      <View style={styles.plantInfo}>
        <View style={styles.plantHeader}>
          <Text style={styles.plantName}>{plant.name}</Text>
          <TouchableOpacity style={styles.favoriteButton}>
            <Icon name="heart-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        <View style={styles.plantDetails}>
          <Text style={styles.plantSize}>From {plant.size}</Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{plant.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPropertyCard = (greenhouse) => (
    <View style={styles.propertyCard}>
      <View style={styles.mapContainer}>
        <Image 
          source={{ uri: 'https://maps.googleapis.com/maps/api/staticmap?center=40.7128,-74.0060&zoom=15&size=400x200&maptype=satellite&key=YOUR_API_KEY' }}
          style={styles.mapImage}
        />
        <View style={styles.mapOverlay}>
          <Text style={styles.mapTitle}>{greenhouse.name}</Text>
          <Text style={styles.mapSubtitle}>{greenhouse.owner}</Text>
        </View>
        <View style={styles.temperatureTag}>
          <Text style={styles.temperatureText}>32°C</Text>
        </View>
      </View>
    </View>
  );

  const handleImageSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const selectedAsset = result.assets[0];
      
      // Check if the selected file is an image
      if (!selectedAsset.mimeType?.startsWith('image/')) {
        Alert.alert('Error', 'Please select an image file');
        return;
      }

      // Check file size (5MB limit)
      if (selectedAsset.size > 5 * 1024 * 1024) {
        Alert.alert('Error', 'Image size should be less than 5MB');
        return;
      }

      setFormData(prev => ({ ...prev, image: selectedAsset.uri }));
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const handleAdd = () => {
    if (selectedGreenhouse) {
      // Adding a plant
      if (!formData.name.trim()) {
        Alert.alert('Error', 'Please enter a plant name');
        return;
      }
      // Here you would typically make an API call to add the plant
      Alert.alert('Success', `Added new plant "${formData.name}" to ${selectedGreenhouse.name}`);
    } else {
      // Adding a greenhouse
      if (!formData.name.trim()) {
        Alert.alert('Error', 'Please enter a greenhouse name');
        return;
      }
      if (!formData.location.trim()) {
        Alert.alert('Error', 'Please enter a location');
        return;
      }
      // Here you would typically make an API call to add the greenhouse
      Alert.alert('Success', `Created new greenhouse "${formData.name}"`);
    }
    setFormData({
      name: '',
      location: '',
      description: '',
      image: null,
    });
    setIsModalVisible(false);
  };

  const renderModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isModalVisible}
      onRequestClose={() => setIsModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <ScrollView>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedGreenhouse ? 'Add New Plant' : 'Add New Greenhouse'}
              </Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Image Upload Section */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Image</Text>
              <TouchableOpacity 
                style={styles.imagePickerButton} 
                onPress={handleImageSelect}
              >
                <Icon name="image-plus" size={24} color="#666" />
                <Text style={styles.imagePickerText}>
                  {formData.image ? 'Change Image' : 'Choose Image'}
                </Text>
              </TouchableOpacity>
              {formData.image && (
                <View style={styles.selectedImageContainer}>
                  <Image 
                    source={{ uri: formData.image }} 
                    style={styles.selectedImage} 
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setFormData(prev => ({ ...prev, image: null }))}
                  >
                    <Icon name="close-circle" size={24} color="#FF4444" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Name Input */}
            <Text style={styles.inputLabel}>Name *</Text>
            <TextInput
              style={styles.input}
              placeholder={selectedGreenhouse ? "Enter plant name" : "Enter greenhouse name"}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            />

            {!selectedGreenhouse && (
              <>
                {/* Location Input */}
                <Text style={styles.inputLabel}>Location *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter location"
                  value={formData.location}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
                />
              </>
            )}

            {/* Description Input */}
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter description"
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAdd}
            >
              <Text style={styles.submitButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  const renderGreenhouseCard = (greenhouse) => (
    <TouchableOpacity
      key={greenhouse.id}
      style={styles.greenhouseCard}
      onPress={() => setSelectedGreenhouse(greenhouse)}
    >
      <Image source={{ uri: greenhouse.image }} style={styles.greenhouseImage} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.greenhouseName}>{greenhouse.name}</Text>
          <View style={styles.cardActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                setFormData({
                  name: greenhouse.name,
                  location: greenhouse.location,
                  description: greenhouse.description || '',
                  image: greenhouse.image,
                });
                setIsModalVisible(true);
              }}
            >
              <Icon name="pencil" size={20} color="#0d986a" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.removeButton]}
              onPress={() => {
                Alert.alert(
                  'Remove Greenhouse',
                  'Are you sure you want to remove this greenhouse?',
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                    {
                      text: 'Remove',
                      onPress: () => {
                        // Here you would typically make an API call to remove the greenhouse
                        Alert.alert('Success', 'Greenhouse removed successfully');
                      },
                    },
                  ],
                );
              }}
            >
              <Icon name="delete" size={20} color="#FF4444" />
            </TouchableOpacity>
          </View>
        </View>
        {renderReadings(greenhouse)}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {!selectedGreenhouse ? (
          // Greenhouse List View
          greenhouses.map(renderGreenhouseCard)
        ) : (
          // Detailed Greenhouse View
          <View>
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setSelectedGreenhouse(null)}
              >
                <Icon name="chevron-left" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{selectedGreenhouse.name}</Text>
            </View>

            <Image 
              source={{ uri: selectedGreenhouse.image }} 
              style={styles.detailImage}
            />

            <Text style={styles.sectionTitle}>Plants</Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.tabsContainer}
            >
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.tab,
                    activeTab === tab && styles.activeTab
                  ]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText
                  ]}>{tab}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.sortContainer}>
              <Text style={styles.sortLabel}>Popularity</Text>
              <Icon name="chevron-down" size={20} color="#666" />
            </View>

            {plants.map(renderPlantCard)}

            <Text style={styles.sectionTitle}>Property</Text>
            {renderPropertyCard(selectedGreenhouse)}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      {renderModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  greenhouseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  greenhouseImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  removeButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  greenhouseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  readingsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  readingItem: {
    alignItems: 'center',
  },
  readingValue: {
    marginTop: 4,
    fontSize: 14,
    color: '#666',
  },
  detailImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  activeTab: {
    backgroundColor: '#0d986a',
  },
  tabText: {
    color: '#666',
    fontSize: 14,
  },
  activeTabText: {
    color: '#fff',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sortLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  plantCard: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  plantImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  plantInfo: {
    flex: 1,
  },
  plantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  plantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  plantDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plantSize: {
    fontSize: 13,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 13,
    color: '#666',
  },
  propertyCard: {
    margin: 14,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    backgroundColor: '#fff',
  },
  mapContainer: {
    height: 200,
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  mapTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mapSubtitle: {
    color: '#fff',
    fontSize: 13,
    marginTop: 4,
  },
  temperatureTag: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  temperatureText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    position: 'absolute',
    bottom: 80,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0d986a',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    marginTop: 50,
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  imagePickerText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 16,
  },
  selectedImageContainer: {
    marginTop: 12,
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  submitButton: {
    backgroundColor: '#0d986a',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GreenHouses;