#include <ESP32Servo.h>
#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <HTTPClient.h>

// WiFi credentials
const char* ssid = "iPhone";
const char* password = "Batman@123";

// Backend server URL
const char* serverUrl = "http://172.20.10.4:4000/rfid-detected";
const char* responseUrl = "http://172.20.10.4:4000/rfid-response";

// Earth's radius in cm (6371 km = 637100000 cm)
#define R 637100000.0  

// LED & Buzzer Pins
#define GREEN_LED 8  
#define RED_LED 11   
#define buzzer 3 

// Servo Pin
#define motorPin 9  

// RFID Pins (using your specified wiring)
#define SS_PIN 22   
#define RST_PIN 255  

Servo myServo;              
MFRC522 rfid(SS_PIN, RST_PIN); 

bool isLocked = true;  // System initially locked (Green LED ON)

void setup() {
    Serial.begin(115200);
    while (!Serial);

    pinMode(GREEN_LED, OUTPUT);
    pinMode(RED_LED, OUTPUT);
    pinMode(buzzer, OUTPUT);

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
    if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
        String uidString = "";
        for (byte i = 0; i < rfid.uid.size; i++) {
            if (rfid.uid.uidByte[i] < 0x10)
                uidString += "0";
            uidString += String(rfid.uid.uidByte[i], HEX);
            if (i < rfid.uid.size - 1)
                uidString += " ";
        }

        Serial.println();
        Serial.print("RFID Tag detected, UID: ");
        Serial.println(uidString);

        // Activate the buzzer and red LED
        digitalWrite(GREEN_LED, LOW);   // Green LED OFF
        digitalWrite(RED_LED, HIGH);    // Red LED ON
        digitalWrite(buzzer, HIGH);     // Buzzer ON

        // Send RFID data to backend
        if (WiFi.status() == WL_CONNECTED) {
            HTTPClient http;
            http.begin(serverUrl);
            http.addHeader("Content-Type", "application/json");

            String payload = "{\"uid\":\"" + uidString + "\"}";
            int httpResponseCode = http.POST(payload);

            if (httpResponseCode == 200) {
                Serial.println("RFID UID sent to backend successfully.");

                bool responseReceived = false;
                while (!responseReceived) {
                    HTTPClient httpResponse;
                    httpResponse.begin(responseUrl);
                    int responseCode = httpResponse.GET();

                    if (responseCode == 200) {
                        String action = httpResponse.getString();
                        action.trim(); // Ensure no extra spaces
                        Serial.print("User response: ");
                        Serial.println(action);

                        if (action == "approve") {
                            Serial.println("Access approved by user.");
                            digitalWrite(RED_LED, LOW);    // Red LED OFF
                            digitalWrite(GREEN_LED, HIGH); // Green LED ON
                            digitalWrite(buzzer, LOW);     // Buzzer OFF
                            myServo.write(90);            // Rotate servo to 90 degrees
                            delay(2000);                  // Keep open for 2 sec
                            myServo.write(0);             // Rotate servo back to 0 degrees
                        } else if (action == "reject") {
                            Serial.println("Access rejected by user.");
                            digitalWrite(RED_LED, HIGH);   // Keep Red LED ON
                            digitalWrite(GREEN_LED, LOW);  // Ensure Green LED is OFF
                            digitalWrite(buzzer, LOW);     // Turn OFF buzzer
                        }

                        responseReceived = true;
                    } else {
                        Serial.print("Failed to fetch user response. HTTP code: ");
                        Serial.println(responseCode);
                    }

                    httpResponse.end();
                    delay(1000); // Poll every second
                }
            } else {
                Serial.print("Failed to send RFID data to backend. HTTP code: ");
                Serial.println(httpResponseCode);
            }

            http.end();
        } else {
            Serial.println("WiFi not connected.");
        }

        rfid.PICC_HaltA();
        rfid.PCD_StopCrypto1();
    }
}
