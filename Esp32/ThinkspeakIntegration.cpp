#include <ESP32Servo.h>
#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "iPhone";
const char* password = "Batman@123";

// Backend server URLs
const char* serverUrl = "http://172.20.10.4:4000/rfid-detected";
const char* responseUrl = "http://172.20.10.4:4000/rfid-response";
const char* checkRfidUrl = "http://172.20.10.4:4000/check-rfid/";

// LED & Buzzer Pins
#define GREEN_LED 8  
#define RED_LED 11   
#define buzzer 3 

// Servo Pin
#define motorPin 9  

// RFID Pins
#define SS_PIN 22   
#define RST_PIN 255  

// Mode selection pins (using GPIO pins)
#define SIGNUP_MODE_PIN 12  // Connect to a switch/button
#define NORMAL_MODE_PIN 13  // Connect to a switch/button

Servo myServo;              
MFRC522 rfid(SS_PIN, RST_PIN); 

bool isLocked = true;  // System initially locked
bool isSignupMode = false;  // Default to normal detection mode

unsigned long lastDebounceTime = 0;
unsigned long debounceDelay = 300; // Debounce time in milliseconds

void setup() {
    Serial.begin(115200);
    while (!Serial);

    pinMode(GREEN_LED, OUTPUT);
    pinMode(RED_LED, OUTPUT);
    pinMode(buzzer, OUTPUT);
    pinMode(SIGNUP_MODE_PIN, INPUT_PULLUP);  // Use internal pullup resistor
    pinMode(NORMAL_MODE_PIN, INPUT_PULLUP);  // Use internal pullup resistor

    myServo.attach(motorPin);
    myServo.write(0); // Start with the servo closed

    SPI.begin(19, 15, 23, SS_PIN);
    rfid.PCD_Init();

    digitalWrite(GREEN_LED, HIGH);  // Green LED is ON initially
    digitalWrite(RED_LED, LOW);
    digitalWrite(buzzer, LOW);

    // Connect to WiFi
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.println("Connecting to WiFi...");
    }
    Serial.println("Connected to WiFi");

    Serial.println("Place RFID tag near the reader:");
}

void loop() {
    // Check operation mode
    if (digitalRead(SIGNUP_MODE_PIN) == LOW && (millis() - lastDebounceTime) > debounceDelay) {
        isSignupMode = true;
        lastDebounceTime = millis();
        Serial.println("SIGNUP MODE ACTIVE");
        
        // Visual indicator for signup mode
        digitalWrite(GREEN_LED, LOW);
        digitalWrite(RED_LED, HIGH);
        delay(200);
        digitalWrite(RED_LED, LOW);
        delay(200);
        digitalWrite(RED_LED, HIGH);
        delay(200);
        digitalWrite(RED_LED, LOW);
        digitalWrite(GREEN_LED, HIGH);
    }
    
    if (digitalRead(NORMAL_MODE_PIN) == LOW && (millis() - lastDebounceTime) > debounceDelay) {
        isSignupMode = false;
        lastDebounceTime = millis();
        Serial.println("NORMAL MODE ACTIVE");
        
        // Visual indicator for normal mode
        digitalWrite(RED_LED, LOW);
        digitalWrite(GREEN_LED, HIGH);
        delay(200);
        digitalWrite(GREEN_LED, LOW);
        delay(200);
        digitalWrite(GREEN_LED, HIGH);
        delay(200);
        digitalWrite(GREEN_LED, LOW);
        delay(200);
        digitalWrite(GREEN_LED, HIGH);
    }

    // RFID detection
    if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
        String uidString = "";
        for (byte i = 0; i < rfid.uid.size; i++) {
            if (rfid.uid.uidByte[i] < 0x10)
                uidString += "0";
            uidString += String(rfid.uid.uidByte[i], HEX);
        }

        uidString.toLowerCase(); // Ensure consistent formatting

        Serial.println();
        Serial.print("RFID Tag detected, UID: ");
        Serial.println(uidString);

        // Beep to indicate scanning
        digitalWrite(buzzer, HIGH);
        delay(100);
        digitalWrite(buzzer, LOW);

        if (WiFi.status() == WL_CONNECTED) {
            if (isSignupMode) {
                // In signup mode, just broadcast the RFID for registration
                handleSignupMode(uidString);
            } else {
                // In normal mode, check if this RFID is authorized
                handleNormalMode(uidString);
            }
        } else {
            Serial.println("WiFi not connected. Reconnecting...");
            WiFi.reconnect();
        }

        rfid.PICC_HaltA();
        rfid.PCD_StopCrypto1();
        
        // Delay to prevent multiple reads of the same card
        delay(1000);
    }
}

