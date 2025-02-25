#include <ESP32Servo.h>
#include <SPI.h>
#include <MFRC522.h>
#include <math.h>

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

double toRadians(double degree) {
    return degree * (M_PI / 180.0);
}

double haversineDistance(double lat1, double lon1, double lat2, double lon2) {
    lat1 = toRadians(lat1);
    lon1 = toRadians(lon1);
    lat2 = toRadians(lat2);
    lon2 = toRadians(lon2);

    double dlat = lat2 - lat1;
    double dlon = lon2 - lon1;

    double a = pow(sin(dlat / 2), 2) + cos(lat1) * cos(lat2) * pow(sin(dlon / 2), 2);
    double c = 2 * atan2(sqrt(a), sqrt(1 - a));

    return R * c;  
}

void setup() {
    Serial.begin(115200);
    while (!Serial);

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

        digitalWrite(GREEN_LED, LOW);
        digitalWrite(RED_LED, HIGH);
        digitalWrite(buzzer, HIGH);
        myServo.write(90); // Keep door open
        Serial.println("Access granted! Servo at 90 degrees.");

        rfid.PICC_HaltA();
        rfid.PCD_StopCrypto1();

        isLocked = false; // System stays in unlocked state
    }

    // Wait for user input to reset system
    if (!isLocked && Serial.available() > 0) {
        char input = Serial.read();
        if (input == 'R' || input == 'r') { // Reset command
            Serial.println("Resetting system...");

            digitalWrite(RED_LED, LOW);
            digitalWrite(buzzer, LOW);
            digitalWrite(GREEN_LED, HIGH);
            myServo.write(0); // Lock the door

            isLocked = true;
            Serial.println("System reset. Place RFID tag to unlock again.");
        }
        while (Serial.available() > 0) {
            Serial.read(); // Clear buffer
        }
    }
}
