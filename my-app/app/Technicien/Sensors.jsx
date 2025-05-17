import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Modal, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Sensors() {
  const [sensors, setSensors] = useState([]);
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [selectedArduino, setSelectedArduino] = useState(null);

  // Mock data for existing Arduino boards
  const arduinoBoards = [
    { id: 1, name: 'Arduino Uno', location: 'Greenhouse 1', status: 'Active' },
    { id: 2, name: 'Arduino Mega', location: 'Greenhouse 2', status: 'Active' },
    { id: 3, name: 'Arduino Nano', location: 'Greenhouse 3', status: 'Inactive' },
  ];

  // Mock data for greenhouses
  const greenhouses = [
    { id: 1, name: 'Greenhouse 1', location: 'North Field' },
    { id: 2, name: 'Greenhouse 2', location: 'South Field' },
    { id: 3, name: 'Greenhouse 3', location: 'East Field' },
  ];

  // Mock data for sensors
  const sensorTypes = [
    { id: 1, name: 'Temperature Sensor', icon: 'thermometer', type: 'Temperature' },
    { id: 2, name: 'Humidity Sensor', icon: 'water-percent', type: 'Humidity' },
    { id: 3, name: 'Soil Moisture Sensor', icon: 'water', type: 'Moisture' },
    { id: 4, name: 'Light Sensor', icon: 'white-balance-sunny', type: 'Light' },
  ];

  const handleAddSensor = () => {
    setAddModalVisible(true);
  };

  const handleEditSensor = (sensorId) => {
    Alert.alert('Edit Sensor', 'This feature will be implemented soon.');
  };

  const handleDeleteSensor = (sensorId) => {
    Alert.alert(
      'Delete Sensor',
      'Are you sure you want to delete this sensor?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            // Delete sensor logic will be implemented
            Alert.alert('Success', 'Sensor deleted successfully');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const AddSensorModal = () => (
    <Modal
      visible={isAddModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setAddModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Board</Text>
            <Pressable onPress={() => setAddModalVisible(false)}>
              <Icon name="close" size={24} color="#666" />
            </Pressable>
          </View>

          <ScrollView 
            style={styles.modalBody}
            contentContainerStyle={styles.modalBodyContent}
          >
            {/* Arduino Selection Section */}
            <Text style={styles.sectionTitle}>Select Arduino</Text>
            <View style={styles.arduinoList}>
              {arduinoBoards.map((arduino) => (
                <Pressable
                  key={arduino.id}
                  style={[
                    styles.arduinoCard,
                    selectedArduino?.id === arduino.id && styles.selectedArduinoCard
                  ]}
                  onPress={() => setSelectedArduino(arduino)}
                >
                  <View style={styles.arduinoInfo}>
                    <Text style={styles.arduinoName}>{arduino.name}</Text>
                    <Text style={styles.arduinoLocation}>{arduino.location}</Text>
                  </View>
                  <View style={styles.arduinoStatus}>
                    <Icon 
                      name={arduino.status === 'Active' ? 'check-circle' : 'alert-circle'} 
                      size={20} 
                      color={arduino.status === 'Active' ? '#4CAF50' : '#FFA000'} 
                    />
                    <Text style={[
                      styles.arduinoStatusText,
                      { color: arduino.status === 'Active' ? '#4CAF50' : '#FFA000' }
                    ]}>
                      {arduino.status}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>

            {/* Sensors Display Section */}
            {selectedArduino && (
              <>
                <Text style={styles.sectionTitle}>Available Sensors</Text>
                <View style={styles.sensorsGrid}>
                  {sensorTypes.map((sensor) => (
                    <View key={sensor.id} style={styles.sensorItem}>
                      <Icon name={sensor.icon} size={24} color="#0d986a" />
                      <Text style={styles.sensorItemName}>{sensor.name}</Text>
                      <Text style={styles.sensorItemType}>{sensor.type}</Text>
                    </View>
                  ))}
                </View>

                {/* Greenhouse Selection Section */}
                <Text style={styles.sectionTitle}>Select Greenhouse</Text>
                <View style={styles.greenhouseList}>
                  {greenhouses.map((greenhouse) => (
                    <Pressable
                      key={greenhouse.id}
                      style={styles.greenhouseCard}
                    >
                      <View style={styles.greenhouseInfo}>
                        <Text style={styles.greenhouseName}>{greenhouse.name}</Text>
                        <Text style={styles.greenhouseLocation}>{greenhouse.location}</Text>
                      </View>
                      <Icon name="chevron-right" size={24} color="#666" />
                    </Pressable>
                  ))}
                </View>

                {/* Connect Button */}
                <View style={styles.connectButtonContainer}>
                  <Pressable 
                    style={styles.connectButton}
                    onPress={() => {
                      // Connect logic will be implemented
                      setAddModalVisible(false);
                      Alert.alert('Success', 'Board connected successfully');
                    }}
                  >
                    <Icon name="link-variant" size={24} color="white" />
                    <Text style={styles.connectButtonText}>Connect Board</Text>
                  </Pressable>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sensor Management</Text>
        <Pressable style={styles.addButton} onPress={handleAddSensor}>
          <Icon name="plus" size={24} color="white" />
        </Pressable>
      </View>

      {sensors.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="chip" size={64} color="#0d986a" />
          <Text style={styles.emptyStateText}>No sensors added yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Add your first sensor to start monitoring
          </Text>
        </View>
      ) : (
        <View style={styles.sensorsList}>
          {sensors.map((sensor, index) => (
            <View key={index} style={styles.sensorCard}>
              <View style={styles.sensorInfo}>
                <View>
                  <Text style={styles.sensorName}>{sensor.name}</Text>
                  <Text style={styles.sensorType}>{sensor.type}</Text>
                </View>
                <Text style={styles.sensorStatus}>{sensor.status}</Text>
              </View>
              <View style={styles.sensorStats}>
                <View style={styles.stat}>
                  <Icon name="battery" size={20} color="#0d986a" />
                  <Text style={styles.statText}>{sensor.batteryLevel}%</Text>
                </View>
                <View style={styles.stat}>
                  <Icon name="signal" size={20} color="#0d986a" />
                  <Text style={styles.statText}>{sensor.signalStrength}%</Text>
                </View>
                <View style={styles.stat}>
                  <Icon name="clock-outline" size={20} color="#0d986a" />
                  <Text style={styles.statText}>{sensor.lastUpdate}</Text>
                </View>
              </View>
              <View style={styles.sensorActions}>
                <Pressable 
                  style={[styles.actionButton, styles.editButton]} 
                  onPress={() => handleEditSensor(sensor.id)}
                >
                  <Icon name="pencil" size={20} color="white" />
                  <Text style={styles.actionButtonText}>Edit</Text>
                </Pressable>
                <Pressable 
                  style={[styles.actionButton, styles.deleteButton]} 
                  onPress={() => handleDeleteSensor(sensor.id)}
                >
                  <Icon name="delete" size={20} color="white" />
                  <Text style={styles.actionButtonText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      <AddSensorModal />
    </ScrollView>
  );
}

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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    flex: 1,
  },
  modalBodyContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  arduinoList: {
    marginBottom: 20,
  },
  arduinoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  selectedArduinoCard: {
    borderColor: '#0d986a',
    borderWidth: 2,
  },
  arduinoInfo: {
    flex: 1,
  },
  arduinoName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  arduinoLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  arduinoStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arduinoStatusText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
  },
  sensorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sensorItem: {
    width: '48%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  sensorItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
  sensorItemType: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  greenhouseList: {
    marginBottom: 20,
  },
  greenhouseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  greenhouseInfo: {
    flex: 1,
  },
  greenhouseName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  greenhouseLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  connectButtonContainer: {
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  connectButton: {
    backgroundColor: '#0d986a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
}); 