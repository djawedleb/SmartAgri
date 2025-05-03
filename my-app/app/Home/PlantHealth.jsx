import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Modal, TextInput, Platform, Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Picker } from '@react-native-picker/picker';
import { getBaseUrl } from '../../config';

const PlantHealth = () => {
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [SavedPlants, setSavedPlants] = useState([]);
  const [greenhouses, setGreenhouses] = useState([]);

  const [newPlant, setNewPlant] = useState({
    id: '',
    Name: '',
    Greenhouse: '',
    status: 'healthy',
    Image: null
  });

  //to display the added users
  useEffect(() => {
    refreshPlants();
    fetchGreenhouses();
  }, []);

  // Request permissions for image picker
  useEffect(() => {
    (async () => {
      const { status } = await DocumentPicker.getDocumentPickerPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
      }
    })();
  }, []);

  const handleViewDetails = (plant) => {
    setSelectedPlant(plant);
    //console.log(selectedPlant);
    setShowDetails(true);
  };


  //when deleting a plant,also show an alert to confirm the action
  const handleRemovePlant = async (id) => {
    if (!id) {
      Alert.alert('Error', 'Invalid plant ID');
      return;
    }

    Alert.alert(
      'Delete Plant',
      'Are you sure you want to delete this plant?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDelete(id),
        },
      ],
      { cancelable: true }
    );
  };

  //Too delete a user from the database and the interface
  const handleDelete = async (id) => {
    try {
      const baseUrl = getBaseUrl();
      console.log('Deleting plant with ID:', id);
      
      // First, get the plant details to check if it has an image
      const plantResponse = await fetch(`${baseUrl}/GetPlant/${id}`);
      if (!plantResponse.ok) {
        throw new Error('Failed to fetch plant details');
      }
      const plantData = await plantResponse.json();
      
      // Delete the plant
      const response = await fetch(`${baseUrl}/DeletePlant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id,
          imagePath: plantData.Image // Send the image path to be deleted
        }),
      });

      console.log('Delete response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete error response:', errorText);
        throw new Error('Failed to delete plant');
      }

      const result = await response.json();
      console.log('Delete successful:', result);
      
      setShowDetails(false);
      refreshPlants();
    } catch (error) {
      console.error('Error deleting plant:', error);
      Alert.alert('Error', 'Failed to delete plant. Please try again.');
    }
  };

  const handleImageSelect = async () => {
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
        Alert.alert('Error', 'File size must be less than 5MB');
        return;
      }
      
      if (showEditModal) {
        setSelectedPlant(prev => ({
          ...prev,
          Image: file.uri
        }));
      } else {
        setNewPlant(prev => ({
          ...prev,
          Image: file.uri
        }));
      }
    } catch (err) {
      console.error('Error picking file:', err);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  //changing plant(greenhouse and readings) data when selecting a greenhouse
  const handleGreenhouseSelect = (house) => {
    setNewPlant(prev => ({
      ...prev,
      Greenhouse: house
    }));
    setSelectedPlant(prev => ({
      ...prev,
      Greenhouse: house
    }));
  };

  // Function to refresh the plant list
  const refreshPlants = async () => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/GetPlants`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      console.log('Fetched plants:', data);
      
      // Map greenhouse IDs to their names
      const plantsWithGreenhouseNames = data.map(plant => {
        const greenhouse = greenhouses.find(g => g._id === plant.Greenhouse);
        return {
          ...plant,
          greenhouseName: greenhouse ? greenhouse.Name : 'Unknown Greenhouse'
        };
      });
      
      setSavedPlants(plantsWithGreenhouseNames);
    } catch (error) {
      console.error('Error refreshing plants:', error);
    }
  };

   // Function to handle adding a new plant
  const handleAddPlant = async () => {
    if (!newPlant.Name || !newPlant.Greenhouse) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const baseUrl = getBaseUrl();
      console.log('Base URL:', baseUrl);
      
      const formData = new FormData();
      formData.append('name', newPlant.Name);
      formData.append('greenhouse', newPlant.Greenhouse);
      formData.append('status', 'healthy'); // Set default status
      
      if (newPlant.Image) {
        const imageUri = newPlant.Image;
        const imageName = imageUri.split('/').pop();
        const imageType = 'image/jpeg';
        
        formData.append('image', {
          uri: imageUri,
          type: imageType,
          name: imageName
        });
      }

      console.log('Sending form data:', {
        name: newPlant.Name,
        greenhouse: newPlant.Greenhouse,
        status: 'healthy',
        hasImage: !!newPlant.Image
      });

      const endpoint = `${baseUrl}/AddPlant`;
      console.log('Request URL:', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error('Failed to add plant: ' + errorText);
      }

      const result = await response.json();
      console.log('New plant data:', result);
  
      Alert.alert('Success', 'Plant added successfully');
      setShowAddModal(false);
      setNewPlant({
        id: '',
        Name: '',
        Greenhouse: '',
        status: 'healthy',
        Image: null
      });
      refreshPlants();
      refreshGreenhouses();
    } catch (error) {
      console.error('Error adding plant:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to add plant. Please check your network connection and try again.'
      );
    }
  };


