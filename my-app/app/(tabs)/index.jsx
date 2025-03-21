import { View, Text, StyleSheet,  Pressable,TextInput,ImageBackground } from 'react-native'
import React, {useState} from 'react'
import {Link} from 'expo-router'

const app = () => {

  return (
    <View style={styles.container}> 
    <ImageBackground source={require('../../assets/images/Bg-img.png')} style={styles.backgroundImage}>
     <View style={styles.container2}> 
      <Text style={styles.Text}>SmartAgri</Text>
      <Text style={styles.Text2}>Farm at your fingertips</Text>
     </View> 
    
     <Link href="/explore" style={styles.GetStartedButton}> 
    <Text style={styles.ButtonText}>Get Started</Text>   
    </Link>
  

   </ImageBackground>
  </View>
)
}

export default app

const styles = StyleSheet.create({
  container : {
    backgroundImage: '../../assets/images/Bg-img.png',
    opacity: 0.8,
    flex: 1,
    flexDirection: 'column',
  }, 
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container2 : {
    flex: 1,
    marginTop: "45%",
    alignItems: 'center',
  },
  Text : {
    color: 'white',
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  Text2 : {
    color: 'white',
    opacity: 0.8,
    fontSize: 16,

  },
  GetStartedButton : {
   alignSelf: 'center',
   borderWidth: 1,
   borderRadius: 15,
   width: '60%',
   padding: 10,
   backgroundColor: 'rgba(255, 255, 255, 0.5)',
   marginBottom: "25%"
  },
  ButtonText : {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color:'white',
  
  }
})