void handleSignupMode(String uidString) {
    // First check if this RFID is already registered
    HTTPClient http;
    String fullUrl = String(checkRfidUrl) + uidString;
    http.begin(fullUrl);
    
    int httpResponseCode = http.GET();
    bool canUseRfid = false;
    
    if (httpResponseCode == 200) {
        String response = http.getString();
        DynamicJsonDocument doc(1024);
        deserializeJson(doc, response);
        
        canUseRfid = doc["isAvailable"];
        
        if (canUseRfid) {
            // RFID is available for registration
            Serial.println("RFID card is available for registration");
            digitalWrite(GREEN_LED, HIGH);
            digitalWrite(RED_LED, LOW);
            
            // Notify the WebSocket server about this RFID for registration
            HTTPClient httpWs;
            httpWs.begin(serverUrl);
            httpWs.addHeader("Content-Type", "application/json");
            
            String payload = "{\"uid\":\"" + uidString + "\", \"forRegistration\":true}";
            int wsResponseCode = httpWs.POST(payload);
            
            if (wsResponseCode == 200) {
                Serial.println("RFID sent to registration system successfully");
                
                // Visual confirmation
                for (int i = 0; i < 3; i++) {
                    digitalWrite(GREEN_LED, HIGH);
                    delay(200);
                    digitalWrite(GREEN_LED, LOW);
                    delay(200);
                }
                digitalWrite(GREEN_LED, HIGH);
            } else {
                Serial.print("Failed to send RFID for registration. HTTP code: ");
                Serial.println(wsResponseCode);
            }
            
            httpWs.end();
        } else {
            // RFID is already registered
            Serial.println("RFID card is already registered to another user");
            digitalWrite(GREEN_LED, LOW);
            digitalWrite(RED_LED, HIGH);
            
            // Visual error indication
            for (int i = 0; i < 3; i++) {
                digitalWrite(buzzer, HIGH);
                delay(100);
                digitalWrite(buzzer, LOW);
                delay(100);
            }
            
            delay(1000);
            digitalWrite(RED_LED, LOW);
            digitalWrite(GREEN_LED, HIGH);
        }
    } else {
        Serial.print("Failed to check RFID availability. HTTP code: ");
        Serial.println(httpResponseCode);
    }
    
    http.end();
}

void handleNormalMode(String uidString) {
    digitalWrite(GREEN_LED, LOW);  // Green LED OFF
    digitalWrite(RED_LED, HIGH);   // Red LED ON
    
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    String payload = "{\"uid\":\"" + uidString + "\", \"forRegistration\":false}";
    int httpResponseCode = http.POST(payload);
    
    if (httpResponseCode == 200) {
        Serial.println("RFID UID sent to backend successfully.");
        
        // Now wait for user approval/rejection response
        bool responseReceived = false;
        int retryCount = 0;
        const int maxRetries = 30; // Maximum 30 seconds of waiting
        
        while (!responseReceived && retryCount < maxRetries) {
            HTTPClient httpResponse;
            httpResponse.begin(responseUrl);
            int responseCode = httpResponse.GET();
            
            if (responseCode == 200) {
                String action = httpResponse.getString();
                action.trim();
                Serial.print("User response: ");
                Serial.println(action);
                
                if (action == "approve") {
                    Serial.println("Access approved by user.");
                    digitalWrite(RED_LED, LOW);
                    digitalWrite(GREEN_LED, HIGH);
                    digitalWrite(buzzer, LOW);
                    
                    // Unlock the door
                    myServo.write(90);
                    delay(5000);  // Keep door open for 5 seconds
                    myServo.write(0);
                    
                    responseReceived = true;
                } else if (action == "reject") {
                    Serial.println("Access rejected by user.");
                    
                    // Error indication
                    for (int i = 0; i < 3; i++) {
                        digitalWrite(buzzer, HIGH);
                        delay(200);
                        digitalWrite(buzzer, LOW);
                        delay(200);
                    }
                    
                    digitalWrite(RED_LED, LOW);
                    digitalWrite(GREEN_LED, HIGH);
                    responseReceived = true;
                }
            } else if (responseCode == 404) {
                // No response yet, keep waiting
                retryCount++;
                delay(1000);
            } else {
                Serial.print("Error getting response. HTTP code: ");
                Serial.println(responseCode);
                retryCount++;
                delay(1000);
            }
            
            httpResponse.end();
        }
        
        if (!responseReceived) {
            Serial.println("No response received within timeout period.");
            digitalWrite(RED_LED, LOW);
            digitalWrite(GREEN_LED, HIGH);
        }
    } else {
        Serial.print("Failed to send RFID data to backend. HTTP code: ");
        Serial.println(httpResponseCode);
        digitalWrite(RED_LED, LOW);
        digitalWrite(GREEN_LED, HIGH);
    }
    
    http.end();
}