//when editing a plant, also show an alert to confirm the action
const handleEditPlant = (plant) => {
  setSelectedPlant(plant);
  //console.log(selectedPlant);
  setShowEditModal(true);
};


  // so we can showcase the user data and edit it then save it in the handleSubmit
  const handleEdit = async () => {
    try {
      // Validate required fields
      if (!selectedPlant.Name || !selectedPlant.Greenhouse) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      const baseUrl = getBaseUrl();
      const plantId = selectedPlant._id || selectedPlant.id;
      
      if (!plantId) {
        Alert.alert('Error', 'Invalid plant ID');
        return;
      }

      // If there's a new image, use FormData
      if (selectedPlant.Image && typeof selectedPlant.Image === 'string' && selectedPlant.Image.startsWith('file://')) {
        const formData = new FormData();
        formData.append('name', selectedPlant.Name);
        formData.append('greenhouse', selectedPlant.Greenhouse);
        formData.append('status', selectedPlant.status || 'healthy');
        
        const imageUri = selectedPlant.Image;
        const imageName = imageUri.split('/').pop();
        const imageType = 'image/jpeg';
        
        formData.append('image', {
          uri: imageUri,
          type: imageType,
          name: imageName
        });

        const response = await fetch(`${baseUrl}/updatePlant/${plantId}`, {
          method: 'PUT',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
      } else {
        // If no new image, use JSON
        const response = await fetch(`${baseUrl}/updatePlant/${plantId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: selectedPlant.Name,
            greenhouse: selectedPlant.Greenhouse,
            status: selectedPlant.status || 'healthy',
            image: selectedPlant.Image
          }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
      }

      Alert.alert('Success', 'Plant updated successfully');
      setShowEditModal(false);
      refreshPlants();
      refreshGreenhouses();
    } catch (error) {
      console.error('Error updating plant:', error);
      Alert.alert('Error', 'Failed to update plant. Please try again.');
    }
  };

  // Render the details modal with plant information when clicking on View Details button
  const renderDetailsModal = () => (
    <Modal
      visible={showDetails}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowDetails(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Plant Details</Text>
            <View style={styles.modalHeaderActions}>
              <TouchableOpacity 
                style={styles.modalActionButton}
                onPress={() => setShowEditModal(true)}
              >
                <Icon name="pencil" size={24} color="#0d986a" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalActionButton}
                onPress={() => handleRemovePlant(selectedPlant.id)}
              >
                <Icon name="delete" size={24} color="#ff4444" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowDetails(false)}>
                <Icon name="close" size={24} color="#0d986a" />
              </TouchableOpacity>
            </View>
          </View>

          {selectedPlant && (
            <>
              <View style={styles.detailsHeader}>
                <Image 
                  source={{ 
                    uri: selectedPlant.Image ? 
                      (selectedPlant.Image.startsWith('http') ? selectedPlant.Image : `${getBaseUrl()}${selectedPlant.Image}`) : 
                      'https://images.unsplash.com/photo-1518977676601-b53f82aba655'
                  }} 
                  style={styles.detailsImage}
                  onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
                />
                <View style={styles.detailsInfo}>
                  <Text style={styles.detailsName}>{selectedPlant.Name}</Text>
                  <Text style={styles.detailsGreenhouse}>{selectedPlant.Greenhouse}</Text>
                  <View style={styles.detailsStatus}>
                    <Icon name="leaf" size={16} color="#0d986a" />
                    <Text style={styles.detailsStatusText}>Healthy</Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailsReadings}>
                <Text style={styles.detailsSectionTitle}>Current Readings</Text>
                <View style={styles.detailsGrid}>
                  {renderReadingItem('white-balance-sunny', 'N/A', 'Light')}
                  {renderReadingItem('thermometer', 'N/A', 'Temperature')}
                  {renderReadingItem('water-percent', 'N/A', 'Humidity')}
                  {renderReadingItem('water', 'N/A', 'Water')}
                </View>
              </View>

              <View style={styles.detailsHistory}>
                <Text style={styles.detailsSectionTitle}>Health History</Text>
                <View style={styles.historyItem}>
                  <Icon name="check-circle" size={20} color="#0d986a" />
                  <Text style={styles.historyText}>Last check: 2 hours ago</Text>
                </View>
                <View style={styles.historyItem}>
                  <Icon name="check-circle" size={20} color="#0d986a" />
                  <Text style={styles.historyText}>Watering: 4 hours ago</Text>
                </View>
                <View style={styles.historyItem}>
                  <Icon name="check-circle" size={20} color="#0d986a" />
                  <Text style={styles.historyText}>Fertilizer: 1 week ago</Text>
                </View>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  // Render the edit modal for updating plant information when clicking the pencil icon
  const renderEditModal = () => (
    <Modal
      visible={showEditModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowEditModal(false)}
    >
      <View style={styles.modalOverlay}>
        <ScrollView>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Plant</Text>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
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
                  {selectedPlant?.Image ? 'Change Image' : 'Choose Image'}
                </Text>
              </TouchableOpacity>
              {selectedPlant?.Image && (
                <View style={styles.selectedImageContainer}>
                  <Image 
                    source={{ 
                      uri: selectedPlant.Image ? 
                        (selectedPlant.Image.startsWith('http') ? selectedPlant.Image : `${getBaseUrl()}${selectedPlant.Image}`) : 
                        'https://images.unsplash.com/photo-1518977676601-b53f82aba655'
                    }} 
                    style={styles.selectedImage} 
                    resizeMode="cover"
                    onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setSelectedPlant(prev => ({ ...prev, Image: null }))}
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
              placeholder="Enter plant name"
              value={selectedPlant?.Name}
              onChangeText={(text) => setSelectedPlant(prev => ({ ...prev, Name: text }))}
            />

            {/* Greenhouse Selection */}
            <Text style={styles.inputLabel}>Greenhouse *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedPlant?.Greenhouse}
                style={styles.picker}
                onValueChange={(itemValue) => setSelectedPlant(prev => ({ ...prev, Greenhouse: itemValue }))}
              >
                <Picker.Item label="Select a greenhouse" value="" />
                {greenhouses.map((greenhouse) => (
                  <Picker.Item 
                    key={greenhouse._id} 
                    label={greenhouse.Name} 
                    value={greenhouse._id} 
                  />
                ))}
              </Picker>
            </View>

            {/* Sensor Data Display */}
            {selectedPlant?.Greenhouse && (
              <View style={styles.sensorDataContainer}>
                <Text style={styles.sensorDataTitle}>Sensor Readings</Text>
                <View style={styles.sensorDataGrid}>
                  <View style={styles.sensorRow}>
                    <View style={styles.sensorItem}>
                      <View style={styles.sensorIconWrapper}>
                        <Icon name="white-balance-sunny" size={18} color="#0d986a" />
                      </View>
                      <Text style={styles.sensorValue}>N/A</Text>
                    </View>
                    <View style={styles.sensorItem}>
                      <View style={styles.sensorIconWrapper}>
                        <Icon name="thermometer" size={18} color="#0d986a" />
                      </View>
                      <Text style={styles.sensorValue}>N/A</Text>
                    </View>
                  </View>
                  <View style={styles.sensorRow}>
                    <View style={styles.sensorItem}>
                      <View style={styles.sensorIconWrapper}>
                        <Icon name="water-percent" size={18} color="#0d986a" />
                      </View>
                      <Text style={styles.sensorValue}>N/A</Text>
                    </View>
                    <View style={styles.sensorItem}>
                      <View style={styles.sensorIconWrapper}>
                        <Icon name="water" size={18} color="#0d986a" />
                      </View>
                      <Text style={styles.sensorValue}>N/A</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleEdit}
            >
              <Text style={styles.submitButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  // Render the sensor data for the selected plant
  const renderSensorData = () => {
    if (!newPlant.Greenhouse) return null;

    return (
      <View style={styles.sensorDataContainer}>
        <Text style={styles.sensorDataTitle}>Sensor Readings</Text>
        <View style={styles.sensorDataGrid}>
          <View style={styles.sensorRow}>
            <View style={styles.sensorItem}>
              <View style={styles.sensorIconWrapper}>
                <Icon name="white-balance-sunny" size={18} color="#0d986a" />
              </View>
              <Text style={styles.sensorValue}>N/A</Text>
            </View>
            <View style={styles.sensorItem}>
              <View style={styles.sensorIconWrapper}>
                <Icon name="thermometer" size={18} color="#0d986a" />
              </View>
              <Text style={styles.sensorValue}>N/A</Text>
            </View>
          </View>
          <View style={styles.sensorRow}>
            <View style={styles.sensorItem}>
              <View style={styles.sensorIconWrapper}>
                <Icon name="water-percent" size={18} color="#0d986a" />
              </View>
              <Text style={styles.sensorValue}>N/A</Text>
            </View>
            <View style={styles.sensorItem}>
              <View style={styles.sensorIconWrapper}>
                <Icon name="water" size={18} color="#0d986a" />
              </View>
              <Text style={styles.sensorValue}>N/A</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Render the add modal for adding a new plant when clicking the plus icon
  const renderAddModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        setShowAddModal(false);
        setNewPlant({
          id: '',
          Name: '',
          Greenhouse: '',
          status: 'healthy',
          Image: null
        });
      }}
    >
      <View style={styles.modalOverlay}>
        <ScrollView>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Plant</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAddModal(false);
                  setNewPlant({
                    id: '',
                    Name: '',
                    Greenhouse: '',
                    status: 'healthy',
                    Image: null
                  });
                }}
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
                  {newPlant.Image ? 'Change Image' : 'Choose Image'}
                </Text>
              </TouchableOpacity>
              {newPlant.Image && (
                <View style={styles.selectedImageContainer}>
                  <Image 
                    source={{ uri: newPlant.Image }} 
                    style={styles.selectedImage} 
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setNewPlant(prev => ({ ...prev, Image: null }))}
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
              placeholder="Enter plant name"
              value={newPlant.Name}
              onChangeText={(text) => setNewPlant(prev => ({ ...prev, Name: text }))}
            />

            {/* Greenhouse Selection */}
            <Text style={styles.inputLabel}>Greenhouse *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={newPlant.Greenhouse}
                style={styles.picker}
                onValueChange={(itemValue) => setNewPlant(prev => ({ ...prev, Greenhouse: itemValue }))}
              >
                <Picker.Item label="Select a greenhouse" value="" />
                {greenhouses.map((greenhouse) => (
                  <Picker.Item 
                    key={greenhouse._id} 
                    label={greenhouse.Name} 
                    value={greenhouse._id} 
                  />
                ))}
              </Picker>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAddPlant}
            >
              <Text style={styles.submitButtonText}>Add Plant</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  const renderReadingItem = (icon, value, label) => (
    <View style={styles.readingItem}>
      <View style={styles.readingIconContainer}>
        <Icon name={icon} size={20} color="#0d986a" />
      </View>
      <View>
        <Text style={styles.readingValue}>{value}</Text>
        <Text style={styles.readingLabel}>{label}</Text>
      </View>
    </View>
  );
  
  const fetchGreenhouses = async () => {
    try {
      const baseUrl = getBaseUrl();
      console.log('Fetching greenhouses from:', `${baseUrl}/GetGreenhouses`);
      
      const response = await fetch(`${baseUrl}/GetGreenhouses`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('Fetched greenhouses:', data);
      setGreenhouses(data);
    } catch (error) {
      console.error('Error fetching greenhouses:', error);
      Alert.alert('Error', 'Failed to fetch greenhouses');
    }
  };

  // Update the readings grid to use default values
  const renderReadingsGrid = (greenhouseId) => (
    <View style={styles.readingsGrid}>
      {renderReadingItem('white-balance-sunny', 'N/A', 'Light')}
      {renderReadingItem('thermometer', 'N/A', 'Temperature')}
      {renderReadingItem('water-percent', 'N/A', 'Humidity')}
      {renderReadingItem('water', 'N/A', 'Water')}
    </View>
  );

  // Update the plant card to use the new readings grid
  const renderPlantCard = (plant) => (
    <View key={`${plant.Name}-${plant.Greenhouse}`} style={styles.card}>
      <View style={styles.cardHeader}>
        <Image 
          source={{ 
            uri: plant.Image ? 
              (plant.Image.startsWith('http') ? plant.Image : `${getBaseUrl()}${plant.Image}`) : 
              'https://images.unsplash.com/photo-1518977676601-b53f82aba655'
          }} 
          style={styles.plantImage}
          onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
        />
        <View style={styles.plantInfo}>
          <Text style={styles.plantName}>{plant.Name}</Text>
          <Text style={styles.greenhouseName}>{plant.greenhouseName}</Text>
          <View style={styles.statusContainer}>
            <Icon name="leaf" size={16} color="#0d986a" />
            <Text style={styles.statusText}>{plant.status || 'Healthy'}</Text>
          </View>
        </View>
        <View style={styles.cardHeaderActions}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => handleEditPlant(plant)}
          >
            <Icon name="pencil" size={20} color="#0d986a" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => handleRemovePlant(plant._id || plant.id)}
          >
            <Icon name="delete" size={20} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </View>

      {renderReadingsGrid(plant.Greenhouse)}

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.reportButton}
          onPress={() => {
            Alert.alert(
              'Generate Report',
              'Would you like to generate a detailed health report for this plant?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Generate',
                  onPress: () => {
                    Alert.alert('Success', 'Report generated successfully');
                  },
                },
              ],
            );
          }}
        >
          <Icon name="file-document-outline" size={20} color="#0d986a" />
          <Text style={styles.reportButtonText}>Generate Report</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.detailsButton}
          onPress={() => handleViewDetails(plant)}
        >
          <Text style={styles.detailsButtonText}>View Details</Text>
          <Icon name="chevron-right" size={20} color="#0d986a" style={styles.detailsIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Add a function to refresh greenhouses
  const refreshGreenhouses = async () => {
    try {
      const baseUrl = getBaseUrl();
      console.log('Refreshing greenhouses from:', `${baseUrl}/GetGreenhouses`);
      
      const response = await fetch(`${baseUrl}/GetGreenhouses`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('Refreshed greenhouses:', data);
      setGreenhouses(data);
    } catch (error) {
      console.error('Error refreshing greenhouses:', error);
      Alert.alert('Error', 'Failed to refresh greenhouses');
    }
  };

  //Main page component
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Plant Health</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={() => {
              refreshPlants();
              refreshGreenhouses();
            }}
          >
            <Icon name="refresh" size={24} color="#0d986a" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Icon name="filter-variant" size={24} color="#0d986a" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {SavedPlants.map((plant) => renderPlantCard(plant))}
      </ScrollView>

      {renderDetailsModal()}
      {renderEditModal()}
      {renderAddModal()}

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  refreshButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#f1f9f5',
  },
  filterButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#f1f9f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
    position: 'relative',
  },
  plantImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 14,
  },
  plantInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  plantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  greenhouseName: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f9f5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    marginLeft: 4,
    color: '#0d986a',
    fontSize: 12,
    fontWeight: '500',
  },
  readingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,  },
  readingItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  readingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f9f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  readingValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  readingLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 1,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  reportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f9f5',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  detailsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f9f5',
    paddingVertical: 10,
    borderRadius: 12,
  },
  reportButtonText: {
    color: '#0d986a',
    fontSize: 15,
    fontWeight: '600',
  },
  detailsButtonText: {
    color: '#0d986a',
    fontSize: 15,
    fontWeight: '600',
    marginRight: 4,
  },
  detailsIcon: {
    marginLeft: 4,
  },
  addButton: {
    position: 'absolute',
    bottom: 90,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0d986a',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  detailsHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  detailsImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  detailsInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  detailsName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  detailsGreenhouse: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  detailsStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f9f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  detailsStatusText: {
    marginLeft: 4,
    color: '#0d986a',
    fontSize: 12,
    fontWeight: '500',
  },
  detailsReadings: {
    marginBottom: 20,
  },
  detailsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailsHistory: {
    marginBottom: 20,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalActionButton: {
    padding: 4,
  },
  editForm: {
    paddingTop: 10,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#0d986a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cardHeaderActions: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f9f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff1f1',
    justifyContent: 'center',
    alignItems: 'center',
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#333',
  },
  greenhouseSelector: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  greenhouseOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f1f9f5',
    alignItems: 'center',
  },
  greenhouseOptionSelected: {
    backgroundColor: '#0d986a',
  },
  greenhouseOptionText: {
    color: '#0d986a',
    fontSize: 14,
    fontWeight: '600',
  },
  greenhouseOptionTextSelected: {
    color: '#fff',
  }
});

export default PlantHealth;
