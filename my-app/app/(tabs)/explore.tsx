import { View, Text, Image,StyleSheet,  Pressable,TextInput,ImageBackground,Dimensions } from 'react-native'
import React, {useState} from 'react'
import {Link} from 'expo-router'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
const { width, height } = Dimensions.get('window');

const app = () => {

  // State hooks to store form input data
  const [Username, setUsername] = useState('');
  const [password, setpassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); //intial value false


  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };


  {/*console.log(Username); */} 

  return (
    <View style={styles.container}> 

    <View style={styles.container2}>
    <ImageBackground source={require('../../assets/images/BGBG2.png')} style={styles.backgroundImage}>
     <Pressable style={styles.BackButton}>
     <Icon name="arrow-left" size={30} color="Black" style={styles.icon} />
    </Pressable>
    </ImageBackground>
    </View>
    
    <Image source={require('../../assets/images/iconAgri.png')}  style={styles.iconA}/>
    <Text style={styles.Title}>SmartAgri</Text>
    
      <View>
      <Text style={styles.Text}>Welcome Back</Text>
      <Text style={styles.Text2}>login to your account</Text>

      <View style={styles.inputContainer}>
        <Icon name="account" size={20} color="#888" style={styles.icon} />
        <TextInput placeholder="Enter your Username" style={styles.input2}  value={Username} onChangeText={setUsername}/>
      </View>

      <View style={styles.inputContainer}>
        <Icon name="key-variant" size={20} color="#888" style={styles.icon} />
        <TextInput placeholder="Enter your password" style={styles.input2}  value={password} onChangeText={setpassword} secureTextEntry={!isPasswordVisible} /* Mask the password input*/ />
        <Pressable onPress={togglePasswordVisibility}>
            <Icon
              name={isPasswordVisible ? "eye-off" : "eye"} //trinary operator to toggle between eye and eye-off
              size={20}
              color="#888"
              style={styles.icon2}
            />
          </Pressable>
      </View>
      
    <Pressable style={styles.SignUpButton}>
    <Text style={styles.ButtonText}>Log in</Text>
    </Pressable>

    <Text style={styles.LoginText}>Don't have an account?  <Link href="/" style={styles.LoginText2}>Sign up</Link> </Text>

   </View> 
    
  </View>
)
}

export default app

const styles = StyleSheet.create({
  container : {
    backgroundColor: 'white',
    flex: 1,
    flexDirection: 'column',
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