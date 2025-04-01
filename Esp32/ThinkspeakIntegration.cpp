#define GREEN_LED 8  
#define RED_LED 11   
#define buzzer 3 
#define motorPin 9  
#define SS_PIN 22   
#define RST_PIN 255  

#include <ESP32Servo.h>
#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "iPhone";
const char* password = "Batman@123";
const char* serverUrl = "http://172.20.10.4:4000/rfid-detected";
const char* responseUrl = "http://172.20.10.4:4000/rfid-response";

Servo myServo;
MFRC522 rfid(SS_PIN, RST_PIN);
String lastUid = "";

void setup() {
  Serial.begin(115200);
  pinMode(GREEN_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  pinMode(buzzer, OUTPUT);

  myServo.attach(motorPin);
  myServo.write(0);

  SPI.begin(19, 15, 23, SS_PIN);
  rfid.PCD_Init();

  digitalWrite(GREEN_LED, HIGH);
  digitalWrite(RED_LED, LOW);
  digitalWrite(buzzer, LOW);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
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

    lastUid = uidString;
    Serial.println("RFID UID: " + uidString);

    digitalWrite(GREEN_LED, LOW);
    digitalWrite(RED_LED, HIGH);
    digitalWrite(buzzer, HIGH);

    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(serverUrl);
      http.addHeader("Content-Type", "application/json");
      String payload = "{\"uid\":\"" + uidString + "\"}";
      int responseCode = http.POST(payload);
      http.end();
    }

    // Wait for approval/rejection
    bool decisionMade = false;
    while (!decisionMade) {
      if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(responseUrl);
        int code = http.GET();
        if (code == 200) {
          String action = http.getString();
          action.trim();
          Serial.println("Action received: " + action);

          if (action == "approve") {
            digitalWrite(RED_LED, LOW);
            digitalWrite(GREEN_LED, HIGH);
            digitalWrite(buzzer, LOW);
            myServo.write(90);
            delay(2000);
            myServo.write(0);
            decisionMade = true;
          } else if (action == "reject") {
            digitalWrite(GREEN_LED, LOW);
            digitalWrite(RED_LED, HIGH);
            digitalWrite(buzzer, LOW);
            decisionMade = true;
          }
        }
        http.end();
      }
      delay(1000);
    }

    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
  }
}
