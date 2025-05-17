import { Tabs, useRouter } from 'expo-router';
import React, {useState, useEffect} from 'react';
import { Platform, Dimensions } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { View, Text, StyleSheet, Image, Pressable, Modal, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TouchableWithoutFeedback } from 'react-native'; 
import { useUser } from '../context/UserContext';



export default function TabLayout() {

  const { isPageVisible } = useUser();

  const colorScheme = useColorScheme();
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;
  const leftPadding = screenWidth / 5;

  const [isSidebarVisible, setSidebarVisible] = useState(false);  
  const [isHomeExpanded, setIsHomeExpanded] = useState(false);

  //React.useRef(): Creates a mutable reference that persists across re-renders ( store values that shouldn't trigger re-renders when changed)
  const slideAnim = React.useRef(new Animated.Value(-350)).current;
  const submenuHeight = React.useRef(new Animated.Value(0)).current;

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

  const toggleHome = () => {
    // Prevent menu from closing when toggling the submenu
    if (isSidebarVisible) {
      setIsHomeExpanded(!isHomeExpanded);
      Animated.timing(submenuHeight, {
        toValue: isHomeExpanded ? 0 : 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  function Sidebar({ isVisible, onClose }) {
    const handleAiRecommendations = () => {
      onClose();
      router.push('/Home/AiRecommendations');
    };

    const handleManageUsers = () => {
      onClose();
      router.push('/Home/ManageUsers');
    };

    const handleNavigation = (route) => {
      onClose();
      router.push(route);
    };

    const handleHome = () => {
      onClose();
      router.replace('/Home/');
    };

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
          
          <Animated.View style={[styles.sidebarContent, {transform: [{ translateX: slideAnim }]} ]}> 
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={30} color="#0d986a" />
            </Pressable>

            <View style={styles.sidebarItems}>
              <View style={styles.sidebarItem}>
                <Pressable 
                  style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                  onPress={handleHome}
                >
                  <Icon name="home-outline" size={24} color="#0d986a" />
                  <Text style={styles.sidebarText}>Home</Text>
                </Pressable>
                <Pressable 
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleHome();
                  }}
                >
                  <Icon 
                    name={isHomeExpanded ? "chevron-down" : "chevron-right"} 
                    size={24} 
                    color="#666" 
                    style={styles.chevron}                
                  />
                </Pressable>
              </View>

              {isHomeExpanded && (
                <Animated.View style={[styles.submenu, {
                  maxHeight: submenuHeight.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 200]
                  }),
                  opacity: submenuHeight
                }]}>

                  <Pressable 
                    style={styles.submenuItem}
                    onPress={() => handleNavigation('/Home/PlantHealth')}
                  >
                    <Icon name="sprout" size={20} color="#0d986a" />
                    <Text style={styles.submenuText}>Plants</Text>
                  </Pressable>
                  <Pressable 
                    style={styles.submenuItem}
                    onPress={() => handleNavigation('/Home/GreenHouses')}
                  >
                    <Icon name="greenhouse" size={20} color="#0d986a" />
                    <Text style={styles.submenuText}>GreenHouses</Text>
                  </Pressable>
                  {isPageVisible('Sensors') && (
                    <Pressable 
                      style={styles.submenuItem}
                      onPress={() => handleNavigation('/Home/Sensors')}
                    >
                      <Icon name="chip" size={20} color="#0d986a" />
                      <Text style={styles.submenuText}>Sensors</Text>
                    </Pressable>
                  )}
                  <Pressable 
                    style={styles.submenuItem}
                    onPress={handleAiRecommendations}
                  >
                    <Icon name="brain" size={20} color="#0d986a" />
                    <Text style={styles.submenuText}>AI Recommendations</Text>
                  </Pressable>
                </Animated.View>
              )}

              {isPageVisible('ManageUsers') && (<Pressable 
                style={styles.sidebarItem}
                onPress={handleManageUsers}
              >
                <Icon name="account-group-outline" size={24} color="#0d986a" />
                <Text style={styles.sidebarText}>Manage Users</Text>
                <Icon name="chevron-right" size={24} color="#666" style={styles.chevron} />
              </Pressable>
 )}
              <Pressable 
                style={styles.sidebarItem}
                onPress={() => handleNavigation('/Home/Account')}
              >
                <Icon name="account-outline" size={24} color="#0d986a" />
                <Text style={styles.sidebarText}>Account</Text>
                <Icon name="chevron-right" size={24} color="#666" style={styles.chevron} />
              </Pressable>

              <Pressable 
                style={styles.sidebarItem}
                onPress={() => handleNavigation('/')}
              >
                <Icon name="logout" size={24} color="#0d986a" />
                <Text style={styles.sidebarText}>Log out</Text>
                <Icon name="chevron-right" size={24} color="#666" style={styles.chevron} />
              </Pressable>
            </View>
          </Animated.View>
          </TouchableWithoutFeedback>
        </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }

  // Define the tabs based on user role
  const baseTabs = [
    {
      name: "index",
      options: {
        title: '',
        tabBarIcon: ({ color }) => <Icon name="home-outline" size={30} color={color} />,
      }
    },
    {
      name: "PlantHealth",
      options: {
        title: '',
        tabBarIcon: ({ color }) => <Icon name="sprout" size={30} color={color} />,
      }
    },
    {
      name: "GreenHouses",
      options: {
        title: '',
        tabBarIcon: ({ color }) => <Icon name="greenhouse" size={30} color={color} />,
      }
    },
    {
      name: "AiRecommendations",
      options: {
        title: '',
        tabBarIcon: ({ color }) => <Icon name="brain" size={28} color={color} />,
      }
    },
    {
      name: "Account",
      options: {
        title: '',
        href: null,
        tabBarStyle: { display: 'none' },
      }
    },
    {
      name: "ManageUsers",
      options: {
        title: '',
        href: null,
        tabBarStyle: { display: 'none' },
      }
    }
  ];

  // Add Sensors tab only if user has access
  const tabs = isPageVisible('Sensors') 
    ? [
        ...baseTabs.slice(0, 3),
        {
          name: "Sensors",
          options: {
            title: '',
            tabBarIcon: ({ color }) => <Icon name="chip" size={30} color={color} />,
          }
        },
        ...baseTabs.slice(3)
      ]
    : baseTabs;

  return (
    <>
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: true,
        headerTitle: () => <HeaderTitle />,
        tabBarActiveTintColor: '#0d986a',
        tabBarInactiveTintColor: '#666',
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: '#161718',
          paddingTop: 10,
          borderTopColor: '#161718',
          ...Platform.select({
            ios: {
              height: 45,
              borderTopRightRadius: 20,
              borderTopLeftRadius: 20,
            },
            default: {
              height: 55,
              borderTopRightRadius: 20,
              borderTopLeftRadius: 20,
            },
          }),
        },
        tabBarLabelStyle: {
          textAlign: 'center',
          top: 8,
          fontWeight: '500',
          fontSize: 12,
        },
        tabBarButton: !isPageVisible(route.name) ? () => null : undefined,
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
            backgroundColor: 'white',
            position: 'absolute',
            borderTopRightRadius: 20,
            borderTopLeftRadius: 20,
            height: 45,
            borderwidth: 0.4,
            paddingBottom: 0,
            paddingTop: 0,
          
          },
          default: {
            backgroundColor: 'white',
            position: 'absolute',
            borderTopRightRadius: 20,
            borderTopLeftRadius: 20,
            height: 55,
            borderwidth: 0.4,
            paddingBottom: 0,
            paddingTop: 0,
            
          },
        }),
        tabBarItemStyle: {
          height: 55,
          paddingBottom: 0,
          paddingTop: 0,
          paddingLeft: isPageVisible('Sensors') ? 0 : leftPadding,
          
        },
      })}>
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={tab.options}
        />
      ))}
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sidebarText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  chevron: {
    marginLeft: 'auto',
  },
  submenu: {
    paddingLeft: 20,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  submenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingLeft: 35,
  },
  submenuText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
  },
})