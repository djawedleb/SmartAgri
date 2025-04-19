import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Modal, TextInput } from 'react-native';
import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as DocumentPicker from 'expo-document-picker';

const PlantHealth = () => {
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlant, setNewPlant] = useState({
    name: '',
    greenhouse: '',
    image: null,
    readings: {
      light: '35-45%',
      temperature: '25-27°C',
      humidity: '80%',
      water: '250ml'
    }
  });

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
      humidity: '80%',
      water: '150ml'
    }
  });

  const greenhouses = [
    {
      id: 1,
      name: 'Strawberry',
      greenhouse: 'GreenHouse 1',
      status: 'healthy',
      image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655',
      readings: {
        light: '35-45%',
        temperature: '25-27°C',
        humidity: '80%',
        water: '250ml'
      }
    },
    {
      id: 2,
      name: 'Blackberry',
      greenhouse: 'GreenHouse 2',
      status: 'healthy',
      image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655',
      readings: {
        light: '40-45%',
        temperature: '23-25°C',
        humidity: '80%',
        water: '150ml'
      }
    }
  ];

  const handleViewDetails = (plant) => {
    setSelectedPlant(plant);
    setShowDetails(true);
  };

  const handleRemovePlant = (plant) => {
    Alert.alert(
      'Remove Plant',
      `Are you sure you want to remove ${plant.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement remove functionality
            Alert.alert('Success', 'Plant removed successfully');
            setShowDetails(false);
          },
        },
      ],
    );
  };

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
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleGreenhouseSelect = (house) => {
    setNewPlant(prev => ({
      ...prev,
      greenhouse: house,
      readings: greenhouseData[house]
    }));
  };

  const handleAddPlant = () => {
    if (!newPlant.name || !newPlant.greenhouse) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // TODO: Implement actual API call to add plant
    Alert.alert('Success', 'Plant added successfully');
    setShowAddModal(false);
    setNewPlant({
      name: '',
      greenhouse: '',
      image: null,
      readings: {
        light: '35-45%',
        temperature: '25-27°C',
        humidity: '80%',
        water: '250ml'
      }
    });
  };

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
                onPress={() => handleRemovePlant(selectedPlant)}
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
                  source={{ uri: selectedPlant.image }} 
                  style={styles.detailsImage}
                />
                <View style={styles.detailsInfo}>
                  <Text style={styles.detailsName}>{selectedPlant.name}</Text>
                  <Text style={styles.detailsGreenhouse}>{selectedPlant.greenhouse}</Text>
                  <View style={styles.detailsStatus}>
                    <Icon name="leaf" size={16} color="#0d986a" />
                    <Text style={styles.detailsStatusText}>Healthy</Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailsReadings}>
                <Text style={styles.detailsSectionTitle}>Current Readings</Text>
                <View style={styles.detailsGrid}>
                  {renderReadingItem('white-balance-sunny', selectedPlant.readings.light, 'Light')}
                  {renderReadingItem('thermometer', selectedPlant.readings.temperature, 'Temperature')}
                  {renderReadingItem('water-percent', selectedPlant.readings.humidity, 'Humidity')}
                  {renderReadingItem('water', selectedPlant.readings.water, 'Water')}
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
                  {selectedPlant?.image ? 'Change Image' : 'Choose Image'}
                </Text>
              </TouchableOpacity>
              {selectedPlant?.image && (
                <View style={styles.selectedImageContainer}>
                  <Image 
                    source={{ uri: selectedPlant.image }} 
                    style={styles.selectedImage} 
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setSelectedPlant(prev => ({ ...prev, image: null }))}
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
              value={selectedPlant?.name}
              onChangeText={(text) => setSelectedPlant(prev => ({ ...prev, name: text }))}
            />

            {/* Greenhouse Selection */}
            <Text style={styles.inputLabel}>Greenhouse *</Text>
            <View style={styles.greenhouseSelector}>
              {['GreenHouse 1', 'GreenHouse 2'].map((house) => (
                <TouchableOpacity
                  key={house}
                  style={[
                    styles.greenhouseOption,
                    selectedPlant?.greenhouse === house && styles.greenhouseOptionSelected
                  ]}
                  onPress={() => handleGreenhouseSelect(house)}
                >
                  <Text style={[
                    styles.greenhouseOptionText,
                    selectedPlant?.greenhouse === house && styles.greenhouseOptionTextSelected
                  ]}>
                    {house}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Sensor Data Display */}
            {selectedPlant?.greenhouse && (
              <View style={styles.sensorDataContainer}>
                <Text style={styles.sensorDataTitle}>Sensor Readings</Text>
                <View style={styles.sensorDataGrid}>
                  <View style={styles.sensorRow}>
                    <View style={styles.sensorItem}>
                      <View style={styles.sensorIconWrapper}>
                        <Icon name="white-balance-sunny" size={18} color="#0d986a" />
                      </View>
                      <Text style={styles.sensorValue}>{selectedPlant.readings.light}</Text>
                    </View>
                    <View style={styles.sensorItem}>
                      <View style={styles.sensorIconWrapper}>
                        <Icon name="thermometer" size={18} color="#0d986a" />
                      </View>
                      <Text style={styles.sensorValue}>{selectedPlant.readings.temperature}</Text>
                    </View>
                  </View>
                  <View style={styles.sensorRow}>
                    <View style={styles.sensorItem}>
                      <View style={styles.sensorIconWrapper}>
                        <Icon name="water-percent" size={18} color="#0d986a" />
                      </View>
                      <Text style={styles.sensorValue}>{selectedPlant.readings.humidity}</Text>
                    </View>
                    <View style={styles.sensorItem}>
                      <View style={styles.sensorIconWrapper}>
                        <Icon name="water" size={18} color="#0d986a" />
                      </View>
                      <Text style={styles.sensorValue}>{selectedPlant.readings.water}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => {
                // TODO: Implement save functionality
                Alert.alert('Success', 'Plant updated successfully');
                setShowEditModal(false);
              }}
            >
              <Text style={styles.submitButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

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
        {greenhouses.map((greenhouse) => (
          <View key={greenhouse.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Image 
                source={{ uri: greenhouse.image }} 
                style={styles.plantImage}
              />
              <View style={styles.plantInfo}>
                <Text style={styles.plantName}>{greenhouse.name}</Text>
                <Text style={styles.greenhouseName}>{greenhouse.greenhouse}</Text>
                <View style={styles.statusContainer}>
                  <Icon name="leaf" size={16} color="#0d986a" />
                  <Text style={styles.statusText}>Healthy</Text>
                </View>
              </View>
              <View style={styles.cardHeaderActions}>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => setShowEditModal(true)}
                >
                  <Icon name="pencil" size={20} color="#0d986a" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => handleRemovePlant(greenhouse)}
                >
                  <Icon name="delete" size={20} color="#ff4444" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.readingsGrid}>
              {renderReadingItem('white-balance-sunny', greenhouse.readings.light, 'Light')}
              {renderReadingItem('thermometer', greenhouse.readings.temperature, 'Temperature')}
              {renderReadingItem('water-percent', greenhouse.readings.humidity, 'Humidity')}
              {renderReadingItem('water', greenhouse.readings.water, 'Water')}
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
                onPress={() => handleViewDetails(greenhouse)}
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
