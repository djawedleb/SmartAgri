import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal, Alert, Platform, Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as DocumentPicker from 'expo-document-picker';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { getBaseUrl } from '../../config';

const GreenHouses = () => {
  const GreenHouseImg = "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae";
  const [greenhouses, setGreenhouses] = useState([]);
  const [selectedGreenhouse, setSelectedGreenhouse] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    image: null,
    coordinates: null
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [plants, setPlants] = useState([]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to select greenhouse location');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setMapRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  // Fetch greenhouses when component mounts
  useEffect(() => {
    fetchGreenhouses();
  }, []);

  // Fetch plants when a greenhouse is selected
  useEffect(() => {
    if (selectedGreenhouse) {
      fetchPlantsByGreenhouse(selectedGreenhouse._id);
    }
  }, [selectedGreenhouse]);

  //to get all greenhouses from the server and display them
  const fetchGreenhouses = async () => {
    try {
      setIsRefreshing(true);
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/GetGreenhouses`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setGreenhouses(data);
    } catch (error) {
      console.error('Error fetching greenhouses:', error);
      Alert.alert('Error', 'Failed to fetch greenhouses');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Function to fetch plants by greenhouse ID
  const fetchPlantsByGreenhouse = async (greenhouseId) => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/GetPlantsByGreenhouse/${greenhouseId}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setPlants(data);
    } catch (error) {
      console.error('Error fetching plants:', error);
      Alert.alert('Error', 'Failed to fetch plants for this greenhouse');
    }
  };

  //to handle adding a location
  const handleMapPress = (e) => {
    const { coordinate } = e.nativeEvent;
    setSelectedLocation(coordinate);
    setFormData(prev => ({
      ...prev,
      coordinates: coordinate,
      location: `${coordinate.latitude.toFixed(6)}, ${coordinate.longitude.toFixed(6)}`
    }));
  };

  const handleLocationSelect = (result) => {
    const newRegion = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setMapRegion(newRegion);
    setSelectedLocation({
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    });
    setFormData(prev => ({
      ...prev,
      coordinates: {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
      },
      location: `${result.lat}, ${result.lon}`
    }));
    setShowResults(false);
    setSearchQuery(result.display_name);
  };

  // greenhouses readings
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

  //  to display the plants in the greenhouse view
  const renderPlantCard = (plant) => (
    <TouchableOpacity key={plant._id} style={styles.plantCard}>
      <Image 
        source={{ 
          uri: plant.Image ? 
            (plant.Image.startsWith('http') ? plant.Image : `${getBaseUrl()}${plant.Image}`) : 
            'https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797'
        }}
        style={styles.plantImage} 
      />
      <View style={styles.plantInfo}>
        <View style={styles.plantHeader}>
          <Text style={styles.plantName}>{plant.Name}</Text>
        </View>
        <View style={styles.plantDetails}>
          <Text style={styles.plantSize}>Status: {plant.status || 'Healthy'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // map card in the greenhouse view 
  const renderPropertyCard = (greenhouse) => (
    <View style={styles.propertyCard}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={{
            latitude: greenhouse.location.lat,
            longitude: greenhouse.location.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.2,
          }}
          scrollEnabled={false}
        >
          <Marker
            coordinate={{
              latitude: greenhouse.location.lat,
              longitude: greenhouse.location.lng,
            }}
            title={greenhouse.name}
          />
        </MapView>
        <View style={styles.mapOverlay}>
          <Text style={styles.mapTitle}>{greenhouse.name}</Text>
          <Text style={styles.mapSubtitle}>{greenhouse.owner}</Text>
        </View>
      </View>
    </View>
  );

  // the image selection when adding or editing
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

  // function to handle adding or updating greenhouse
  const handleAdd = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a greenhouse name');
      return;
    }
    if (!formData.location.trim()) {
      Alert.alert('Error', 'Please select a location');
      return;
    }
    
    try {
          const baseUrl = getBaseUrl();
          const response = await fetch(`${baseUrl}/AddGreenhouse`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          name: formData.name,
          location: formData.location,
          image: formData.image
        }),
          });
    
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }

      await fetchGreenhouses();
      Alert.alert('Success', `Created new greenhouse "${formData.name}"`);
      
          setIsModalVisible(false);
          setFormData({
            name: '',
            location: '',
        image: null
      });
    } catch (error) {
      console.error('Error adding greenhouse:', error);
      Alert.alert('Error', 'Failed to add greenhouse');
    }
  };

  const handleUpdate = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a greenhouse name');
      return;
    }
    if (!formData.location.trim()) {
      Alert.alert('Error', 'Please select a location');
      return;
    }
    
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/updateGreenhouse/${selectedGreenhouse._id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          name: formData.name,
          location: formData.location,
          image: formData.image
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      await fetchGreenhouses();
      Alert.alert('Success', `Updated greenhouse "${formData.name}"`);
      
      setIsModalVisible(false);
      setSelectedGreenhouse(null);
      setFormData({
        name: '',
        location: '',
        image: null
      });
      } catch (error) {
      console.error('Error updating greenhouse:', error);
      Alert.alert('Error', 'Failed to update greenhouse');
    }
  };

  const handleDeleteGreenhouse = async (id) => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/DeleteGreenhouse`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      await fetchGreenhouses();
      Alert.alert('Success', 'Greenhouse removed successfully');
    } catch (error) {
      console.error('Error deleting greenhouse:', error);
      Alert.alert('Error', 'Failed to delete greenhouse');
      }
  };

  // function to handle search in the search bar of map view
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'User-Agent': 'SmartAgri/1.0',
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSearchResults(data);
      setShowResults(isSearchFocused);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search for locations');
    }
  };

  // to display the map modal
  const renderMapModal = () => (
    <Modal
      visible={showMapModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowMapModal(false)}
    >
      <View style={styles.mapModalContainer}>
        <View style={styles.mapModalContent}>
          <View style={styles.mapModalHeader}>
            <Text style={styles.mapModalTitle}>Select Location</Text>
            <TouchableOpacity
              onPress={() => setShowMapModal(false)}
              style={styles.closeButton}
            >
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a location..."
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                if (text.trim()) {
                  handleSearch();
                } else {
                  setSearchResults([]);
                  setShowResults(false);
                }
              }}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => {
                setIsSearchFocused(false);
                setShowResults(false);
              }}
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
            >
              <Icon name="magnify" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          {showResults && isSearchFocused && searchResults.length > 0 && (
            <View style={styles.resultsContainer}>
              <ScrollView style={styles.resultsList}>
                {searchResults.map((result, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.resultItem}
                    onPress={() => {
                      handleLocationSelect(result);
                      setIsSearchFocused(false);
                      setShowResults(false);
                    }}
                  >
                    <Text style={styles.resultText}>{result.display_name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              region={mapRegion}
              onPress={handleMapPress}
            >
              {selectedLocation && (
                <Marker
                  coordinate={selectedLocation}
                  title="Selected Location"
                />
              )}
            </MapView>
          </View>
          <TouchableOpacity
            style={styles.selectLocationButton}
            onPress={() => {
              setShowMapModal(false);
            }}
          >
            <Text style={styles.selectLocationButtonText}>Select Location</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // to display the modal for adding or editing a greenhouse
  const renderModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isModalVisible}
      onRequestClose={() => {
        setIsModalVisible(false);
        setIsEditMode(false);
        setFormData({
          name: '',
          location: '',
          image: null,
          coordinates: null
        });
      }}
    >
      <View style={styles.modalOverlay}>
        <ScrollView>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditMode ? 'Modify Greenhouse' : 'Add New Greenhouse'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsModalVisible(false);
                  setIsEditMode(false);
                  setFormData({
                    name: '',
                    location: '',
                    image: null,
                    coordinates: null
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
              {/* 
              <TouchableOpacity 
                style={styles.imagePickerButton} 
                onPress={handleImageSelect}
              >
                <Icon name="image-plus" size={24} color="#666" />
                
                <Text style={styles.imagePickerText}>
                  {formData.image ? 'Change Image' : 'Choose Image'}
                </Text>
              </TouchableOpacity>
              */}
              {GreenHouseImg /* formData.image*/  && (
                <View style={styles.selectedImageContainer}>
                  <Image 
                    source={{ uri: GreenHouseImg /* formData.image*/ }} 
                    style={styles.selectedImage} 
                    resizeMode="cover"
                  />
                  {/* 
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setFormData(prev => ({ ...prev, image: null }))}
                  > 
                    <Icon name="close-circle" size={24} color="#FF4444" />
                  </TouchableOpacity>
                  */}
                </View>
              )}
            </View>

            {/* Name Input */}
            <Text style={styles.inputLabel}>Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter greenhouse name"
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            />

            {/* Location Input */}
            <Text style={styles.inputLabel}>Location *</Text>
            <TouchableOpacity
              style={styles.locationInput}
              onPress={() => setShowMapModal(true)}
            >
              <Icon name="map-marker" size={20} color="#0d986a" />
              <Text style={styles.locationText}>
                {formData.location || 'Select location on map'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={isEditMode ? handleUpdate : handleAdd}
            >
              <Text style={styles.submitButtonText}>
                {isEditMode ? 'Save Changes' : 'Add Greenhouse'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  // to display the greenhouses cards
  const renderGreenhouseCard = (greenhouse) => (
    <TouchableOpacity
      key={greenhouse._id}
      style={styles.greenhouseCard}
      onPress={() => setSelectedGreenhouse(greenhouse)}
    >
      <Image 
        source={{ uri: greenhouse.Image || GreenHouseImg }} 
        style={styles.greenhouseImage} 
      />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.greenhouseName}>{greenhouse.Name}</Text>
          <View style={styles.cardActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                setIsEditMode(true);
                setSelectedGreenhouse(greenhouse);
                setFormData({
                  name: greenhouse.Name,
                  location: greenhouse.Location,
                  image: greenhouse.Image
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
                      onPress: () => handleDeleteGreenhouse(greenhouse._id),
                    },
                  ],
                );
              }}
            >
              <Icon name="delete" size={20} color="#FF4444" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.sensorGrid}>
          <View style={styles.sensorItem}>
            <Icon name="white-balance-sunny" size={28} color="#0d986a" />
            <Text style={styles.sensorValue}>59%</Text>
          </View>
          <View style={styles.sensorDivider} />
          <View style={styles.sensorItem}>
            <Icon name="thermometer" size={28} color="#0d986a" />
            <Text style={styles.sensorValue}>30°C</Text>
          </View>
          <View style={styles.sensorDivider} />
          <View style={styles.sensorItem}>
            <Icon name="water-percent" size={28} color="#0d986a" />
            <Text style={styles.sensorValue}>65%</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // main render function
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {selectedGreenhouse && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setSelectedGreenhouse(null)}
          >
            <Icon name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>
          {selectedGreenhouse ? selectedGreenhouse.Name : 'Greenhouses'}
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={[styles.refreshButton, isRefreshing && styles.refreshButtonActive]}
            onPress={fetchGreenhouses}
            disabled={isRefreshing}
          >
            <Icon 
              name="refresh" 
              size={24} 
              color="#0d986a" 
              style={isRefreshing && styles.refreshingIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {selectedGreenhouse ? (
          // Detailed Greenhouse View
          <View>
            <Image 
              source={{ uri: selectedGreenhouse.Image || GreenHouseImg }} 
              style={styles.detailImage}
            />

            <Text style={styles.sectionTitle}>Plants</Text>
            <View style={styles.plantsContainer}>
              {plants.length > 0 ? (
                plants.map(renderPlantCard)
              ) : (
                <Text style={styles.noPlantsText}>No plants in this greenhouse</Text>
              )}
            </View>

            <Text style={styles.sectionTitle}>Property</Text>
            <View style={styles.propertyCard}>
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  region={{
                    latitude: parseFloat(selectedGreenhouse.Location.split(',')[0]),
                    longitude: parseFloat(selectedGreenhouse.Location.split(',')[1]),
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  scrollEnabled={false}
                >
                  <Marker
                    coordinate={{
                      latitude: parseFloat(selectedGreenhouse.Location.split(',')[0]),
                      longitude: parseFloat(selectedGreenhouse.Location.split(',')[1]),
                    }}
                    title={selectedGreenhouse.Name}
                  />
                </MapView>
                <View style={styles.mapOverlay}>
                  <Text style={styles.mapTitle}>{selectedGreenhouse.Name}</Text>
                  <Text style={styles.mapSubtitle}>Location: {selectedGreenhouse.Location}</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          greenhouses.map(renderGreenhouseCard)
        )}
      </ScrollView>

      {!selectedGreenhouse && (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Icon name="plus" size={24} color="white" />
        </TouchableOpacity>
      )}

      {renderModal()}
      {renderMapModal()}
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
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
  refreshButtonActive: {
    backgroundColor: '#e8f5e9',
  },
  refreshingIcon: {
    transform: [{ rotate: '45deg' }],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
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
    height: 180,
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
  greenhouseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f9f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  sensorGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  sensorItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  sensorDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e9ecef',
  },
  sensorValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  detailImage: {
    width: '100%',
    height: 250,
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
    flex: 1,
    width: '100%',
    height: 300,
  },
  map: {
    flex: 1,
    width: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    top: 0,
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
  mapModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  mapModalContent: {
    height: '60%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  mapModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  mapModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  selectLocationButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#0d986a',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 4,
  },
  selectLocationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  coordinatesContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#333',
    marginVertical: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  searchButton: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultsContainer: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    maxHeight: 200,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 5,
    zIndex: 2,
  },
  resultsList: {
    maxHeight: 200,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultText: {
    fontSize: 14,
    color: '#333',
  },
  plantsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  noPlantsText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 16,
  },
});

export default GreenHouses;