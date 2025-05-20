import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useLoginData } from '../context/LoginDataContext';
import { getBaseUrl } from '../../config';
import * as ImagePicker from 'expo-image-picker';

const Account = () => {
  const router = useRouter();
  const { loginData, setLoginData } = useLoginData();
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [newName, setNewName] = useState(loginData.UserName);
  const [profilePicture, setProfilePicture] = useState(null);

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

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }
    if (!hasUpperCase) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!hasLowerCase) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!hasNumbers) {
      errors.push('Password must contain at least one number');
    }
    if (!hasSpecialChar) {
      errors.push('Password must contain at least one special character');
    }

    return errors;
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    // Validate new password
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      Alert.alert(
        'Password Requirements',
        passwordErrors.join('\n'),
        [{ text: 'OK' }]
      );
      return;
    }

    // Check if new password is same as current
    if (currentPassword === newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return;
    }

    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/changePassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: loginData.UserName,
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Success',
          'Password changed successfully. Please login again with your new password.',
          [
            {
              text: 'OK',
              onPress: () => {
                setShowSecurityModal(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                handleLogout();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'Failed to connect to server. Please try again later.');
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedback.trim() || !feedbackCategory || !feedbackTitle.trim() || feedbackRating === 0) {
      Alert.alert('Error', 'Please fill in all feedback fields');
      return;
    }

    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/submitFeedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: loginData.UserName,
          title: feedbackTitle.trim(),
          category: feedbackCategory,
          rating: feedbackRating,
          feedback: feedback.trim(),
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Thank you for your feedback!');
        setShowFeedbackModal(false);
        setFeedback('');
        setFeedbackCategory('');
        setFeedbackRating(0);
        setFeedbackTitle('');
      } else {
        Alert.alert('Error', 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback');
    }
  };

  const handleUpdateProfile = async () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    try {
      const baseUrl = getBaseUrl();
      const formData = new FormData();
      formData.append('username', loginData.UserName);
      formData.append('name', newName.trim());
      
      if (profilePicture) {
        formData.append('profilePicture', {
          uri: profilePicture.uri,
          type: 'image/jpeg',
          name: 'profile.jpg'
        });
      }

      const response = await fetch(`${baseUrl}/updateProfile`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setLoginData(prevData => ({
          ...prevData,
          UserName: newName.trim(),
          profilePicture: data.profilePicture || prevData.profilePicture
        }));
        Alert.alert('Success', 'Profile updated successfully');
        setShowEditProfileModal(false);
      } else {
        Alert.alert('Error', data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0]);
    }
  };

  const MenuItem = ({ icon, title, onPress, hasArrow = true, hasBorder = false }) => (
    <>
      <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuItemLeft}>
          <Icon name={icon} size={24} color="#0d986a" />
          <Text style={styles.menuItemText}>{title}</Text>
        </View>
        {hasArrow && <Icon name="chevron-right" size={24} color="#666" />}
      </TouchableOpacity>
      {hasBorder && <View style={styles.separator} />}
    </>
  );

  const renderSecurityModal = () => (
    <Modal
      visible={showSecurityModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowSecurityModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TouchableOpacity onPress={() => setShowSecurityModal(false)}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.passwordRequirements}>
              Password must contain:
              {'\n'}- At least 8 characters
              {'\n'}- One uppercase letter
              {'\n'}- One lowercase letter
              {'\n'}- One number
              {'\n'}- One special character
            </Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Current Password"
                secureTextEntry={!showCurrentPassword}
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              <TouchableOpacity 
                style={styles.passwordToggle}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <Icon 
                  name={showCurrentPassword ? "eye-off" : "eye"} 
                  size={24} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="New Password"
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity 
                style={styles.passwordToggle}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Icon 
                  name={showNewPassword ? "eye-off" : "eye"} 
                  size={24} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Confirm New Password"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity 
                style={styles.passwordToggle}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Icon 
                  name={showConfirmPassword ? "eye-off" : "eye"} 
                  size={24} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.modalButton} onPress={handleChangePassword}>
              <Text style={styles.modalButtonText}>Change Password</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderAboutModal = () => (
    <Modal
      visible={showAboutModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAboutModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>About SmartAgri</Text>
            <TouchableOpacity onPress={() => setShowAboutModal(false)}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.aboutText}>
              SmartAgri is an innovative agricultural management system designed to help farmers monitor and manage their crops effectively.
            </Text>
            <Text style={styles.aboutText}>
              Version: 1.0.0
            </Text>
            <Text style={styles.aboutText}>
              © 2024 SmartAgri. All rights reserved.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderFeedbackModal = () => (
    <Modal
      visible={showFeedbackModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFeedbackModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Send Feedback</Text>
            <TouchableOpacity onPress={() => setShowFeedbackModal(false)}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <TextInput
              style={[styles.input, styles.feedbackTitleInput]}
              placeholder="Feedback Title"
              value={feedbackTitle}
              onChangeText={setFeedbackTitle}
            />
            
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryLabel}>Category</Text>
              <View style={styles.categoryButtons}>
                {['Bug', 'Feature', 'Improvement', 'Other'].map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      feedbackCategory === category && styles.categoryButtonActive
                    ]}
                    onPress={() => setFeedbackCategory(category)}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      feedbackCategory === category && styles.categoryButtonTextActive
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Rating</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setFeedbackRating(star)}
                  >
                    <Icon
                      name={star <= feedbackRating ? "star" : "star-outline"}
                      size={32}
                      color={star <= feedbackRating ? "#FFD700" : "#666"}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TextInput
              style={[styles.input, styles.feedbackInput]}
              placeholder="Tell us what you think..."
              multiline
              numberOfLines={6}
              value={feedback}
              onChangeText={setFeedback}
            />
            
            <TouchableOpacity 
              style={[
                styles.modalButton,
                (!feedback.trim() || !feedbackCategory || !feedbackTitle.trim() || feedbackRating === 0) && 
                styles.modalButtonDisabled
              ]} 
              onPress={handleSubmitFeedback}
              disabled={!feedback.trim() || !feedbackCategory || !feedbackTitle.trim() || feedbackRating === 0}
            >
              <Text style={styles.modalButtonText}>Submit Feedback</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderEditProfileModal = () => (
    <Modal
      visible={showEditProfileModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowEditProfileModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={() => setShowEditProfileModal(false)}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <TouchableOpacity style={styles.profilePictureContainer} onPress={pickImage}>
              {profilePicture ? (
                <Image source={{ uri: profilePicture.uri }} style={styles.profilePicture} />
              ) : (
                <View style={styles.profilePicturePlaceholder}>
                  <Icon name="camera" size={40} color="#666" />
                  <Text style={styles.profilePictureText}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Your Name"
              value={newName}
              onChangeText={setNewName}
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleUpdateProfile}>
              <Text style={styles.modalButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Profile Section */}
      <TouchableOpacity 
        style={styles.profileSection}
        onPress={() => setShowEditProfileModal(true)}
      >
        <View style={styles.avatarContainer}>
          {loginData.profilePicture ? (
            <Image 
              source={{ uri: `${getBaseUrl()}${loginData.profilePicture}` }} 
              style={styles.avatarImage}
            />
          ) : (
            <Icon name="account" size={50} color="#fff" />
          )}
        </View>
        <Text style={styles.userName}>{loginData.UserName}</Text>
        <Text style={styles.userDate}>Farmer</Text>
        <View style={styles.editProfileButton}>
          <Icon name="pencil" size={16} color="#0d986a" />
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </View>
      </TouchableOpacity>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        <MenuItem icon="shield-lock" title="Security" onPress={() => setShowSecurityModal(true)} hasBorder />
        <MenuItem icon="information" title="About" onPress={() => setShowAboutModal(true)} />
        <MenuItem icon="message-text" title="Feedback" onPress={() => setShowFeedbackModal(true)} hasBorder />
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

      {renderSecurityModal()}
      {renderAboutModal()}
      {renderFeedbackModal()}
      {renderEditProfileModal()}
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  feedbackInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  modalButton: {
    backgroundColor: '#0d986a',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  aboutText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    lineHeight: 24,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profilePicturePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePictureText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  editProfileText: {
    marginLeft: 4,
    color: '#0d986a',
    fontSize: 14,
  },
  passwordRequirements: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    marginBottom: 0,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  feedbackTitleInput: {
    marginBottom: 16,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f9f5',
    borderWidth: 1,
    borderColor: '#0d986a',
  },
  categoryButtonActive: {
    backgroundColor: '#0d986a',
  },
  categoryButtonText: {
    color: '#0d986a',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  ratingContainer: {
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
});

export default Account; 