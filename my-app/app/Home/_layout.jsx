import { Tabs } from 'expo-router';
import React, {useState, useEffect} from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { View, Text, StyleSheet, Image, Pressable, Modal, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TouchableWithoutFeedback } from 'react-native'; 


export default function TabLayout() {
  const colorScheme = useColorScheme();

  const [isSidebarVisible, setSidebarVisible] = useState(false);  

  //React.useRef(): Creates a mutable reference that persists across re-renders ( store values that shouldn't trigger re-renders when changed)
  const slideAnim = React.useRef(new Animated.Value(-350)).current;

  function Menu() {
    setSidebarVisible(true);
    //creates a spring-like motion and unlike timing it isn't linear and Can bounce
    Animated.spring(slideAnim, {
      toValue: 0, //(visible, fully on screen)
      useNativeDriver: true,
    }).start();
  }

  function onClose() {
    //creates a linear animation with a fixed duration.
    Animated.timing(slideAnim, {
      toValue: -350, //(hidden again when closing)
      duration: 300, //(duration of the animation)
      useNativeDriver: true,
    }).start();
    
    setTimeout(() => {
      setSidebarVisible(false);
    }, 300);  // Same duration as the animation so we don't get a lag
  }

  function HeaderTitle() {
    return (

      <View style={styles.headerContainer}>

         <Pressable onPress={Menu}>
            <Icon
                   name={"menu"} 
                   size={30}
                   color="Black"
                />
        </Pressable>
    
        <View>
        <Image source={require('../../assets/images/iconAgri.png')}  style={styles.iconA}/>
        <Text style={{ marginLeft: 8, fontSize: 18, color: '#013220' }}>SmartAgri</Text>
        </View>

        <Pressable>
            <Icon
                   name={"bell-outline"} 
                   size={30}
                   color="Black"
                />
        </Pressable>

      </View>
    );
  }


  function Sidebar({ isVisible, onClose }) {
    return (
      <Modal
        visible={isVisible}
        animationType="none"
        transparent={true}
        onRequestClose={onClose}
      >
        {/* closes when we click outside the sideBar*/}
         <TouchableWithoutFeedback onPress={onClose}> 
        <View style={styles.sidebarContainer}>
          
          {/* doesn't close when we click inside the sideBar*/}
        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>  
          
    {/* array of styles with transform that modifies the position and translatX that moves the element horizontally*/}
          <Animated.View style={[styles.sidebarContent, {transform: [{ translateX: slideAnim }]} ]}> 
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={30} color="#013220" />
            </Pressable>

            <View style={styles.sidebarItems}>

              <Pressable style={styles.sidebarItem}>
                <Icon name="home" size={24} color="#013220" />
                <Text style={styles.sidebarText}>Home</Text>
              </Pressable>

              <Pressable style={styles.sidebarItem}>
              <Image source={require('../../assets/images/Plant.png')}  style={styles.iconPlant}/>
                <Text style={styles.sidebarText}>Plant Health</Text>
              </Pressable>

              <Pressable style={styles.sidebarThickItem}>
              <Image source={require('../../assets/images/greenH.png')}  style={styles.iconPlant}/>
                <Text style={styles.sidebarText}>Green Houses</Text>
              </Pressable>

              <Pressable style={styles.sidebarThickItem}>
              <Image source={require('../../assets/images/Bug.png')}  style={styles.iconPlant}/>
                <Text style={styles.sidebarText}>Plant diseases</Text>
              </Pressable>

              <Pressable style={styles.sidebarItem}>
                <Icon name="account-multiple" size={24} color="#013220" />
                <Text style={styles.sidebarText}>Manage Users</Text>
              </Pressable>

              <Pressable style={styles.sidebarThickItem}>
                <Icon name="account" size={24} color="#013220" />
                <Text style={styles.sidebarText}>Account</Text>
              </Pressable>

              <Pressable style={styles.sidebarItem}>
                <Icon name="logout" size={24} color="#013220" />
                <Text style={styles.sidebarText}>log out</Text>
              </Pressable>
            </View>
          </Animated.View>
          </TouchableWithoutFeedback>
        </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }

  return (
    <>
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: () => <HeaderTitle />,
        //tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarActiveTintColor: '#013220',  // Color for selected tab
        tabBarInactiveTintColor: '#0d986a',  // Color for unselected tabs
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarLabelStyle: {
          // Customize label (text) style
          fontWeight: 'bold', // Bold label for active tab
          fontSize: 12,       // Customize font size
        },
        headerStyle: Platform.select({
          ios: {
            height: 100,
            backgroundColor: 'white',
            shadowColor: 'transparent',
            elevation: 0,
          },
          default: {
            height: 120,
            backgroundColor: 'white',
            shadowColor: 'transparent',
            elevation: 0,
          },
        }),

        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            backgroundColor: 'white',
            position: 'absolute',
            borderTopRightRadius: 20,
            borderTopLeftRadius: 20,
            height: 60,
            borderwidth: 0.4,
          },
          default: {
            backgroundColor: 'white',
            position: 'absolute',
            borderTopRightRadius: 20,
            borderTopLeftRadius: 20,
            height: 60,
            borderwidth: 0.4,
          },
          
        }),

      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="PlantHealth"
        options={{
          title: 'Plants',
          tabBarIcon: ({ color }) =>  <Image source={require('../../assets/images/Plant.png')}  style={styles.iconPlant}/>,
        }}
      />
      <Tabs.Screen
        name="GreenHouses"
        options={{
          title: 'GreenH',
          tabBarIcon: ({ color }) => <Image source={require('../../assets/images/greenH.png')}  style={styles.iconPlant} />,
        }}
      />
       <Tabs.Screen
        name="diseases"
        options={{
          title: 'diseases',
          tabBarIcon: ({ color }) => <Image source={require('../../assets/images/Bug.png')}  style={styles.iconPlant} />,
        }}
      />
       <Tabs.Screen
        name="accounts"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <Icon name="account" size={28} color={color} />,
        }}
      />
    </Tabs>

    <Sidebar isVisible={isSidebarVisible} onClose={onClose} />
  </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',  
    width: '100%',  
    paddingHorizontal: 10,  
    
  },
  iconA: {
    width: 50,
    height: 40,
    alignSelf: 'center',
    marginTop: 10,
  },
  iconPlant: {
    width: 28,
    height: 28,
    alignSelf: 'center',
    resizeMode: 'contain',

  },
  Title: {
    color: '#013220',
    fontSize: 18,
    marginLeft: 8,
  },
  sidebarContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebarContent: {
    width: '80%',
    height: '100%',
    backgroundColor: 'white',
    padding: 20,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  sidebarItems: {
    marginTop: 20,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sidebarThickItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'Black',
  },
  sidebarText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#013220',
  },
  
})