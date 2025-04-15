import { View, Text, StyleSheet, ScrollView } from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Sensors = () => {
  // Mock data for sensors (replace with real data later)
  const sensorData = [
    {
      id: 1,
      name: 'Soil Moisture',
      value: '65%',
      status: 'normal',
      icon: 'water-percent',
      color: '#4CAF50'
    },
    {
      id: 2,
      name: 'Temperature',
      value: '24°C',
      status: 'warning',
      icon: 'thermometer',
      color: '#FF9800'
    },
    {
      id: 3,
      name: 'Humidity',
      value: '75%',
      status: 'normal',
      icon: 'water',
      color: '#2196F3'
    },
    {
      id: 4,
      name: 'Light Intensity',
      value: '850 lux',
      status: 'normal',
      icon: 'white-balance-sunny',
      color: '#FFC107'
    },
    {
      id: 5,
      name: 'pH Level',
      value: '6.5',
      status: 'normal',
      icon: 'test-tube',
      color: '#9C27B0'
    },
    {
      id: 6,
      name: 'Soil NPK',
      value: 'Good',
      status: 'normal',
      icon: 'leaf',
      color: '#4CAF50'
    }
  ];

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Farming Sensors</Text>
      <Text style={styles.subtitle}>Real-time monitoring</Text>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.gridContainer}>
          {sensorData.map((sensor) => (
            <View key={sensor.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Icon name={sensor.icon} size={24} color={sensor.color} />
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(sensor.status) }]} />
              </View>
              <Text style={styles.sensorName}>{sensor.name}</Text>
              <Text style={styles.sensorValue}>{sensor.value}</Text>
              <Text style={[styles.statusText, { color: getStatusColor(sensor.status) }]}>
                {sensor.status.charAt(0).toUpperCase() + sensor.status.slice(1)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
});

export default Sensors;