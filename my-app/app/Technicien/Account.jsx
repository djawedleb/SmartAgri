import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLoginData } from '../context/LoginDataContext';

export default function Account() {
  const { loginData, setLoginData } = useLoginData();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(loginData.name || '');

  const handleSave = () => {
    if (name.trim() === '') {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    setLoginData({ ...loginData, name });
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => {
            setLoginData({
              name: '',
              role: '',
              isManager: false,
            });
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Account</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Icon name="account" size={64} color="#0d986a" />
        </View>
        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
            />
            <View style={styles.editButtons}>
              <Pressable style={styles.cancelButton} onPress={() => setIsEditing(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.buttonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{loginData.name}</Text>
            <Text style={styles.role}>Technician</Text>
            <Pressable style={styles.editButton} onPress={() => setIsEditing(true)}>
              <Icon name="pencil" size={20} color="white" />
              <Text style={styles.buttonText}>Edit Profile</Text>
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.settingsSection}>
        <Pressable style={styles.settingItem}>
          <Icon name="bell" size={24} color="#0d986a" />
          <Text style={styles.settingText}>Notifications</Text>
          <Icon name="chevron-right" size={24} color="#999" />
        </Pressable>
        <Pressable style={styles.settingItem}>
          <Icon name="shield" size={24} color="#0d986a" />
          <Text style={styles.settingText}>Privacy</Text>
          <Icon name="chevron-right" size={24} color="#999" />
        </Pressable>
        <Pressable style={styles.settingItem}>
          <Icon name="help-circle" size={24} color="#0d986a" />
          <Text style={styles.settingText}>Help & Support</Text>
          <Icon name="chevron-right" size={24} color="#999" />
        </Pressable>
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={24} color="white" />
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileSection: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoContainer: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  role: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: '#0d986a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  editContainer: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#999',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#0d986a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 5,
  },
  settingsSection: {
    backgroundColor: 'white',
    marginTop: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#ff4444',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
}); 