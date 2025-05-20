import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import { getBaseUrl } from '../../config';

export default function Sensors() {
  const [boards, setBoards] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [arduinoName, setArduinoName] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [greenhouses, setGreenhouses] = useState([]);
  const [selectedGreenhouse, setSelectedGreenhouse] = useState('');
  const [expandedBoardId, setExpandedBoardId] = useState(null);
  const [sensorData, setSensorData] = useState({});
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [connectionSensorData, setConnectionSensorData] = useState(null);

  const handleAddSensor = () => {
    setIsModalVisible(true);
  };

  const testConnection = async () => {
    if (!ipAddress) {
      Alert.alert('Error', 'Please enter an IP address');
      return;
    }

    setIsConnecting(true);
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/arduino-data/${ipAddress}`);
      if (!response.ok) {
        throw new Error('Failed to connect to Arduino');
      }
      const data = await response.json();
      setConnectionSensorData(data);
      setIsConnected(true);
      
      // Fetch greenhouses for selection
      const greenhouseResponse = await fetch(`${baseUrl}/GetGreenhouses`);
      if (!greenhouseResponse.ok) {
        throw new Error('Failed to fetch greenhouses');
      }
      const greenhouseData = await greenhouseResponse.json();
      console.log('Fetched greenhouses:', greenhouseData); // Debug log
      setGreenhouses(greenhouseData);
    } catch (error) {
      console.error('Connection error:', error);
      Alert.alert('Connection Error', 'Failed to connect to Arduino. Please check the IP address and try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSubmit = async () => {
    if (!arduinoName || !ipAddress || !selectedGreenhouse) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      // Add the new board to the state
      const newBoard = {
        id: Date.now(), // temporary ID, should come from backend
        name: arduinoName,
        ipAddress: ipAddress,
        greenhouseId: selectedGreenhouse,
        greenhouseName: greenhouses.find(g => g._id === selectedGreenhouse)?.Name || 'Unknown',
        status: 'active'
      };

      setBoards(prevBoards => [...prevBoards, newBoard]);
      
      Alert.alert('Success', 'Arduino board added successfully');
      setIsModalVisible(false);
      // Reset form
      setArduinoName('');
      setIpAddress('');
      setSelectedGreenhouse('');
      setIsConnected(false);
      setGreenhouses([]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add Arduino board');
    }
  };

  const handleEditBoard = (boardId) => {
    const board = boards.find(b => b.id === boardId);
    if (board) {
      setEditingBoard(board);
      setArduinoName(board.name);
      setSelectedGreenhouse(board.greenhouseId);
      setIsEditModalVisible(true);
    }
  };

  const handleUpdateBoard = async () => {
    if (!arduinoName || !selectedGreenhouse) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      // Here you would make an API call to update the Arduino board
      // For example:
      // const response = await fetch(`/api/arduino-boards/${editingBoard.id}`, {
      //   method: 'PUT',
      //   body: JSON.stringify({
      //     name: arduinoName,
      //     greenhouseId: selectedGreenhouse
      //   })
      // });

      // Update the board in the state
      setBoards(prevBoards => 
        prevBoards.map(board => 
          board.id === editingBoard.id 
            ? {
                ...board,
                name: arduinoName,
                greenhouseId: selectedGreenhouse,
                greenhouseName: greenhouses.find(g => g._id === selectedGreenhouse)?.Name || 'Unknown'
              }
            : board
        )
      );

      Alert.alert('Success', 'Arduino board updated successfully');
      setIsEditModalVisible(false);
      // Reset form
      setArduinoName('');
      setSelectedGreenhouse('');
      setEditingBoard(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to update Arduino board');
    }
  };

  const handleDeleteBoard = (boardId) => {
    Alert.alert(
      'Delete Board',
      'Are you sure you want to delete this Arduino board?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            setBoards(prevBoards => prevBoards.filter(board => board.id !== boardId));
            Alert.alert('Success', 'Arduino board deleted successfully');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleAddSensorToBoard = (boardId) => {
    Alert.alert('Add Sensor', 'This feature will be implemented soon.');
  };

  const handleCardPress = async (boardId) => {
    if (expandedBoardId === boardId) {
      setExpandedBoardId(null);
      return;
    }

    setExpandedBoardId(boardId);
    const board = boards.find(b => b.id === boardId);
    if (board) {
      const data = await fetchSensorData(board.ipAddress);
      if (data) {
        setSensorData(prev => ({
          ...prev,
          [boardId]: data
        }));
      }
    }
  };

  // Function to fetch sensor data from Arduino
  const fetchSensorData = async (ipAddress) => {
    try {
      setIsLoadingData(true);
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/arduino-data/${ipAddress}`);
      if (!response.ok) {
        throw new Error('Failed to fetch sensor data');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      return null;
    } finally {
      setIsLoadingData(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Arduino Boards</Text>
        <Pressable style={styles.addButton} onPress={handleAddSensor}>
          <Icon name="plus" size={24} color="white" />
        </Pressable>
      </View>

      <View style={styles.section}>
        {boards.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="chip" size={64} color="#0d986a" />
            <Text style={styles.emptyStateText}>No Arduino boards added yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Add your first Arduino board to start monitoring
            </Text>
          </View>
        ) : (
          <View style={styles.boardsList}>
            {boards.map((board) => (
              <View key={board.id}>
                <Pressable 
                  style={[styles.boardCard, expandedBoardId === board.id && styles.expandedCard]}
                  onPress={() => handleCardPress(board.id)}
                >
                  <View style={styles.boardHeader}>
                    <View style={styles.boardInfo}>
                      <View style={styles.nameContainer}>
                        <Icon name="raspberry-pi" size={28} color="#0d986a" />
                        <View>
                          <Text style={styles.boardName}>{board.name}</Text>
                          <Text style={styles.boardIp}>IP: {board.ipAddress}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.boardStatus}>
                      <Icon name="circle" size={12} color="#0d986a" />
                      <Text style={styles.statusText}>Active</Text>
                    </View>
                  </View>
                  
                  <View style={styles.boardDetails}>
                    <View style={styles.detailItem}>
                      <Icon name="greenhouse" size={24} color="#0d986a" />
                      <Text style={styles.detailText}>{board.greenhouseName}</Text>
                    </View>
                    <View style={styles.boardActions}>
                      <Pressable 
                        style={({ pressed }) => [
                          styles.actionButton,
                          styles.editButton,
                          pressed && styles.buttonPressed
                        ]}
                        onPress={() => handleEditBoard(board.id)}
                      >
                        <Icon name="pencil" size={22} color="white" />
                      </Pressable>
                      <Pressable 
                        style={({ pressed }) => [
                          styles.actionButton,
                          styles.deleteButton,
                          pressed && styles.buttonPressed
                        ]}
                        onPress={() => handleDeleteBoard(board.id)}
                      >
                        <Icon name="delete" size={22} color="white" />
                      </Pressable>
                    </View>
                  </View>
                </Pressable>

                {expandedBoardId === board.id && (
                  <View style={styles.sensorsSection}>
                    <View style={styles.sensorsHeader}>
                      <Text style={styles.sensorsTitle}>Sensor Data</Text>
                      <Text style={styles.lastUpdate}>
                        Last update: {new Date().toLocaleTimeString()}
                      </Text>
                    </View>
                    
                    {isLoadingData ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#0d986a" />
                        <Text style={styles.loadingText}>Fetching sensor data...</Text>
                      </View>
                    ) : sensorData[board.id] ? (
                      <View style={styles.sensorsList}>
                        {Object.entries(sensorData[board.id]).map(([sensorName, value]) => (
                          <View key={sensorName} style={styles.sensorItem}>
                            <View style={styles.sensorInfo}>
                              <Icon 
                                name={getSensorIcon(sensorName)} 
                                size={24} 
                                color="#0d986a" 
                              />
                              <View>
                                <Text style={styles.sensorName}>
                                  {formatSensorName(sensorName)}
                                </Text>
                                <Text style={styles.sensorValue}>
                                  {formatSensorValue(sensorName, value)}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.sensorStatus}>
                              <Icon name="circle" size={8} color="#0d986a" />
                              <Text style={styles.sensorStatusText}>Active</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <View style={styles.noData}>
                        <Icon name="alert-circle" size={40} color="#ff4444" />
                        <Text style={styles.noDataText}>Unable to fetch sensor data</Text>
                        <Text style={styles.noDataSubtext}>
                          Please check if the Arduino board is connected and try again
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Arduino Board</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Arduino Name"
              value={arduinoName}
              onChangeText={setArduinoName}
            />

            <TextInput
              style={styles.input}
              placeholder="IP Address (e.g., 192.168.1.100)"
              value={ipAddress}
              onChangeText={setIpAddress}
              keyboardType="numeric"
            />

            {!isConnected ? (
              <Pressable 
                style={[styles.button, styles.testButton]} 
                onPress={testConnection}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Test Connection</Text>
                )}
              </Pressable>
            ) : (
              <>
                <Text style={styles.successText}>✓ Connected successfully!</Text>
                
                {/* Sensor Data Preview */}
                <View style={styles.sensorPreview}>
                  <Text style={styles.sensorPreviewTitle}>Sensor Data Preview</Text>
                  <View style={styles.sensorPreviewList}>
                    {connectionSensorData && Object.entries(connectionSensorData).map(([sensorName, value]) => (
                      <View key={sensorName} style={styles.sensorPreviewItem}>
                        <Icon 
                          name={getSensorIcon(sensorName)} 
                          size={24} 
                          color="#0d986a" 
                        />
                        <View style={styles.sensorPreviewInfo}>
                          <Text style={styles.sensorPreviewName}>
                            {formatSensorName(sensorName)}
                          </Text>
                          <Text style={styles.sensorPreviewValue}>
                            {formatSensorValue(sensorName, value)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

                <Text style={styles.label}>Select Greenhouse:</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedGreenhouse}
                    onValueChange={(value) => setSelectedGreenhouse(value)}
                    style={styles.picker}
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
              </>
            )}

            <View style={styles.modalButtons}>
              <Pressable 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => {
                  setIsModalVisible(false);
                  setArduinoName('');
                  setIpAddress('');
                  setSelectedGreenhouse('');
                  setIsConnected(false);
                  setConnectionSensorData(null);
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={[styles.button, styles.submitButton]} 
                onPress={handleSubmit}
                disabled={!isConnected || !selectedGreenhouse}
              >
                <Text style={styles.buttonText}>Add Board</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Arduino Board</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Arduino Name"
              value={arduinoName}
              onChangeText={setArduinoName}
            />

            <Text style={styles.label}>Select Greenhouse:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedGreenhouse}
                onValueChange={(value) => setSelectedGreenhouse(value)}
                style={styles.picker}
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

            <View style={styles.modalButtons}>
              <Pressable 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => {
                  setIsEditModalVisible(false);
                  setArduinoName('');
                  setSelectedGreenhouse('');
                  setEditingBoard(null);
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={[styles.button, styles.submitButton]} 
                onPress={handleUpdateBoard}
                disabled={!selectedGreenhouse}
              >
                <Text style={styles.buttonText}>Update Board</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// Helper functions for sensor data formatting
const getSensorIcon = (sensorName) => {
  const icons = {
    temperature: 'thermometer',
    humidity: 'water-percent',
    soilMoisture: 'water',
    light: 'white-balance-sunny',
    ph: 'ph',
  };
  return icons[sensorName] || 'sensor';
};

const formatSensorName = (sensorName) => {
  return sensorName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase());
};

const formatSensorValue = (sensorName, value) => {
  const units = {
    temperature: '°C',
    humidity: '%',
    soilMoisture: '%',
    light: 'lux',
    ph: 'pH',
  };
  return `${value} ${units[sensorName] || ''}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#0d986a',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  sensorsList: {
    padding: 20,
  },
  sensorCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sensorInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  sensorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sensorType: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  sensorStatus: {
    fontSize: 14,
    color: '#0d986a',
    fontWeight: '500',
  },
  sensorStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 5,
    color: '#666',
  },
  sensorActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  editButton: {
    backgroundColor: '#0d986a',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
  },
  actionButtonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  testButton: {
    backgroundColor: '#0d986a',
  },
  submitButton: {
    backgroundColor: '#0d986a',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  successText: {
    color: '#0d986a',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 15,
  },
  picker: {
    height: 50,
  },
  section: {
    padding: 20,
  },
  boardsList: {
    gap: 15,
  },
  boardCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4.65,
    elevation: 8,
  },
  boardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  boardInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  boardName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  boardIp: {
    fontSize: 14,
    color: '#666',
  },
  boardStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0f9f4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    color: '#0d986a',
    fontWeight: '500',
  },
  boardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 15,
    color: '#444',
    fontWeight: '500',
  },
  boardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  editButton: {
    backgroundColor: '#0d986a',
    borderWidth: 1,
    borderColor: '#0a7a54',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    borderWidth: 1,
    borderColor: '#cc3333',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  expandedCard: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  sensorsSection: {
    backgroundColor: '#f8f9fa',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sensorsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sensorsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  lastUpdate: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  sensorsList: {
    gap: 10,
  },
  sensorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sensorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sensorName: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  sensorValue: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  sensorStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f0f9f4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sensorStatusText: {
    fontSize: 12,
    color: '#0d986a',
    fontWeight: '500',
  },
  noData: {
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginTop: 10,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  sensorPreview: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginVertical: 15,
  },
  sensorPreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  sensorPreviewList: {
    gap: 10,
  },
  sensorPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sensorPreviewInfo: {
    marginLeft: 12,
  },
  sensorPreviewName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  sensorPreviewValue: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
}); 