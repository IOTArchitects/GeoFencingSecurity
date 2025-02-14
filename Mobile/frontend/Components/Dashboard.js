import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch, Image, StatusBar, Platform } from "react-native";
import MapView, { Marker } from 'react-native-maps';  // Import react-native-maps and Marker

export default function Dashboard({ navigation }) {
  const [isSecurityEnabled, setIsSecurityEnabled] = useState(false);

  const toggleSecuritySystem = () => {
    setIsSecurityEnabled(previousState => !previousState);
  };

  return (
    <View style={styles.container}>
      {/* Status Bar Adjustment */}
      <StatusBar barStyle="light-content" backgroundColor="black" />

      {/* Navbar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.alarmButton} onPress={() => console.log("Alarm button pressed")}>
          <Image
            source={require('D:\\IOT_Project\\GeoFencingSecurity\\Mobile\\frontend\\assets\\alarm.png')}  // Replace with your alarm image
            style={styles.alarmIcon}
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.signOutButton} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.buttonText}>Sign out</Text>
        </TouchableOpacity>
      </View>

      {/* Google Maps View */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 53.3432, // Latitude of Trinity College Dublin
            longitude: -6.2546, // Longitude of Trinity College Dublin
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={{ latitude: 53.3432, longitude: -6.2546 }} title="Trinity College Dublin" />
        </MapView>
      </View>

      {/* Middle Toggle Button */}
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleText}>
          {isSecurityEnabled ? "Disable Security System" : "Enable Security System"}
        </Text>
        <Switch
          value={isSecurityEnabled}
          onValueChange={toggleSecuritySystem}
          trackColor={{ false: "#ccc", true: "#639c5d" }}
          thumbColor={isSecurityEnabled ? "#fff" : "#f4f3f4"}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5", 
    paddingTop: Platform.OS === 'ios' ? 40 : 20, 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
    backgroundColor: 'black',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 5,
  },
  signOutButton: {
    backgroundColor: "#639c5d",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  alarmButton: {
    backgroundColor: "#639c5d",
    padding: 8,
    borderRadius: 5,
  },
  alarmIcon: {
    width: 25,
    height: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  mapContainer: {
    height: '75%',  // Takes 75% of the screen height
  },
  map: {
    width: '100%',
    height: '100%',
  },
  toggleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '25%',  // Takes 25% of the screen height
  },
  toggleText: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
});
