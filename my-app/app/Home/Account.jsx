import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useLoginData } from '../context/LoginDataContext';

const Account = () => {
  const router = useRouter();
  const { loginData } = useLoginData(); //the login data we got from explore page that got passed to context

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
          style: 'destructive',
          onPress: () => {
            router.replace('/');
          },
        },
      ],
      { cancelable: true }
    );
  };

  const MenuItem = ({ icon, title, hasArrow = true, hasBorder = false }) => (
    <>
      <TouchableOpacity style={styles.menuItem}>
        <View style={styles.menuItemLeft}>
          <Icon name={icon} size={24} color="#0d986a" />
          <Text style={styles.menuItemText}>{title}</Text>
        </View>
        {hasArrow && <Icon name="chevron-right" size={24} color="#666" />}
      </TouchableOpacity>
      {hasBorder && <View style={styles.separator} />}
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Icon name="account" size={50} color="#fff" />
        </View>
        <Text style={styles.userName}>{loginData.UserName}</Text>
        <Text style={styles.userDate}>3 January 1984</Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        <MenuItem icon="translate" title="Language" />
        <MenuItem icon="shield-lock" title="Security" hasBorder />
        <MenuItem icon="information" title="About" />
        <MenuItem icon="message-text" title="Feedback" hasBorder />
        <TouchableOpacity 
          style={[styles.menuItem, styles.logoutButton]} 
          onPress={handleLogout}
        >
          <View style={styles.menuItemLeft}>
            <Icon name="logout" size={24} color="#ff4444" />
            <Text style={[styles.menuItemText, styles.logoutText]}>Log out</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0d986a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#013220',
    marginBottom: 4,
  },
  userDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: '#0d986a',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuContainer: {
    marginTop: 10,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    marginLeft: 16,
    fontSize: 16,
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  logoutButton: {
    marginTop: 10,
  },
  logoutText: {
    color: '#ff4444',
  },
});

export default Account; 