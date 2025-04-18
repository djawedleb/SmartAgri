import { View, Text, StyleSheet, ScrollView, Pressable, Modal, TextInput, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getBaseUrl } from '../../config';

const ManageUsers = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'farmer' // Default role
  });

  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const baseUrl = getBaseUrl();
        const response = await fetch(`${baseUrl}/GetUsers`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, [users]);

  const handleSubmit = async (e) => {
    // Validate inputs
    if (!newUser.username || !newUser.email || !newUser.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

  e.preventDefault();
  try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/AddUser`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json',},
          body: JSON.stringify(newUser),
      });

      if (!response.ok) {
          console.error('Network response was not ok:', response.statusText);
          throw new Error('Network response was not ok');
      }
      const result = await response.json();
    

      //console.log(result);
  } catch (error) {
      console.error('There was an error!', error);
  }
};

function caller(e){
  handleSubmit(e);
  ResetHook(e);
}

function ResetHook(event) {
  setNewUser({
    username: '',
    email: '',
    password: '',
    role: 'farmer'
  });
  setModalVisible(false);

}

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Users</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 80 }}>
        {/* User List */}

      {/* Default Administrator */}
      <View style={styles.userList}>
        <View key="default" style={styles.userCard}>
          <View style={styles.userInfo}>
          <Icon name="account-circle" size={40} color="#0d986a" />
          <View style={styles.userDetails}>
         <Text style={styles.userName}>John Doe</Text>
        <Text style={styles.userRole}>Administrator</Text>
        </View>
      </View>
       </View>

      {/* all Users */}
          {users.map(user => (
            <View key={user._id} style={styles.userCard}>
              <View style={styles.userInfo}>
                <Icon name="account-circle" size={40} color="#0d986a" />
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{user.UserName}</Text>
                  <Text style={styles.userRole}>{user.Role}</Text>
                </View>
              </View>
              <View style={styles.userActions}>
                <Pressable style={styles.actionButton}>
                  <Icon name="pencil" size={24} color="#0d986a" />
                </Pressable>
                <Pressable style={styles.actionButton}>
                  <Icon name="delete" size={24} color="#ff4444" />
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        {/* Add User Button */}
        <Pressable 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Icon name="plus" size={24} color="white" />
          <Text style={styles.addButtonText}>Add New User</Text>
        </Pressable>

        {/* Add User Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New User</Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <Icon name="close" size={24} color="#666" />
                </Pressable>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter username"
                  value={newUser.username}
                  onChangeText={(text) => setNewUser({...newUser, username: text})}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter email"
                  value={newUser.email}
                  onChangeText={(text) => setNewUser({...newUser, email: text})}
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  value={newUser.password}
                  onChangeText={(text) => setNewUser({...newUser, password: text})}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Role</Text>
                <View style={styles.roleContainer}>
                  <Pressable
                    style={[
                      styles.roleButton,
                      newUser.role === 'farmer' && styles.selectedRole
                    ]}
                    onPress={() => setNewUser({...newUser, role: 'farmer'})}
                  >
                    <Text>Farmer</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.roleButton,
                      newUser.role === 'technicien' && styles.selectedRole
                    ]}
                    onPress={() => setNewUser({...newUser, role: 'technicien'})}
                  >
                    <Text >Technicien</Text>
                  </Pressable>
                </View>
              </View>

              <Pressable style={styles.submitButton} onPress={caller}>
                <Text style={styles.submitButtonText}>Add User</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d986a',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  userList: {
    gap: 16,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userRole: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  userActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d986a',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
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
    color: '#0d986a',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedRole: {
    backgroundColor: '#0d986a',
    borderColor: '#0d986a',
  },
  roleText: {
    fontSize: 16,
    color: '#666',
  },
  selectedRoleText: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#0d986a',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ManageUsers; 