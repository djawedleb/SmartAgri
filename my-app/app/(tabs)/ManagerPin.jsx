import { View, Text, StyleSheet, Pressable, TextInput, SafeAreaView, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Dimensions } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { router } from 'expo-router'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { getBaseUrl } from '../../config'
import { useUser } from '../context/UserContext'

const { height } = Dimensions.get('window');

const ManagerPin = () => {
  const { setUserRole } = useUser();
  const [pin, setPin] = useState(['', '', '', '', '', ''])
  const [isPinVisible, setIsPinVisible] = useState(false)
  const inputRefs = useRef([])

  const handlePinSubmit = async () => {
    try {
      const pinString = pin.join('')
      const baseUrl = getBaseUrl()
      const response = await fetch(`${baseUrl}/verifyManagerPin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ pin: pinString })
      })

      const result = await response.json()

      if (result.verified) {
        setUserRole(null)
        router.push('/Home/')
      } else {
        Alert.alert('Error', 'Invalid PIN')
        setPin(['', '', '', '', '', ''])
      }
    } catch (error) {
      console.error('Error:', error)
      Alert.alert('Error', 'Failed to verify PIN')
    }
  }

  const handleBack = () => {
    router.push('/(tabs)/explore')
  }

  const handlePinChange = (text, index) => {
    const newPin = [...pin]
    newPin[index] = text
    setPin(newPin)

    // Move to next input if current input is filled
    if (text && index < 5) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyPress = (e, index) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  return (

    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Icon name="arrow-left" size={30} color="white" />
        </Pressable>
      </View>

      <View style={styles.Body}>
        <Text style={styles.title}>Manager Access</Text>
        <Text style={styles.subtitle}>Enter your PIN to continue</Text>

        <View style={styles.pinContainer}>
          {pin.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => inputRefs.current[index] = ref}
              style={styles.pinInput}
              value={digit}
              onChangeText={(text) => handlePinChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="numeric"
              maxLength={1}
              secureTextEntry={!isPinVisible}
            />
          ))}
        </View>

        <Pressable style={styles.visibilityButton} onPress={() => setIsPinVisible(!isPinVisible)}>
          <Icon
            name={isPinVisible ? "eye-off" : "eye"}
            size={25}
            color="#888"
          />
        </Pressable>

        <Pressable style={styles.submitButton} onPress={handlePinSubmit}>
          <Text style={styles.buttonText}>Verify PIN</Text>
        </Pressable>
      </View>
    </View>
    </TouchableWithoutFeedback>

  )
}

export default ManagerPin

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    paddingTop: height / 3,
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  Body: {
    justifyContent: 'center',
  alignItems: 'center',
  paddingBottom: 40, 

  },
  backButton: {
    marginTop: 40,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: '#0d986a',
    backgroundColor: '#0d986a',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0d986a',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  pinInput: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#0d986a',
    marginHorizontal: 5,
    textAlign: 'center',
    fontSize: 24,
    backgroundColor: '#f5f5f5',
  },
  visibilityButton: {
    padding: 10,
    marginBottom: 5,
  },
  submitButton: {
    backgroundColor: '#0d986a',
    borderRadius: 18,
    width: '80%',
    padding: 15,
    alignSelf: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
}) 