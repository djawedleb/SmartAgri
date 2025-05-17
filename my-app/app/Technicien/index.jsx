import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLoginData } from '../context/LoginDataContext';

export default function TechnicianHome() {
  const { loginData } = useLoginData();

  // Mock data for demonstration
  const sensorStats = {
    total: 24,
    active: 18,
    needsMaintenance: 4,
    offline: 2
  };

  const recentAlerts = [
    { id: 1, type: 'warning', message: 'Temperature sensor #3 battery low', time: '2 hours ago' },
    { id: 2, type: 'error', message: 'Humidity sensor #7 offline', time: '4 hours ago' },
    { id: 3, type: 'info', message: 'New sensor calibration required', time: '1 day ago' }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{loginData.name}</Text>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Sensor Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Icon name="chip" size={24} color="#0d986a" />
              <Text style={styles.statNumber}>{sensorStats.total}</Text>
              <Text style={styles.statLabel}>Total Sensors</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="check-circle" size={24} color="#4CAF50" />
              <Text style={styles.statNumber}>{sensorStats.active}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="wrench" size={24} color="#FFA000" />
              <Text style={styles.statNumber}>{sensorStats.needsMaintenance}</Text>
              <Text style={styles.statLabel}>Needs Maintenance</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="alert-circle" size={24} color="#F44336" />
              <Text style={styles.statNumber}>{sensorStats.offline}</Text>
              <Text style={styles.statLabel}>Offline</Text>
            </View>
          </View>
        </View>

        <View style={styles.alertsContainer}>
          <Text style={styles.sectionTitle}>Recent Alerts</Text>
          {recentAlerts.map(alert => (
            <Pressable key={alert.id} style={styles.alertCard}>
              <Icon 
                name={alert.type === 'warning' ? 'alert' : alert.type === 'error' ? 'alert-circle' : 'information'} 
                size={24} 
                color={alert.type === 'warning' ? '#FFA000' : alert.type === 'error' ? '#F44336' : '#2196F3'} 
              />
              <View style={styles.alertContent}>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                <Text style={styles.alertTime}>{alert.time}</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#666" />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Add extra padding at the bottom
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d986a',
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  alertsContainer: {
    padding: 20,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertContent: {
    flex: 1,
    marginLeft: 15,
  },
  alertMessage: {
    fontSize: 16,
    color: '#333',
  },
  alertTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
}); 