#include <ESP32Servo.h>
#include <SPI.h>
#include <MFRC522.h>
#include <math.h>

// Earth's radius in cm
#define R 637100000.0  

// LED & Buzzer Pins
#define GREEN_LED 8  
#define RED_LED 11   
#define buzzer 3 

// Servo Pin
#define motorPin 9  // Changed from 9 to 5 (ESP32 PWM-supported pin)

// RFID Pins (Corrected MISO & RST)
#define SS_PIN 22   
#define RST_PIN 21  // Changed from 255 to 21

Servo myServo;              
MFRC522 rfid(SS_PIN, RST_PIN); 

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
    myServo.write(0);  // Start servo at 0° position

    // Corrected SPI initialization (MISO now set to 13)
    SPI.begin(19, 13, 23, SS_PIN);
    Serial.println("SPI Initialized.");

    rfid.PCD_Init();
    Serial.println("RFID Reader initialized.");

    byte version = rfid.PCD_ReadRegister(MFRC522::VersionReg);
    Serial.print("RFID Firmware Version: 0x");
    Serial.println(version, HEX);

    if (version == 0x00 || version == 0xFF) {
        Serial.println("ERROR: RFID not detected. Check wiring!");
        while (true); // Halt execution
    }

    digitalWrite(GREEN_LED, HIGH);
    digitalWrite(RED_LED, LOW);
    digitalWrite(buzzer, LOW);
}

void loop() {
    if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
        Serial.println("RFID Tag detected!");

        String uidString = "";
        for (byte i = 0; i < rfid.uid.size; i++) {
            uidString += String(rfid.uid.uidByte[i], HEX);
            if (i < rfid.uid.size - 1) uidString += " ";
        }
        Serial.print("UID: ");
        Serial.println(uidString);

        // Turn on red LED & buzzer, turn off green LED
        digitalWrite(GREEN_LED, LOW);
        digitalWrite(RED_LED, HIGH);
        digitalWrite(buzzer, HIGH);

        // Activate the servo (open door)
        myServo.write(90);  // Move servo to 90°
        Serial.println("Servo opened to 90°!");

        delay(3000);  // Keep the door open for 3 seconds

        // Reset to original state
        myServo.write(0);  // Move servo back to 0°
        Serial.println("Servo closed to 0°!");

        digitalWrite(RED_LED, LOW);
        digitalWrite(buzzer, LOW);
        digitalWrite(GREEN_LED, HIGH);

        rfid.PICC_HaltA();
        rfid.PCD_StopCrypto1();
    }
    delay(500);
}
