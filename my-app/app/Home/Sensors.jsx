import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Sensors = () => {
  const [selectedArduino, setSelectedArduino] = useState('All');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [sensorRanges, setSensorRanges] = useState({
    'Soil Moisture': { min: 30, max: 70 },
    'Temperature': { min: 20, max: 30 },
    'Humidity': { min: 60, max: 80 },
    'Light Intensity': { min: 500, max: 1000 }
  });

  // Mock data for 3 Arduinos
  const arduinoData = {
    'Arduino 1': [
      {
        id: 1,
        name: 'Soil Moisture',
        value: '65%',
        rawValue: 65,
        status: 'normal',
        icon: 'water-percent',
        color: '#4CAF50',
        unit: '%'
      },
      {
        id: 2,
        name: 'Temperature',
        value: '24°C',
        rawValue: 24,
        status: 'warning',
        icon: 'thermometer',
        color: '#FF9800',
        unit: '°C'
      },
      {
        id: 3,
        name: 'Humidity',
        value: '75%',
        rawValue: 75,
        status: 'normal',
        icon: 'water',
        color: '#2196F3',
        unit: '%'
      },
      {
        id: 4,
        name: 'Light Intensity',
        value: '850 lux',
        rawValue: 850,
        status: 'normal',
        icon: 'white-balance-sunny',
        color: '#FFC107',
        unit: ' lux'
      }
    ],
    'Arduino 2': [
      {
        id: 1,
        name: 'Soil Moisture',
        value: '45%',
        rawValue: 45,
        status: 'warning',
        icon: 'water-percent',
        color: '#4CAF50',
        unit: '%'
      },
      {
        id: 2,
        name: 'Temperature',
        value: '28°C',
        rawValue: 28,
        status: 'normal',
        icon: 'thermometer',
        color: '#FF9800',
        unit: '°C'
      },
      {
        id: 3,
        name: 'Humidity',
        value: '60%',
        rawValue: 60,
        status: 'normal',
        icon: 'water',
        color: '#2196F3',
        unit: '%'
      },
      {
        id: 4,
        name: 'Light Intensity',
        value: '920 lux',
        rawValue: 920,
        status: 'normal',
        icon: 'white-balance-sunny',
        color: '#FFC107',
        unit: ' lux'
      }
    ],
    'Arduino 3': [
      {
        id: 1,
        name: 'Soil Moisture',
        value: '80%',
        rawValue: 80,
        status: 'normal',
        icon: 'water-percent',
        color: '#4CAF50',
        unit: '%'
      },
      {
        id: 2,
        name: 'Temperature',
        value: '22°C',
        rawValue: 22,
        status: 'normal',
        icon: 'thermometer',
        color: '#FF9800',
        unit: '°C'
      },
      {
        id: 3,
        name: 'Humidity',
        value: '85%',
        rawValue: 85,
        status: 'normal',
        icon: 'water',
        color: '#2196F3',
        unit: '%'
      },
      {
        id: 4,
        name: 'Light Intensity',
        value: '780 lux',
        rawValue: 780,
        status: 'normal',
        icon: 'white-balance-sunny',
        color: '#FFC107',
        unit: ' lux'
      }
    ]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal':
        return '#4CAF50';
      case 'warning':
        return '#FF9800';
      case 'critical':
        return '#F44336';
      default:
        return '#4CAF50';
    }
  };

  const getSensorStatus = (sensor) => {
    const range = sensorRanges[sensor.name];
    if (!range) return 'normal';

    const value = sensor.rawValue;
    if (value < range.min || value > range.max) {
      return 'warning';
    }
    return 'normal';
  };

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Arduino</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView>
            <TouchableOpacity
              style={[
                styles.filterOption,
                selectedArduino === 'All' && styles.selectedFilter
              ]}
              onPress={() => {
                setSelectedArduino('All');
                setShowFilterModal(false);
              }}
            >
              <Text style={[
                styles.filterOptionText,
                selectedArduino === 'All' && styles.selectedFilterText
              ]}>All Arduinos</Text>
            </TouchableOpacity>
            {Object.keys(arduinoData).map((arduino) => (
              <TouchableOpacity
                key={arduino}
                style={[
                  styles.filterOption,
                  selectedArduino === arduino && styles.selectedFilter
                ]}
                onPress={() => {
                  setSelectedArduino(arduino);
                  setShowFilterModal(false);
                }}
              >
                <Text style={[
                  styles.filterOptionText,
                  selectedArduino === arduino && styles.selectedFilterText
                ]}>{arduino}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderSettingsModal = () => (
    <Modal
      visible={showSettingsModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowSettingsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sensor Range Settings</Text>
            <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {Object.entries(sensorRanges).map(([sensorName, range]) => (
              <View key={sensorName} style={styles.rangeContainer}>
                <Text style={styles.rangeTitle}>{sensorName}</Text>
                <View style={styles.rangeInputs}>
                  <View style={styles.rangeInput}>
                    <Text style={styles.rangeLabel}>Min</Text>
                    <TextInput
                      style={styles.input}
                      value={range.min.toString()}
                      onChangeText={(text) => {
                        setSensorRanges(prev => ({
                          ...prev,
                          [sensorName]: {
                            ...prev[sensorName],
                            min: parseInt(text) || 0
                          }
                        }));
                      }}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.rangeInput}>
                    <Text style={styles.rangeLabel}>Max</Text>
                    <TextInput
                      style={styles.input}
                      value={range.max.toString()}
                      onChangeText={(text) => {
                        setSensorRanges(prev => ({
                          ...prev,
                          [sensorName]: {
                            ...prev[sensorName],
                            max: parseInt(text) || 0
                          }
                        }));
                      }}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Farming Sensors</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={() => {
              // Add refresh functionality here
            }}
          >
            <Icon name="refresh" size={24} color="#0d986a" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Icon name="filter-variant" size={24} color="#0d986a" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => setShowSettingsModal(true)}
          >
            <Icon name="cog" size={24} color="#0d986a" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {selectedArduino === 'All' ? (
          Object.entries(arduinoData).map(([arduinoName, sensors]) => (
            <View key={arduinoName}>
              <View style={styles.selectedArduinoContainer}>
                <Text style={styles.selectedArduinoTitle}>{arduinoName}</Text>
              </View>
              <View style={styles.gridContainer}>
                {sensors.map((sensor) => {
                  const status = getSensorStatus(sensor);
                  return (
                    <View key={`${arduinoName}-${sensor.name}-${sensor.id}`} style={styles.card}>
                      <View style={styles.cardHeader}>
                        <Icon name={sensor.icon} size={24} color={sensor.color} />
                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]} />
                      </View>
                      <Text style={styles.sensorName}>{sensor.name}</Text>
                      <Text style={styles.sensorValue}>{sensor.value}</Text>
                      <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ))
        ) : (
          <>
            <View style={styles.selectedArduinoContainer}>
              <Text style={styles.selectedArduinoTitle}>{selectedArduino}</Text>
            </View>
            <View style={styles.gridContainer}>
              {arduinoData[selectedArduino].map((sensor) => {
                const status = getSensorStatus(sensor);
                return (
                  <View key={`${selectedArduino}-${sensor.name}-${sensor.id}`} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Icon name={sensor.icon} size={24} color={sensor.color} />
                      <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]} />
                    </View>
                    <Text style={styles.sensorName}>{sensor.name}</Text>
                    <Text style={styles.sensorValue}>{sensor.value}</Text>
                    <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
      {renderFilterModal()}
      {renderSettingsModal()}
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
  settingsButton: {
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingBottom: 16,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    width: '48%',
    marginHorizontal: '1%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'visible',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sensorName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  sensorValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  filterOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedFilter: {
    backgroundColor: '#f1f9f5',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedFilterText: {
    color: '#0d986a',
    fontWeight: '600',
  },
  selectedArduinoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedArduinoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  rangeContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rangeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  rangeInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  rangeInput: {
    flex: 1,
  },
  rangeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
  },
});

export default Sensors;