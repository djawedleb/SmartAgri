import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PlantHealth = () => {
  const greenhouses = [
    {
      id: 1,
      name: 'Strawberry',
      greenhouse: 'GreenHouse 1',
      status: 'healthy',
      readings: {
        light: '35-45%',
        temperature: '25-27°F',
        humidity: '80%',
        water: '250ml'
      }
    },
    {
      id: 2,
      name: 'Blackberry',
      greenhouse: 'GreenHouse 2',
      status: 'healthy',
      readings: {
        light: '40-45%',
        temperature: '23-25°F',
        humidity: '80%',
        water: '150ml'
      }
    }
  ];

  const renderReadingItem = (icon, value) => (
    <View style={styles.readingItem}>
      <Icon name={icon} size={24} color="#0d986a" />
      <Text style={styles.readingValue}>{value}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {greenhouses.map((greenhouse) => (
        <View key={greenhouse.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.plantName}>{greenhouse.name}</Text>
              <Text style={styles.greenhouseName}>{greenhouse.greenhouse}</Text>
            </View>
            <Pressable style={styles.reportButton}>
              <Text style={styles.reportButtonText}>Generate Report</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>Overview</Text>
          
          <View style={styles.readingsContainer}>
            <View style={styles.readingsRow}>
              {renderReadingItem('white-balance-sunny', greenhouse.readings.light)}
              {renderReadingItem('thermometer', greenhouse.readings.temperature)}
            </View>
            <View style={styles.readingsRow}>
              {renderReadingItem('water-percent', greenhouse.readings.humidity)}
              {renderReadingItem('water', greenhouse.readings.water)}
            </View>
          </View>

          <View style={styles.statusContainer}>
            <Icon name="leaf" size={20} color="#0d986a" />
            <Text style={styles.statusText}>
              Your plant is {greenhouse.status}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  card: {
    backgroundColor: greenhouse => greenhouse.id === 1 ? '#e6f5e7' : '#fff3e0',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    overflow: 'visible',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  plantName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  greenhouseName: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  reportButton: {
    backgroundColor: '#0d986a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  reportButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 16,
  },
  readingsContainer: {
    marginBottom: 16,
  },
  readingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  readingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
  },
  readingValue: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 152, 106, 0.1)',
    padding: 12,
    borderRadius: 10,
  },
  statusText: {
    marginLeft: 8,
    color: '#0d986a',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default PlantHealth;