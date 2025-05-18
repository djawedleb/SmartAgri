import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Modal, TextInput, Platform, Dimensions, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { getBaseUrl } from '../../config';
import FastImage from 'react-native-fast-image';
import { useUser } from '../context/UserContext';


const getImageSource = (imagePath) => {
  
  
  const uri = imagePath.startsWith('http') ? imagePath : `${getBaseUrl()}${imagePath}`;
  return {
    uri,
    priority: FastImage.priority.normal,
    cache: FastImage.cacheControl.immutable
  };
};

const PlantHealth = () => {

   const { isPageVisible } = useUser();
   const leftPadding = 60;

  // Function to calculate time difference
  const calculateTimeDiff = (lastChecked) => {
    try {
      if (!lastChecked) return '0h 0m';
      
      const now = new Date();
      const [lastHour, lastMinute] = lastChecked.split(':');
      const lastCheckedDate = new Date();
      lastCheckedDate.setHours(parseInt(lastHour), parseInt(lastMinute), 0, 0);
      
      // If the last checked time is later than current time, it means it was yesterday
      if (lastCheckedDate > now) {
        lastCheckedDate.setDate(lastCheckedDate.getDate() - 1);
      }
      
      const diff = Math.floor((now - lastCheckedDate) / (1000 * 60));
      const hours = Math.floor(diff / 60);
      const minutes = diff % 60;
      
      // Format the output
      if (hours === 0) {
        return `${minutes}m`;
      } else if (hours < 24) {
        return `${hours}h ${minutes}m`;
      } else {
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        if (remainingHours === 0) {
          return `${days}d`;
        }
        return `${days}d ${remainingHours}h`;
      }
    } catch (error) {
      console.error('Error calculating time difference:', error);
      return '0h 0m';
    }
  };

  // Function to calculate days and hours from watering interval
  const calculateWateringTime = (interval) => {
    try {
      if (!interval) return '0d 0h';
      
      const [day, hour] = interval.split(' ');
      const days = parseInt(day);
      const hours = parseInt(hour);
      
      // Validate the numbers
      if (isNaN(days) || isNaN(hours)) {
        console.error('Invalid watering interval format:', interval);
        return '0d 0h';
      }

      // Get current time
      const now = new Date();
      const lastWatering = new Date();
      
      // Set the last watering time
      lastWatering.setDate(now.getDate() - days);
      lastWatering.setHours(hours, 0, 0, 0);

      // Calculate time difference in minutes
      const diff = Math.floor((now - lastWatering) / (1000 * 60));
      const elapsedDays = Math.floor(diff / (60 * 24));
      const elapsedHours = Math.floor((diff % (60 * 24)) / 60);
      const elapsedMinutes = diff % 60;

      // Format the output
      if (elapsedDays === 0) {
        if (elapsedHours === 0) {
          return `${elapsedMinutes}m ago`;
        }
        return `${elapsedHours}h ${elapsedMinutes}m ago`;
      } else {
        if (elapsedHours === 0) {
          return `${elapsedDays}d ago`;
        }
        return `${elapsedDays}d ${elapsedHours}h ago`;
      }
    } catch (error) {
      console.error('Error calculating watering time:', error);
      return '0d 0h';
    }
  };

// Function to calculate months and days from fertilizer interval
  const calculateFertilizerTime = (interval) => {
    try {
      const [month, day] = interval.split(' ');
      const months = parseInt(month);
      const days = parseInt(day);
      
      return `${months}mo ${days}d`;
    } catch (error) {
      return '0mo 0d';
    }
  };

  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [SavedPlants, setSavedPlants] = useState([]);
  const [greenhouses, setGreenhouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGreenhousesLoaded, setIsGreenhousesLoaded] = useState(false);

  const [newPlant, setNewPlant] = useState({
    id: '',
    Name: '',
    Greenhouse: '',
    status: 'healthy',
    Image: null
  });

  const [selectedPlantState, setSelectedPlantState] = useState(null);
  const [lastCheckedHour, setLastCheckedHour] = useState('8');
  const [lastCheckedMinute, setLastCheckedMinute] = useState('0');
  const [wateringDay, setWateringDay] = useState('1'); 
  const [wateringHour, setWateringHour] = useState('8'); 
  const [fertilizerMonth, setFertilizerMonth] = useState('1');
  const [fertilizerDay, setFertilizerDay] = useState('1');
  const [isSaving, setIsSaving] = useState(false);

  const [showEditStateModal, setShowEditStateModal] = useState(false);

  const [selectedFilter, setSelectedFilter] = useState(null);
  const [showFilterPicker, setShowFilterPicker] = useState(false);

  const [showCustomFilterModal, setShowCustomFilterModal] = useState(false);

  //to display the added plants
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // First fetch greenhouses
        await fetchGreenhouses();
        // Then refresh plants which will use the fetched greenhouses
        await refreshPlants();
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Error', 'Failed to load data. Please try refreshing.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Add a separate useEffect to monitor greenhouses state
  useEffect(() => {
    if (greenhouses.length > 0) {
      console.log('Greenhouses loaded:', greenhouses.map(g => g.Name));
      setIsGreenhousesLoaded(true);
    }
  }, [greenhouses]);

  // Request permissions for image picker
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
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
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        if (showEditModal) {
          setSelectedPlant(prev => ({
            ...prev,
            Image: result.assets[0].uri
          }));
        } else {
          setNewPlant(prev => ({
            ...prev,
            Image: result.assets[0].uri
          }));
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
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
        if (showEditModal) {
          setSelectedPlant(prev => ({
            ...prev,
            Image: result.assets[0].uri
          }));
        } else {
          setNewPlant(prev => ({
            ...prev,
            Image: result.assets[0].uri
          }));
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
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
      
      // Wait for greenhouses to be loaded before mapping
      if (isGreenhousesLoaded) {
        const plantsWithGreenhouseNames = data.map(plant => {
          const greenhouse = greenhouses.find(g => g._id === plant.Greenhouse);
          return {
            ...plant,
            greenhouseName: greenhouse ? greenhouse.Name : 'Unknown Greenhouse'
          };
        });
        setSavedPlants(plantsWithGreenhouseNames);
      } else {
        // If greenhouses aren't loaded yet, wait 2 seconds and try again
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // After waiting, check if greenhouses are loaded
        if (isGreenhousesLoaded) {
          const plantsWithGreenhouseNames = data.map(plant => {
            const greenhouse = greenhouses.find(g => g._id === plant.Greenhouse);
            return {
              ...plant,
              greenhouseName: greenhouse ? greenhouse.Name : 'Unknown Greenhouse'
            };
          });
          setSavedPlants(plantsWithGreenhouseNames);
        } else {
          // If still not loaded after waiting, just set the plants without mapping
          setSavedPlants(data);
        }
      }
    } catch (error) {
      console.error('Error refreshing plants:', error);
      Alert.alert('Error', 'Failed to refresh plants');
    }
  };

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
  setSelectedPlant({
    ...plant,
    oldImagePath: plant.Image // Store the old image path
  });
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

        // Include the old image path for deletion if it exists
        if (selectedPlant.oldImagePath) {
          formData.append('oldImagePath', selectedPlant.oldImagePath);
        }

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

  const handleEditState = (plant) => {
    setSelectedPlantState(plant);
    setShowEditStateModal(true);
    // Set initial values based on plant's current state
    if (plant.lastChecked) {
      const [hour, minute] = plant.lastChecked.split(':');
      setLastCheckedHour(hour);
      setLastCheckedMinute(minute);
    }
    if (plant.wateringInterval) {
      const [day, hour] = plant.wateringInterval.split(' ');
      setWateringDay(day);
      setWateringHour(hour);
    }
    if (plant.fertilizerInterval) {
      const [month, day] = plant.fertilizerInterval.split(' ');
      setFertilizerMonth(month);
      setFertilizerDay(day);
    }
  };

  const saveStateChanges = async () => {
    try {
      setIsSaving(true);
      
      // Validate inputs before sending
      if (!lastCheckedHour || !lastCheckedMinute || !wateringDay || !wateringHour || !fertilizerMonth || !fertilizerDay) {
        Alert.alert('Error', 'All fields are required');
        return;
      }

      const response = await fetch(`${getBaseUrl()}/api/plants/${selectedPlantState._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lastChecked: `${lastCheckedHour}:${lastCheckedMinute}`,
          wateringInterval: `${wateringDay} ${wateringHour}`,
          fertilizerInterval: `${fertilizerMonth} ${fertilizerDay}`
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update plant state');
      }

      // Update the plant in your local state
      setSelectedPlantState(data);
      setShowEditStateModal(false);
      // Refresh the plants list
      refreshPlants();
      
      Alert.alert('Success', 'Plant state updated successfully');
    } catch (error) {
      console.error('Error updating plant state:', error);
      Alert.alert('Error', error.message || 'Failed to update plant state');
    } finally {
      setIsSaving(false);
    }
  };

  const renderEditStateModal = () => {
    if (!showEditStateModal) return null;

    return (
      <Modal
        visible={showEditStateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditStateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Plant State</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.modalLabel}>Last Checked</Text>
              <View style={[styles.inputRow, { justifyContent: 'space-between' }]}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Picker
                    style={styles.picker}
                    selectedValue={lastCheckedHour}
                    onValueChange={setLastCheckedHour}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <Picker.Item
                        key={i}
                        label={i < 10 ? `0${i}` : `${i}`}
                        value={`${i}`}
                      />
                    ))}
                  </Picker>
                </View>
                <View style={{ flex: 1 }}>
                  <Picker
                    style={styles.picker}
                    selectedValue={lastCheckedMinute}
                    onValueChange={setLastCheckedMinute}
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <Picker.Item
                        key={i}
                        label={i < 10 ? `0${i}` : `${i}`}
                        value={`${i}`}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.modalLabel}>Watering Interval</Text>
              <View style={[styles.inputRow, { justifyContent: 'space-between' }]}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Picker
                    style={styles.picker}
                    selectedValue={wateringDay}
                    onValueChange={setWateringDay}
                  >
                    {Array.from({ length: 31 }, (_, i) => (
                      <Picker.Item
                        key={i + 1}
                        label={`Day ${i + 1}`}
                        value={`${i + 1}`}
                      />
                    ))}
                  </Picker>
                </View>
                <View style={{ flex: 1 }}>
                  <Picker
                    style={styles.picker}
                    selectedValue={wateringHour}
                    onValueChange={setWateringHour}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <Picker.Item
                        key={i}
                        label={i < 10 ? `0${i}:00` : `${i}:00`}
                        value={`${i}`}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.modalLabel}>Fertilizer Interval</Text>
              <View style={[styles.inputRow, { justifyContent: 'space-between' }]}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Picker
                    style={styles.picker}
                    selectedValue={fertilizerMonth}
                    onValueChange={setFertilizerMonth}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <Picker.Item
                        key={i + 1}
                        label={`Month ${i + 1}`}
                        value={`${i + 1}`}
                      />
                    ))}
                  </Picker>
                </View>
                <View style={{ flex: 1 }}>
                  <Picker
                    style={styles.picker}
                    selectedValue={fertilizerDay}
                    onValueChange={setFertilizerDay}
                  >
                    {Array.from({ length: 31 }, (_, i) => (
                      <Picker.Item
                        key={i + 1}
                        label={`Day ${i + 1}`}
                        value={`${i + 1}`}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowEditStateModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, isSaving && styles.disabledButton]}
                onPress={{saveStateChanges}}
                disabled={isSaving}
              >
                <Text style={styles.buttonText}>{isSaving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
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
              {isPageVisible('Sensors') && (
              <TouchableOpacity 
                style={styles.modalActionButton}
                onPress={() => setShowEditModal(true)}
              >
                <Icon name="pencil" size={24} color="#0d986a" />
              </TouchableOpacity>
              )}
               {isPageVisible('Sensors') && (
              <TouchableOpacity 
                style={styles.modalActionButton}
                onPress={() => handleRemovePlant(selectedPlant.id)}
              >
                <Icon name="delete" size={24} color="#ff4444" />
              </TouchableOpacity>
              )}

            {!isPageVisible('Sensors') && (
              <TouchableOpacity 
                style={styles.modalActionButton}
                onPress={() => handleEditState(selectedPlant)}
              >
                <Icon name="pencil" size={24} color="#0d986a" />
              </TouchableOpacity>
              )} 
              <TouchableOpacity onPress={() => setShowDetails(false)}>
                <Icon name="close" size={24} color="#0d986a" />
              </TouchableOpacity>
            </View>
          </View>

          {selectedPlant && (
            <>
              <View style={styles.detailsHeader}>
                <FastImage 
                  source={getImageSource(selectedPlant.Image)}
                  style={styles.detailsImage}
                  resizeMode={FastImage.resizeMode.cover}
                  fallback={true}
                />
                <View style={styles.detailsInfo}>
                  <Text style={styles.detailsName}>{selectedPlant.Name}</Text>
                  <Text style={styles.detailsGreenhouse}>
                    {greenhouses.find(g => g._id === selectedPlant.Greenhouse)?.Name || 'Unknown Greenhouse'}
                  </Text>
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
                  <Text style={styles.historyText}>Last checked: {calculateTimeDiff(selectedPlant.lastChecked)}</Text>
                </View>
      
                <View style={styles.historyItem}>
                  <Icon name="check-circle" size={20} color="#0d986a" />
                  <Text style={styles.historyText}>Last Watering: {calculateWateringTime(selectedPlant.wateringInterval)}</Text>
                </View>
                <View style={styles.historyItem}>
                  <Icon name="check-circle" size={20} color="#0d986a" />
                  <Text style={styles.historyText}>Last Fertilizer: {calculateFertilizerTime(selectedPlant.fertilizerInterval)}</Text>
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
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', marginTop: selectedPlant?.Image ? 20 : 0, paddingBottom: selectedPlant?.Image ? 20 : 0 }}>
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
              <View style={styles.uploadArea}>
                {selectedPlant?.Image ? (
                  <FastImage 
                    source={getImageSource(selectedPlant.Image)}
                    style={styles.previewImage} 
                    resizeMode={FastImage.resizeMode.cover}
                    fallback={true}
                  />
                ) : (
                  <>
                    <Icon name="camera-plus" size={40} color="#0d986a" />
                    <Text style={styles.uploadText}>Upload or take a photo of your plant</Text>
                  </>
                )}
              </View>

              <View style={styles.uploadButtons}>
                <TouchableOpacity style={styles.uploadButton} onPress={handleImageSelect}>
                  <Icon name="image-plus" size={24} color="#0d986a" />
                  <Text style={styles.uploadButtonText}>Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
                  <Icon name="camera" size={24} color="#0d986a" />
                  <Text style={styles.uploadButtonText}>Camera</Text>
                </TouchableOpacity>
              </View>

              {selectedPlant?.Image && (
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setSelectedPlant(prev => ({ ...prev, Image: null }))}
                >
                  <Icon name="close-circle" size={24} color="#FF4444" />
                </TouchableOpacity>
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
      <View style={styles.modalContainer}>
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
            <View style={styles.uploadArea}>
              {newPlant.Image ? (
                <FastImage 
                  source={{ 
                    uri: newPlant.Image,
                    priority: FastImage.priority.high,
                    cache: FastImage.cacheControl.immutable
                  }} 
                  style={styles.previewImage} 
                  resizeMode={FastImage.resizeMode.cover}
                  fallback={true}
                />
              ) : (
                <>
                  <Icon name="camera-plus" size={40} color="#0d986a" />
                  <Text style={styles.uploadText}>Upload or take a photo of your plant</Text>
                </>
              )}
            </View>

            <View style={styles.uploadButtons}>
              <TouchableOpacity style={styles.uploadButton} onPress={handleImageSelect}>
                <Icon name="image-plus" size={24} color="#0d986a" />
                <Text style={styles.uploadButtonText}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
                <Icon name="camera" size={24} color="#0d986a" />
                <Text style={styles.uploadButtonText}>Camera</Text>
              </TouchableOpacity>
            </View>

            {newPlant.Image && (
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setNewPlant(prev => ({ ...prev, Image: null }))}
              >
                <Icon name="close-circle" size={24} color="#FF4444" />
              </TouchableOpacity>
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
      
      if (!Array.isArray(data)) {
        console.error('Invalid greenhouse data received:', data);
        throw new Error('Invalid greenhouse data received');
      }

      if (data.length === 0) {
        console.log('No greenhouses found');
      } else {
        console.log(`Found ${data.length} greenhouses`);
      }

      setGreenhouses(data);
      setIsGreenhousesLoaded(true);
    } catch (error) {
      console.error('Error fetching greenhouses:', error);
      Alert.alert('Error', 'Failed to fetch greenhouses. Please try refreshing.');
      setIsGreenhousesLoaded(false);
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
        <FastImage 
          source={getImageSource(plant.Image)}
          style={styles.plantImage}
          resizeMode={FastImage.resizeMode.cover}
          fallback={true}
        />
        <View style={styles.plantInfo}>
          <Text style={styles.plantName}>{plant.Name}</Text>
          <Text style={styles.greenhouseName}>
          {greenhouses.find(g => g._id === plant.Greenhouse)?.Name || 'Unknown Greenhouse'}
          </Text>
          <View style={styles.statusContainer}>
            <Icon name="leaf" size={16} color="#0d986a" />
            <Text style={styles.statusText}>{plant.status || 'Healthy'}</Text>
          </View>
        </View>
        <View style={styles.cardHeaderActions}>

          {isPageVisible('Sensors') && (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => {
              refreshGreenhouses();
              handleEditPlant(plant);
            }}
          >
            <Icon name="pencil" size={20} color="#0d986a" />
          </TouchableOpacity>
          )}

          {isPageVisible('Sensors') && (
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => handleRemovePlant(plant._id || plant.id)}
          >
            <Icon name="delete" size={20} color="#ff4444" />
          </TouchableOpacity>
        )}

        {!isPageVisible('Sensors') && (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => {
              handleEditState(plant);
            }}
          >
            <Icon name="pencil" size={20} color="#0d986a" />
          </TouchableOpacity>
          )}
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


  const handleGreenhouseFilter = async (greenhouseId) => {
    setSelectedFilter(greenhouseId);
    setShowFilterPicker(false);
    setIsLoading(true);
    try {
      if (greenhouseId) {
        const baseUrl = getBaseUrl();
        const response = await fetch(`${baseUrl}/GetPlantsByGreenhouse/${greenhouseId}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        const plantsWithGreenhouseNames = data.map(plant => ({
          ...plant,
          greenhouseName: greenhouses.find(g => g._id === plant.Greenhouse)?.Name || 'Unknown Greenhouse'
        }));
        setSavedPlants(plantsWithGreenhouseNames);
      } else {
        await refreshPlants();
      }
    } catch (error) {
      console.error('Error filtering plants:', error);
      Alert.alert('Error', 'Failed to filter plants');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterPress = () => {
    if (!isGreenhousesLoaded || greenhouses.length === 0) {
      Alert.alert('Loading...', 'Please wait while greenhouses are loaded');
      return;
    }
    setShowCustomFilterModal(true);
  };

  // Custom filter modal
const renderCustomFilterModal = () => (
  <Modal
    visible={showCustomFilterModal}
    transparent
    animationType="fade"
    onRequestClose={() => setShowCustomFilterModal(false)}
  >
    <View style={{
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <View style={{
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '80%',
        alignItems: 'center'
      }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>
          Select Greenhouse
        </Text>
        <TouchableOpacity
          style={{ padding: 12, width: '100%', alignItems: 'center' }}
          onPress={() => {
            handleGreenhouseFilter('');
            setShowCustomFilterModal(false);
          }}
        >
          <Text style={{ fontSize: 16, color: 'green' }}>All Greenhouses</Text>
        </TouchableOpacity>
        {greenhouses.map(greenhouse => (
          <TouchableOpacity
            key={greenhouse._id}
            style={{ padding: 12, width: '100%', alignItems: 'center' }}
            onPress={() => {
              handleGreenhouseFilter(greenhouse._id);
              setShowCustomFilterModal(false);
            }}
          >
            <Text style={{ fontSize: 16, color: '#333' }}>{greenhouse.Name}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={{ marginTop: 12, padding: 8 }}
          onPress={() => setShowCustomFilterModal(false)}
        >
          <Text style={{ color: 'red', fontWeight: 'bold', fontSize: 16 }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);


  //Main page component
  return (
    <View style={{
      flex: 1,
      backgroundColor: '#f8f9fa',
    }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Plant Health</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={() => {
              setIsLoading(true);
              Promise.all([refreshPlants(), fetchGreenhouses()])
                .finally(() => setIsLoading(false));
            }}
          >
            <Icon name="refresh" size={24} color="#0d986a" />
          </TouchableOpacity>
          <TouchableOpacity 
             style={[styles.filterButton, selectedFilter && styles.filterButtonActive]}
             onPress={handleFilterPress}
          >
            <Icon name="filter-variant" size={24} color={selectedFilter ? "#fff" : "#0d986a"} />
          </TouchableOpacity>
        </View>
      </View>

      {selectedFilter && (
        <View style={styles.filterIndicator}>
          <Text style={styles.filterText}>
            Showing plants from: {greenhouses.find(g => g._id === selectedFilter)?.Name || 'Unknown Greenhouse'}
          </Text>
          <TouchableOpacity 
            style={styles.clearFilterButton}
            onPress={() => handleGreenhouseFilter('')}
          >
            <Icon name="close" size={16} color="#666" />
          </TouchableOpacity>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0d986a" />
          <Text style={styles.loadingText}>Loading plants...</Text>
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {SavedPlants.length > 0 ? (
            SavedPlants.map((plant) => renderPlantCard(plant))
          ) : (
            <View style={styles.noPlantsContainer}>
              <Icon name="leaf-off" size={48} color="#ccc" />
              <Text style={styles.noPlantsText}>
                {selectedFilter ? 'No plants found in this greenhouse' : 'No plants found'}
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {renderDetailsModal()}
      {renderEditModal()}
      {renderAddModal()}
      {renderEditStateModal()}

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => {
          refreshGreenhouses();
          setShowAddModal(true);
        }}
      >
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      {renderCustomFilterModal()}
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
    paddingBottom: 80,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    alignItems: 'center',
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  unitPicker: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 5,
    width: '45%',
  },
  saveButton: {
    backgroundColor: '#0d986a',
    padding: 15,
    borderRadius: 5,
    width: '45%',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  colon: {
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
  greenhouseFilter: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 150,
    backgroundColor: '#f1f9f5',
    borderRadius: 20,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  greenhousePicker: {
    width: '100%',
    height: 36,
    backgroundColor: 'transparent',
  },
  filterButtonActive: {
    backgroundColor: '#0d986a',
  },
  filterIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f9f5',
    padding: 8,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  filterText: {
    color: '#0d986a',
    fontSize: 14,
    marginRight: 8,
  },
  clearFilterButton: {
    padding: 4,
  },
  noPlantsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noPlantsText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
  sensorDataContainer: {
    marginBottom: 20,
  },
  sensorDataTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sensorDataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sensorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sensorItem: {
    flex: 1,
    alignItems: 'center',
  },
  sensorIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f9f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  sensorValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
});

export default PlantHealth;