import { Tabs, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, View, Text, StyleSheet, Image, Pressable, Modal, Animated, TouchableWithoutFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLoginData } from '../context/LoginDataContext';

export default function TechnicianLayout() {
  const router = useRouter();
  const { loginData } = useLoginData();
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [isHomeExpanded, setIsHomeExpanded] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(-350)).current;

  function Menu() {
    setSidebarVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }

  function onClose() {
    Animated.timing(slideAnim, {
      toValue: -350,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    setTimeout(() => {
      setSidebarVisible(false);
    }, 300);
  }

  function HeaderTitle() {
    return (
      <View style={styles.headerContainer}>
        <Pressable onPress={Menu}>
          <Icon name="menu" size={30} color="Black" />
        </Pressable>
    
        <View>
          <Image source={require('../../assets/images/iconAgri.png')} style={styles.iconA}/>
          <Text style={{ marginLeft: 8, fontSize: 18, color: '#013220' }}>SmartAgri</Text>
        </View>

        <Pressable>
          <Icon name="bell-outline" size={30} color="Black" />
        </Pressable>
      </View>
    );
  }

  function Sidebar({ isVisible, onClose }) {
    const handleNavigation = (route) => {
      onClose();
      router.push(route);
    };

    const handleHome = () => {
      onClose();
      router.push('/Technician/');
    };

    return (
      <Modal
        visible={isVisible}
        animationType="none"
        transparent={true}
        onRequestClose={onClose}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.sidebarContainer}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <Animated.View style={[styles.sidebarContent, {transform: [{ translateX: slideAnim }]}]}>
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
                    <Pressable onPress={(e) => {
                      e.stopPropagation();
                      setIsHomeExpanded(!isHomeExpanded);
                    }}>
                      <Icon 
                        name={isHomeExpanded ? "chevron-down" : "chevron-right"} 
                        size={24} 
                        color="#666" 
                        style={styles.chevron} 
                      />
                    </Pressable>
                  </View>

                  {isHomeExpanded && (
                    <View style={styles.submenu}>
                      <Pressable 
                        style={styles.submenuItem}
                        onPress={() => handleNavigation('/Technician/Sensors')}
                      >
                        <Icon name="chip" size={20} color="#0d986a" />
                        <Text style={styles.submenuText}>Sensors</Text>
                      </Pressable>
                    </View>
                  )}

                  <Pressable 
                    style={styles.sidebarItem}
                    onPress={() => handleNavigation('/Technician/Account')}
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

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: true,
          headerTitle: () => <HeaderTitle />,
          tabBarActiveTintColor: '#0d986a',
          tabBarInactiveTintColor: '#666',
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
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: '',
            tabBarIcon: ({ color }) => <Icon name="home-outline" size={30} color={color} />,
          }}
        />
        <Tabs.Screen
          name="Sensors"
          options={{
            title: '',
            tabBarIcon: ({ color }) => <Icon name="chip" size={30} color={color} />,
          }}
        />
        <Tabs.Screen
          name="Account"
          options={{
            title: '',
            href: null,
            tabBarStyle: { display: 'none' },
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
}); 