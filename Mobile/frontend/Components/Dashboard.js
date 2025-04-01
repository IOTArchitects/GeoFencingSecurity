import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Image,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert
} from "react-native";
import MapView, { Marker } from 'react-native-maps';
import useWebSocket from 'react-native-use-websocket';

const THINKSPEAK_CHANNEL_ID = "2842385";
const THINKSPEAK_API_KEY = "EOBFEIONT10IWMSZ";

export default function Dashboard({ navigation }) {
  const [isSecurityEnabled, setIsSecurityEnabled] = useState(false);
  const [coordinates, setCoordinates] = useState({ latitude: 0, longitude: 0 });
  const [loading, setLoading] = useState(true);
  const [rfidEvent, setRfidEvent] = useState(null);

  const { sendMessage, lastMessage } = useWebSocket('ws://172.20.10.4:4000', {
    onOpen: () => console.log('WebSocket connected'),
    onError: (e) => console.error('WebSocket error:', e),
    onClose: () => console.log('WebSocket disconnected'),
    shouldReconnect: () => true,
  });

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage && lastMessage.data) {
      try {
        const data = JSON.parse(lastMessage.data);
        if (data.event === 'rfid-detected') {
          setRfidEvent(data);

          Alert.alert(
            "RFID Detected",
            `UID: ${data.uid}\nDo you want to approve access?`,
            [
              {
                text: "Reject",
                onPress: () => {
                  sendMessage(JSON.stringify({ action: 'reject' }));
                  Alert.alert("Rejected", "Access has been rejected.");
                },
                style: "destructive"
              },
              {
                text: "Approve",
                onPress: () => {
                  sendMessage(JSON.stringify({ action: 'approve' }));
                  Alert.alert("Approved", "Access has been granted.");
                }
              }
            ],
            { cancelable: false }
          );
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    }
  }, [lastMessage]);

  // Fetch coordinates from ThingSpeak
  const fetchCoordinates = async () => {
    try {
      let response = await fetch(`https://api.thingspeak.com/channels/${THINKSPEAK_CHANNEL_ID}/feeds.json?api_key=${THINKSPEAK_API_KEY}&results=1`);
      let data = await response.json();

      if (data && data.feeds && data.feeds.length > 0) {
        const latest = data.feeds[0];
        if (latest.field1 && latest.field2) {
          setCoordinates({
            latitude: parseFloat(latest.field1),
            longitude: parseFloat(latest.field2),
          });
          setLoading(false);
        }
      }
    } catch (err) {
      console.error("Error fetching ThingSpeak data:", err);
    }
  };

  useEffect(() => {
    fetchCoordinates();
    const interval = setInterval(fetchCoordinates, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />

      {/* Navbar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.alarmButton}>
          <Image source={require('../assets/alarm.png')} style={styles.alarmIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.signOutButton} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.buttonText}>Sign out</Text>
        </TouchableOpacity>
      </View>

      {/* Google Maps View */}
      <View style={styles.mapContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#639c5d" />
        ) : (
          <MapView
            style={styles.map}
            region={{
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker coordinate={coordinates} title="Live Location" />
          </MapView>
        )}
      </View>

      {/* Toggle Button */}
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleText}>
          {isSecurityEnabled ? "Disable Security System" : "Enable Security System"}
        </Text>
        <Switch
          value={isSecurityEnabled}
          onValueChange={() => setIsSecurityEnabled(!isSecurityEnabled)}
          trackColor={{ false: "#ccc", true: "#639c5d" }}
          thumbColor={isSecurityEnabled ? "#fff" : "#f4f3f4"}
        />
      </View>

      {/* RFID Event Display */}
      {rfidEvent && (
        <View style={styles.rfidContainer}>
          <Text style={styles.rfidText}>Last RFID Detected: {rfidEvent.uid}</Text>
        </View>
      )}
    </View>
  );
}

// ✅ Full Styles - No Laziness Here
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
    height: '75%',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  toggleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '25%',
  },
  toggleText: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  rfidContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    elevation: 3,
  },
  rfidText: {
    fontSize: 16,
    color: '#333',
  },
});
