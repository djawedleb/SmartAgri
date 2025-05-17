import { View, Text, Image, StyleSheet, Pressable, TextInput, ImageBackground, Dimensions, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native'
import React, {useState, useEffect} from 'react'
import {Link, router} from 'expo-router'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getBaseUrl } from '../../config';
import { useLoginData } from '../context/LoginDataContext';
import { useUser } from '../context/UserContext';
const { width, height } = Dimensions.get('window');

const ExploreContent = () => {

  /* const [loginData, setLoginData] = useState({
    UserName: "",
    Password: "",
  }); 
  */

  const { loginData, setLoginData } = useLoginData();
  const { setUserRole } = useUser();

  function ResetHook(){
    setLoginData({
      UserName: "",
      Password: "",
    });
  }

  const [isPasswordVisible, setIsPasswordVisible] = useState(false); //intial value false

    // Function to handle text input changes
    const handleChange = (name, value) => {
      setLoginData((prevLoginData) => ({
        ...prevLoginData,
        [name]: value, // Update the specific field in loginData
      }));
    };

 console.log(loginData);

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };


  //to send data to the post method in express//
  const handleSubmit = async (e) => {
    try {
        console.log('Sending request with data:', JSON.stringify(loginData));
      
        const baseUrl = getBaseUrl();
        const response = await fetch(`${baseUrl}/exploreUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Server response:', result);

        // Check if the account exists
        if (result.exists) {
            // Set user role based on the response
            setUserRole(result.role); 
            console.log("Role is " + result.role);
            
            // Account exists, update loginData with the user's name
            setLoginData(prevData => ({
                ...prevData,
                name: loginData.UserName // Using the username as the display name
            }));

            // Redirect based on role
            if (result.role === 'technicien') {
                router.push('/Technicien/');
            } else {
                router.push('/Home/');
            }
        } else {
            // Account doesn't exist, stay on login page
            alert('Invalid username or password');
            ResetHook();
        }
        
    } catch (error) {
        console.error('Connection error:', error);
        alert('Error connecting to server');
    }
};

  {/*console.log(Username); */} 

  return (
    <View style={styles.container}> 
      <View style={styles.container2}>
      <ImageBackground source={require('../../assets/images/BGBG2.png')} style={styles.backgroundImage}>
      {/*
       <Pressable style={styles.BackButton}>
       <Icon name="arrow-left" size={30} color="Black" style={styles.icon} />
      </Pressable>
      */} 
      </ImageBackground>
      </View>
      
      <Image source={require('../../assets/images/iconAgri.png')}  style={styles.iconA}/>
      <Text style={styles.Title}>SmartAgri</Text>
      
        <View>
        <Text style={styles.Text}>Welcome Back</Text>
        <Text style={styles.Text2}>login to your account</Text>

        <SafeAreaView style={styles.inputContainer}>
          <Icon name="account" size={20} color="#888" style={styles.icon} />
          
          <TextInput placeholder="Enter your Username" style={styles.input2} required
           value={loginData.UserName} onChangeText={(value) => handleChange("UserName", value)}/>
         
        </SafeAreaView>

        <SafeAreaView style={styles.inputContainer}>
          <Icon name="key-variant" size={20} color="#888" style={styles.icon} />
          <TextInput placeholder="Enter your password" style={styles.input2} 
          value={loginData.Password} onChangeText={(value) => handleChange("Password", value)} 
          required secureTextEntry={!isPasswordVisible} /* Mask the password input*/ />
          <Pressable onPress={togglePasswordVisibility}>
              <Icon
                name={isPasswordVisible ? "eye-off" : "eye"} //trinary operator to toggle between eye and eye-off
                size={20}
                color="#888"
                style={styles.icon2}
              />
            </Pressable>
        </SafeAreaView>
      

      <Pressable style={styles.SignUpButton}  onPress={handleSubmit}>
      <Text style={styles.ButtonText}>Log in</Text>
      </Pressable>

      <Text style={styles.LoginText}>Are you a Manager?  <Link href="/ManagerPin" style={styles.LoginText2}>Start Here</Link> </Text>

     </View> 
      
    </View>
  );
};

export default ExploreContent;

const styles = StyleSheet.create({
  container : {
    backgroundColor: 'white',
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    height: '100%',
  }, 
  container2 : {
    backgroundColor: 'white',
    height: "25%", 
    borderBottomLeftRadius: 125, // Add border radius to the bottom left
    borderBottomRightRadius: 125, // Add border radius to the bottom right
   
    overflow: 'hidden', // Ensure the rounded corners are applied
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  iconA: {
    width: 50,
    height: 40,
    alignSelf: 'center',
    marginTop: 10,
  },
  Title : {
    color: '#0d986a',
    fontSize: 36,
    fontWeight: 'bold',
    marginLeft: 30,
    marginBottom: 10,
    alignSelf: 'center',
    textAlign: 'center',
  },
  Text : {
    color: 'Black',
    fontSize: 36,
    fontWeight: 'bold',
    marginLeft: 30,
    marginBottom: 10,
    alignSelf: 'center',
    textAlign: 'center',
  },
  Text2 : {
    color: 'Black',
    fontSize: 20,
    marginLeft: 30,
    marginBottom: 40,
    alignSelf: 'center',
    textAlign: 'center',
  },
  link : {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor:'rgba(0,0,0,0.5)',
    marginTop: 20,
  },
    BackButton : {
    backgroundColor: '#e0e6ec',
    borderRadius: 20,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    marginTop: 60,
    marginLeft: 30,
    marginBottom: 50,
    paddingRight: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 20,
    borderBottomWidth: 3,
    borderBottomColor: '#016734', // This adds a strong bottom border color
  },
  icon: {
    marginLeft:5,
  },
  icon2: {
    marginRight:8,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 20,
  },
  input2: {
    flex: 1,
    height: 40,
    paddingLeft: 10,
    fontSize: 16,
  },
  SignUpButton : {
   alignSelf: 'center',
   borderRadius: 18,
   width: '80%',
   padding: 10,
   marginTop: 20,
   backgroundColor: '#0d986a',
   borderBottomWidth: 2,
  borderBottomColor: 'rgba(0, 0, 0, 0.2)', // This adds a strong bottom border color

  },
  ButtonText : {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color:'white',
  },
  LoginText : {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
  LoginText2 : {
  fontWeight: 'bold',
  }
})