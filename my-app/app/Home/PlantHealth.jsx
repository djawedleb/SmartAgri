import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Modal, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as DocumentPicker from 'expo-document-picker';
import { getBaseUrl } from '../../config';

const PlantHealth = () => {
  const [selectedPlant, setSelectedPlant] = useState(null); //to have the data of a selected plant when editing, deleting, or viewing details
  const [showDetails, setShowDetails] = useState(false); //triggers the plant details modal
  const [showEditModal, setShowEditModal] = useState(false); //triggers the edit plant modal
  const [showAddModal, setShowAddModal] = useState(false); //triggers the add plant modal, when clicking the plus icon it becomes true
  const [SavedPlants, setSavedPlants] = useState([]); //to get and display all the saved plants

  const [newPlant, setNewPlant] = useState({  //a hook to store the new plant data
    name: '',
    greenhouse: '',
    image: null,
    readings: {
      light: '',
      temperature: '',
      humidity: '',
      water: ''
    }
  });

  //Mock data for greenhouse sensor readings
  const [greenhouseData, setGreenhouseData] = useState({
    'GreenHouse 1': {
      light: '35-45%',
      temperature: '25-27°C',
      humidity: '80%',
      water: '250ml'
    },
    'GreenHouse 2': {
      light: '40-45%',
      temperature: '23-25°C',
      humidity: '70%',
      water: '150ml'
    }
  });

  //static data for the plants, to be replaced with data from the database
  const plants = [
    {
      id: 1,
      Name: 'Potatoes',
      Greenhouse: 'GreenHouse 1',
      status: 'healthy',
      Image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655',
    }
  ];

  //to display the added users
  useEffect(() => {
    refreshPlants();
  }, []);

  const handleViewDetails = (plant) => {
    setSelectedPlant(plant);
    //console.log(selectedPlant);
    setShowDetails(true);
  };


  //when deleting a plant,also show an alert to confirm the action
  const handleRemovePlant = async (id) => {
    Alert.alert(
          'Delete User',
          'Are you sure you want to delete this user?',
          [
            {
              text: 'Cancel',
              style: 'cancel', //cancel action
            },
            {
              text: 'delete',
              style: 'destructive',
              onPress: () => {
                handleDelete(id); // Call the delete function
              },
            },
          ],
          { cancelable: true } //makes the alert dialog dismissible by tapping outside of it.
        );
  };

  //Too delete a user from the database and the interface
  const handleDelete = async (id) => {
  
    //Actual deletion from the database//
     const Deletion = async () => {
       try {
           const baseUrl = getBaseUrl();
           const response = await fetch(`${baseUrl}/DeletePlant`, {
               method: 'POST',
               headers: {'Content-Type': 'application/json',},
               body: JSON.stringify({ id }), 
           });
  
           if (!response.ok) {
               console.error('Network response was not ok:', response.statusText);
               throw new Error('Network response was not ok');
           }
           const result = await response.json();
          //Alert.alert('Success', 'Plant Removed successfully');
           // Refresh the plant list after Removing
           setShowDetails(false);
           refreshPlants();
  
       } catch (error) {
           console.error('There was an error!', error);
       }
   };
     Deletion();
  
   }

  const handleImageSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        setNewPlant(prev => ({
          ...prev,
          image: result.uri
        }
      ));
      //console.log('Selected image:', newPlant.image);
    }

    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
    }
  };

  //changing plant(greenhouse and readings) data when selecting a greenhouse
  const handleGreenhouseSelect = (house) => {
    setNewPlant(prev => ({
      ...prev,
      greenhouse: house,
      readings: greenhouseData[house]
    }));
    setSelectedPlant(prev => ({
      ...prev,
      Greenhouse: house,
      readings: greenhouseData[house]
    }));
    
  };

  // Function to refresh the plant list
  const refreshPlants = async () => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/GetPlants`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      console.log(data);
      setSavedPlants([...plants, ...data]); //spreads and combines both arrays
    } catch (error) {
      console.error('Error refreshing plants:', error);
    }
  };

   // Function to handle adding a new plant
  const handleAddPlant = async () => {
    if (!newPlant.name || !newPlant.greenhouse) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/AddPlant`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newPlant),
      });

      if (!response.ok) {
          console.error('Network response was not ok:', response.statusText);
          throw new Error('Network response was not ok');
      }
      const result = await response.json();
  
    console.log('New plant data:', newPlant); // Log the new plant data for debugging
    Alert.alert('Success', 'Plant added successfully');
    setShowAddModal(false);
    setNewPlant({  //to reset the hook after adding a new plant
      name: '',
      greenhouse: '',
      image: null,
      readings: {
        light: '',
        temperature: '',
        humidity: '',
        water: ''
      }
    });
    // Refresh the plant list after adding
    refreshPlants();
  } catch (error) {
      console.error('There was an error!', error);
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
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/updatePlant/${selectedPlant._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedPlant.Name,
          greenhouse: selectedPlant.Greenhouse,
          image: selectedPlant.Image
        })
      });
  
      if (!response.ok) throw new Error('Failed to update plant');

      Alert.alert('Success', 'Plant updated successfully');
      setShowEditModal(false);
      if(showDetails===false){
        setSelectedPlant(null);
      }
      refreshPlants();
    } catch (error) {
      console.error('Error updating plant:', error);
      Alert.alert('Error', 'Failed to update plant');
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
                onPress={() => handleRemovePlant(selectedPlant._id)}
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
                  source={{ uri: selectedPlant.Image }} 
                  style={styles.detailsImage}
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
                  {renderReadingItem('white-balance-sunny', greenhouseData[selectedPlant.Greenhouse]?.light || 'N/A', 'Light')}
                  {renderReadingItem('thermometer', greenhouseData[selectedPlant.Greenhouse]?.temperature || 'N/A', 'Temperature')}
                  {renderReadingItem('water-percent', greenhouseData[selectedPlant.Greenhouse]?.humidity || 'N/A', 'Humidity')}
                  {renderReadingItem('water', greenhouseData[selectedPlant.Greenhouse]?.water || 'N/A', 'Water')}
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
                    source={{ uri: selectedPlant.Image }} 
                    style={styles.selectedImage} 
                    resizeMode="cover"
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
            <View style={styles.greenhouseSelector}>
              {['GreenHouse 1', 'GreenHouse 2'].map((house) => (
                <TouchableOpacity
                  key={house}
                  style={[
                    styles.greenhouseOption,
                    selectedPlant?.Greenhouse === house && styles.greenhouseOptionSelected
                  ]}
                  onPress={() => handleGreenhouseSelect(house)}
                >
                  <Text style={[
                    styles.greenhouseOptionText,
                    selectedPlant?.Greenhouse === house && styles.greenhouseOptionTextSelected
                  ]}>
                    {house}
                  </Text>
                </TouchableOpacity>
              ))}
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
                      <Text style={styles.sensorValue}>{greenhouseData[selectedPlant.Greenhouse]?.light || 'N/A'}</Text>
                    </View>
                    <View style={styles.sensorItem}>
                      <View style={styles.sensorIconWrapper}>
                        <Icon name="thermometer" size={18} color="#0d986a" />
                      </View>
                      <Text style={styles.sensorValue}>{greenhouseData[selectedPlant.Greenhouse]?.temperature || 'N/A'}</Text>
                    </View>
                  </View>
                  <View style={styles.sensorRow}>
                    <View style={styles.sensorItem}>
                      <View style={styles.sensorIconWrapper}>
                        <Icon name="water-percent" size={18} color="#0d986a" />
                      </View>
                      <Text style={styles.sensorValue}>{greenhouseData[selectedPlant.Greenhouse]?.humidity || 'N/A'}</Text>
                    </View>
                    <View style={styles.sensorItem}>
                      <View style={styles.sensorIconWrapper}>
                        <Icon name="water" size={18} color="#0d986a" />
                      </View>
                      <Text style={styles.sensorValue}>{greenhouseData[selectedPlant.Greenhouse]?.water || 'N/A'}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => {
                // TODO: Implement save functionality
                handleEdit();
                //setShowEditModal(false);
              }}
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
    if (!newPlant.greenhouse) return null;

    return (
      <View style={styles.sensorDataContainer}>
        <Text style={styles.sensorDataTitle}>Sensor Readings</Text>
        <View style={styles.sensorDataGrid}>
          <View style={styles.sensorRow}>
            <View style={styles.sensorItem}>
              <View style={styles.sensorIconWrapper}>
                <Icon name="white-balance-sunny" size={18} color="#0d986a" />
              </View>
              <Text style={styles.sensorValue}>{newPlant.readings.light}</Text>
            </View>
            <View style={styles.sensorItem}>
              <View style={styles.sensorIconWrapper}>
                <Icon name="thermometer" size={18} color="#0d986a" />
              </View>
              <Text style={styles.sensorValue}>{newPlant.readings.temperature}</Text>
            </View>
          </View>
          <View style={styles.sensorRow}>
            <View style={styles.sensorItem}>
              <View style={styles.sensorIconWrapper}>
                <Icon name="water-percent" size={18} color="#0d986a" />
              </View>
              <Text style={styles.sensorValue}>{newPlant.readings.humidity}</Text>
            </View>
            <View style={styles.sensorItem}>
              <View style={styles.sensorIconWrapper}>
                <Icon name="water" size={18} color="#0d986a" />
              </View>
              <Text style={styles.sensorValue}>{newPlant.readings.water}</Text>
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
      onRequestClose={() => setShowAddModal(false)}
    >
      <View style={styles.modalOverlay}>
        <ScrollView>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Plant</Text>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
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
                  {newPlant.image ? 'Change Image' : 'Choose Image'}
                </Text>
              </TouchableOpacity>
              {newPlant.image && (
                <View style={styles.selectedImageContainer}>
                  <Image 
                    source={{ uri: newPlant.image }} 
                    style={styles.selectedImage} 
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setNewPlant(prev => ({ ...prev, image: null }))}
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
              value={newPlant.name}
              onChangeText={(text) => setNewPlant(prev => ({ ...prev, name: text }))}
            />

            {/* Greenhouse Selection */}
            <Text style={styles.inputLabel}>Greenhouse *</Text>
            <View style={styles.greenhouseSelector}>
              {['GreenHouse 1', 'GreenHouse 2'].map((house) => (
                <TouchableOpacity
                  key={house}
                  style={[
                    styles.greenhouseOption,
                    newPlant.greenhouse === house && styles.greenhouseOptionSelected
                  ]}
                  onPress={() => handleGreenhouseSelect(house)}
                >
                  <Text style={[
                    styles.greenhouseOptionText,
                    newPlant.greenhouse === house && styles.greenhouseOptionTextSelected
                  ]}>
                    {house}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Sensor Data Display */}
            {renderSensorData()}

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAddPlant}
            >
              <Text style={styles.submitButtonText}>Add</Text>
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
  
  //Main page component
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Plant Health</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="filter-variant" size={24} color="#0d986a" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {SavedPlants.map((plant) => ( // for each plant in the savedPlants array, render a card
          <View key={`${plant.Name}-${plant.Greenhouse}`} style={styles.card}>
            <View style={styles.cardHeader}>
              <Image 
                source={{ uri: plant.Image }} 
                style={styles.plantImage}
              />
              <View style={styles.plantInfo}>
                <Text style={styles.plantName}>{plant.Name}</Text>
                <Text style={styles.greenhouseName}>{plant.Greenhouse}</Text>
                <View style={styles.statusContainer}>
                  <Icon name="leaf" size={16} color="#0d986a" />
                  <Text style={styles.statusText}>Healthy</Text>
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
                  onPress={() => handleRemovePlant(plant._id)}
                >
                  <Icon name="delete" size={20} color="#ff4444" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.readingsGrid}>
              {renderReadingItem('white-balance-sunny', greenhouseData[plant.Greenhouse]?.light || 'N/A', 'Light')}
              {renderReadingItem('thermometer', greenhouseData[plant.Greenhouse]?.temperature || 'N/A', 'Temperature')}
              {renderReadingItem('water-percent', greenhouseData[plant.Greenhouse]?.humidity || 'N/A', 'Humidity')}
              {renderReadingItem('water', greenhouseData[plant.Greenhouse]?.water || 'N/A', 'Water')}
            </View>

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
        ))}
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
    marginBottom: 16,
  },
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
  sensorDataContainer: {
    marginTop: 16,
    backgroundColor: '#f1f9f5',
    borderRadius: 12,
    padding: 12,
  },
  sensorDataTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sensorDataGrid: {
    gap: 8,
  },
  sensorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sensorItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    gap: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sensorIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sensorValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
});

export default PlantHealth;
