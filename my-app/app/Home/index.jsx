import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';

const WeatherCard = ({ defaultLocation = "London" }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);

  // Your WeatherAPI.com API key
  const API_KEY = "279d276787d542e78ae150612250604";
  
  
  const mapConditionToIcon = (code, isDay) => {
    // WeatherAPI condition code mapping to Material icons
    const weatherConditions = {
      1000: isDay ? 'weather-sunny' : 'weather-night', // Clear/Sunny
      1003: isDay ? 'weather-partly-cloudy' : 'weather-night-partly-cloudy', // Partly cloudy
      1006: 'weather-cloudy', // Cloudy
      1009: 'weather-cloudy', // Overcast
      1030: 'weather-fog', // Mist
      1063: 'weather-rainy', // Patchy rain
      1066: 'weather-snowy', // Patchy snow
      1069: 'weather-snowy-rainy', // Patchy sleet
      1072: 'weather-hail', // Patchy freezing drizzle
      1087: 'weather-lightning', // Thundery outbreaks
      1114: 'weather-snowy', // Blowing snow
      1117: 'weather-snowy-heavy', // Blizzard
      1135: 'weather-fog', // Fog
      1147: 'weather-fog', // Freezing fog
      1150: 'weather-pouring', // Light drizzle
      1153: 'weather-pouring', // Light rain
      1168: 'weather-pouring', // Freezing drizzle
      1171: 'weather-pouring', // Heavy freezing drizzle
      1180: 'weather-rainy', // Light rain
      1183: 'weather-rainy', // Rain
      1186: 'weather-rainy', // Moderate rain
      1189: 'weather-rainy', // Moderate rain
      1192: 'weather-pouring', // Heavy rain
      1195: 'weather-pouring', // Heavy rain
      1198: 'weather-pouring', // Light freezing rain
      1201: 'weather-pouring', // Moderate or heavy freezing rain
      1204: 'weather-snowy-rainy', // Light sleet
      1207: 'weather-snowy-rainy', // Moderate or heavy sleet
      1210: 'weather-snowy', // Light snow
      1213: 'weather-snowy', // Patchy light snow
      1216: 'weather-snowy', // Patchy moderate snow
      1219: 'weather-snowy', // Moderate snow
      1222: 'weather-snowy-heavy', // Patchy heavy snow
      1225: 'weather-snowy-heavy', // Heavy snow
      1237: 'weather-hail', // Ice pellets
      1240: 'weather-rainy', // Light rain shower
      1243: 'weather-pouring', // Moderate or heavy rain shower
      1246: 'weather-pouring', // Torrential rain shower
      1249: 'weather-snowy-rainy', // Light sleet showers
      1252: 'weather-snowy-rainy', // Moderate or heavy sleet showers
      1255: 'weather-snowy', // Light snow showers
      1258: 'weather-snowy-heavy', // Moderate or heavy snow showers
      1261: 'weather-hail', // Light showers of ice pellets
      1264: 'weather-hail', // Moderate or heavy showers of ice pellets
      1273: 'weather-lightning-rainy', // Patchy light rain with thunder
      1276: 'weather-lightning-rainy', // Moderate or heavy rain with thunder
      1279: 'weather-lightning-rainy', // Patchy light snow with thunder
      1282: 'weather-lightning-rainy', // Moderate or heavy snow with thunder
    };
    
    return weatherConditions[code] || 'weather-partly-cloudy';
  };

  // Function to convert timestamp to AM/PM format
  const formatTime = (time) => {
    const hour = parseInt(time.split(':')[0]);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour} ${ampm}`;
  };

  // Function to get the device's current location
  const getDeviceLocation = async () => {
    try {
      setLoading(true);
      
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('Location permission denied');
        setError('Location permission denied. Using default location.');
        setLocation(defaultLocation);
        return;
      }
      
      console.log('Getting current location...');
      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
      });
      
      const { latitude, longitude } = locationData.coords;
      console.log(`Current location: ${latitude}, ${longitude}`);
      
      // Set location as coordinates string for weather API
      setLocation(`${latitude},${longitude}`);
    } catch (error) {
      console.error('Error getting location:', error);
      setError('Could not get device location. Using default location.');
      setLocation(defaultLocation);
    }
  };

  // Function to fetch weather data
  const fetchWeatherData = async () => {
    if (!location) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching weather for: ${location}`);
      
      // Use mock data for development/testing or when API is unavailable
      if (!API_KEY || API_KEY === "YOUR_API_KEY") {
        console.log("Using mock data (no API key provided)");
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Return mock data this happens if the api dont work
        setWeatherData({
          temperature: 35,
          condition: 'Sunny',
          windSpeed: 16,
          humidity: 83,
          uvIndex: 2,
          maxUvIndex: 10,
          icon: 'weather-sunny',
          locationName: 'Mock City',
          forecast: [
            { time: 'Now', temp: 25, icon: 'weather-sunny' },
            { time: '2 PM', temp: 23, icon: 'weather-sunny' },
            { time: '4 PM', temp: 21, icon: 'weather-partly-cloudy' },
            { time: '6 PM', temp: 21, icon: 'weather-partly-cloudy' },
            { time: '8 PM', temp: 20, icon: 'weather-night' },
            { time: '6 AM', temp: 21, icon: 'weather-night' },
            { time: '8 AM', temp: 23, icon: 'weather-partly-cloudy' },
            { time: '10 AM', temp: 21, icon: 'weather-sunny' },
            { time: '12 PM', temp: 21, icon: 'weather-sunny' },
            { time: '2 PM', temp: 20, icon: 'weather-sunny' },
          ]
        });
        
        setLoading(false);
        return;
      }
      
      // Get weather data using WeatherAPI.com with improved error handling
      const weatherUrl = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(location)}&days=1&aqi=no&alerts=no`;
      console.log(`API Request URL: ${weatherUrl}`);
      
      // Set timeout for fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(weatherUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log(`API Response Status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error?.message || 'Failed to fetch weather data';
        } catch (e) {
          errorMessage = `HTTP Error: ${response.status}`;
        }
        throw new Error(errorMessage);
      }
      
      // First get text response to safely parse
      const responseText = await response.text();
      console.log('Raw response received, length:', responseText.length);
      
      // Then parse JSON
      const data = JSON.parse(responseText);
      console.log('Weather data successfully parsed');
      
      // Process hourly forecast data (next 10 hours)
      const hourlyForecast = data.forecast.forecastday[0].hour
        .filter(hour => {
          const hourTime = new Date(hour.time);
          const currentTime = new Date();
          return hourTime >= currentTime;
        })
        .slice(0, 10)
        .map((item, index) => {
          const hourTime = new Date(item.time);
          return {
            time: index === 0 ? 'Now' : formatTime(hourTime.getHours() + ':00'),
            temp: Math.round(item.temp_c),
            icon: mapConditionToIcon(item.condition.code, item.is_day),
          };
        });
      
      // Process the data
      setWeatherData({
        temperature: Math.round(data.current.temp_c),
        condition: data.current.condition.text,
        windSpeed: Math.round(data.current.wind_kph),
        humidity: data.current.humidity,
        uvIndex: Math.round(data.current.uv),
        maxUvIndex: 10,
        icon: mapConditionToIcon(data.current.condition.code, data.current.is_day),
        locationName: data.location.name,
        forecast: hourlyForecast,
      });
      
      console.log('Weather data processing complete');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching weather data:', error.name, error.message);
      
      let errorMessage = error.message || 'Failed to load weather data. Please try again later.';
      
      // Special handling for specific error types
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. Please check your internet connection.';
      } else if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
        errorMessage = 'Network connection error. Please check your internet and permissions.';
      }
      
      setError(errorMessage);
      setLoading(false);
      
      // Show error as an alert too for better visibility
      Alert.alert('Weather Error', errorMessage, [{ text: 'OK' }]);
      
      // Fallback to mock data in case of error
      console.log('Falling back to mock data');
      setWeatherData({
        temperature: 35,
        condition: 'Sunny',
        windSpeed: 16,
        humidity: 83,
        uvIndex: 2,
        maxUvIndex: 10,
        icon: 'weather-sunny',
        locationName: 'Default City',
        forecast: [
          { time: 'Now', temp: 25, icon: 'weather-sunny' },
          { time: '2 PM', temp: 23, icon: 'weather-sunny' },
          { time: '4 PM', temp: 21, icon: 'weather-partly-cloudy' },
          { time: '6 PM', temp: 21, icon: 'weather-partly-cloudy' },
          { time: '8 PM', temp: 20, icon: 'weather-night' },
          { time: '6 AM', temp: 21, icon: 'weather-night' },
          { time: '8 AM', temp: 23, icon: 'weather-partly-cloudy' },
          { time: '10 AM', temp: 21, icon: 'weather-sunny' },
          { time: '12 PM', temp: 21, icon: 'weather-sunny' },
          { time: '2 PM', temp: 20, icon: 'weather-sunny' },
        ]
      });
    }
  };

  useEffect(() => {
    getDeviceLocation();
  }, []);

  useEffect(() => {
    if (location) {
      fetchWeatherData();
      // Refresh weather data every 30 minutes
      const interval = setInterval(fetchWeatherData, 30 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [location]); // Re-fetch when location changes

  // Handler for refresh button
  const handleRefresh = () => {
    getDeviceLocation();
  };

  // Render weather icon based on condition
  const renderWeatherIcon = () => {
    if (!weatherData) return null;
    
    if (weatherData.icon === 'weather-sunny') {
      return (
        <View style={styles.sunIcon}>
          <View style={styles.sun} />
        </View>
      );
    } else {
      return <Icon name={weatherData.icon} size={80} color="#FFD700" />;
    }
  };

  if (loading && !weatherData) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#0d986a" />
        <Text style={styles.loadingText}>Getting your location and weather data...</Text>
      </View>
    );
  }

  // Always render weather card (showing fallback data if error occurred)
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's</Text>
      <Text style={styles.subtitle}>Weather Forecast</Text>
      
      <View style={styles.weatherCard}>
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>Using demo data - {error}</Text>
          </View>
        )}
        
        <View style={styles.headerContainer}>
          <Text style={styles.locationText}>{weatherData?.locationName || 'Loading location...'}</Text>
          <Pressable style={styles.refreshButton} onPress={handleRefresh}>
            <Icon name="refresh" size={24} color="white" />
          </Pressable>
        </View>
        
        <View style={styles.mainWeather}>
          {renderWeatherIcon()}
          <View style={styles.temperatureContainer}>
            <Text style={styles.temperature}>{weatherData?.temperature}°</Text>
            <Text style={styles.condition}>{weatherData?.condition}</Text>
          </View>
        </View>
        
        <View style={styles.weatherInfoContainer}>
          <View style={styles.weatherInfo}>
            <Icon name="weather-windy" size={24} color="#444" />
            <Text style={styles.weatherInfoText}>{weatherData?.windSpeed} km/h</Text>
          </View>
          
          <View style={styles.weatherInfo}>
            <Icon name="water-percent" size={24} color="#444" />
            <Text style={styles.weatherInfoText}>{weatherData?.humidity} %</Text>
          </View>
          
          <View style={styles.weatherInfo}>
            <Icon name="sun-wireless" size={24} color="#444" />
            <Text style={styles.weatherInfoText}>{weatherData?.uvIndex} of {weatherData?.maxUvIndex}</Text>
          </View>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.forecastContainer}>
          {weatherData?.forecast.map((item, index) => (
            <View key={index} style={styles.forecastItem}>
              <Text style={styles.forecastTime}>{item.time}</Text>
              <Icon name={item.icon} size={20} color="#444" style={styles.forecastIcon} />
              <Text style={styles.forecastTemp}>{item.temp}°</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  loadingText: {
    marginTop: 10,
    color: '#0d986a',
    fontSize: 16,
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 107, 107, 0.7)',
    padding: 8,
    borderRadius: 10,
    marginBottom: 10,
  },
  errorBannerText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  weatherCard: {
    backgroundColor: '#e6f5e7',
    borderRadius: 20,
    padding: 16,
    position: 'relative',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  locationText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#0d986a',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainWeather: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  sunIcon: {
    marginRight: 16,
  },
  sun: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFD700',
  },
  temperatureContainer: {
    alignItems: 'center',
  },
  temperature: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#000',
  },
  condition: {
    color: '#0d986a',
    fontSize: 18,
    fontWeight: 'bold',
  },
  weatherInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  weatherInfo: {
    alignItems: 'center',
  },
  weatherInfoText: {
    marginTop: 5,
    fontSize: 14,
    color: '#444',
  },
  forecastContainer: {
    marginTop: 10,
  },
  forecastItem: {
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 10,
  },
  forecastTime: {
    fontSize: 14,
    color: '#444',
    marginBottom: 5,
  },
  forecastIcon: {
    marginVertical: 5,
  },
  forecastTemp: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
  },
});

export default WeatherCard;