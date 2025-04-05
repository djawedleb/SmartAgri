import { View, Text, StyleSheet,  Pressable,TextInput,ImageBackground, ScrollView,Image } from 'react-native'
import React, {useState,useEffect} from 'react'
import {Link} from 'expo-router'


const HomePage = () => {
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
      // Initial fetch
    fetchWeatherData();
    
    // Set up interval to fetch every 10 minutes (600000 milliseconds)
    const interval = setInterval(() => {
        fetchWeatherData();
    }, 600000);  //(in milliseconds)
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);


  const fetchWeatherData = async () => {
    try {
        console.log('Fetching weather data...');
        const response = await fetch('http://192.168.1.12:8080/weather', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})  // Empty body since your server doesn't need any data
        });
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Weather data:', data);
        setWeatherData(data);
    } catch (error) {
        console.error('Error fetching weather:', error);
        console.error('Error details:', error.message);
    }
};

  return (
      <View style={styles.container}>
          <ImageBackground source={require('../../assets/images/Bg-img.png')} style={styles.backgroundImage}>
              <View style={styles.container2}>
                  
                  {weatherData && (
                      <View style={styles.weatherContainer}>
                          <Text style={styles.weatherText}>
                              Temperature in {weatherData.city}: {weatherData.temperature}°C
                          </Text>

                          <Text style={styles.weatherText}>
                              Weather: {weatherData.description}
                          </Text>

                          <Text style={styles.weatherText}>
                              humidity: {weatherData.humidity}
                          </Text>

                          <Text style={styles.weatherText}>
                              wind speed: {weatherData.windspeed}
                          </Text>

                          <Text style={styles.weatherText}>
                              clouds: {weatherData.clouds} %
                          </Text>

                          <Image 
                              source={{ uri: weatherData.iconUrl }}
                              style={styles.weatherIcon}
                          />
                      </View>
                  )}
              </View>
          </ImageBackground>
      </View>
  );
};

export default HomePage

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
  weatherContainer: {
    marginTop: 20,
    alignItems: 'center',
},
weatherText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
},
weatherIcon: {
    width: 100,
    height: 100,
},
})