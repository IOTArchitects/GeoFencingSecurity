#include <ESP32Servo.h>
#include <math.h>

// Earth's radius in cm (6371 km = 637100000 cm)
#define R 637100000.0  

// LED Pins
#define GREEN_LED 8  
#define RED_LED 11   
#define buzzer 3 
#define motorPin 9  // Servo connected to GPIO 9

Servo myServo;  // Create a servo object

// Function to convert degrees to radians
double toRadians(double degree) {
    return degree * (M_PI / 180.0);
}

// Haversine formula to calculate distance in cm
double haversineDistance(double lat1, double lon1, double lat2, double lon2) {
    lat1 = toRadians(lat1);
    lon1 = toRadians(lon1);
    lat2 = toRadians(lat2);
    lon2 = toRadians(lon2);

    double dlat = lat2 - lat1;
    double dlon = lon2 - lon1;

    double a = pow(sin(dlat / 2), 2) + cos(lat1) * cos(lat2) * pow(sin(dlon / 2), 2);
    double c = 2 * atan2(sqrt(a), sqrt(1 - a));

    return R * c;  // Distance in cm
}

void setup() {
    Serial.begin(9600);
    
    // Set LED pins as OUTPUT
    pinMode(GREEN_LED, OUTPUT);
    pinMode(RED_LED, OUTPUT);
    pinMode(buzzer, OUTPUT);

    // Attach the servo to its pin
    myServo.attach(motorPin);  

    // Initial positions (Green LED ON, Servo at 0°)
    digitalWrite(GREEN_LED, HIGH);
    digitalWrite(RED_LED, LOW);
    digitalWrite(buzzer, LOW);
    myServo.write(0);  // Keep servo at 0° initially

    // Given close coordinates (small distance)
    double lat1 = 40.730610, lon1 = -73.935242;
    double lat2 = 40.730611, lon2 = -73.935243;

    // Compute actual distance
    double actualDistance = haversineDistance(lat1, lon1, lat2, lon2);

    // Print computed distance
    Serial.print("Computed Distance: ");
    Serial.print(actualDistance);
    Serial.println(" cm");

    Serial.println("Enter a threshold distance in cm:");
}

void loop() {
    if (Serial.available() > 0) {  // Check if user input is available
        double inputDistance = Serial.parseFloat();  // Read input distance from Serial Monitor

        // Given close coordinates
        double actualDistance = haversineDistance(40.730610, -73.935242, 40.730611, -73.935243);

        Serial.print("Threshold Distance Entered: ");
        Serial.print(inputDistance);
        Serial.println(" cm");

        Serial.print("Computed Distance: ");
        Serial.print(actualDistance);
        Serial.println(" cm");

        // LED & Servo Control Logic
        if (inputDistance > actualDistance) {  
            digitalWrite(GREEN_LED, LOW);  // Turn OFF green LED
            digitalWrite(RED_LED, HIGH);   // Turn ON red LED
            digitalWrite(buzzer, HIGH);

            myServo.write(90);  // Rotate servo to 90° (adjust as needed)
            Serial.println("Red LED ON - Servo Activated!");

        } else {
            digitalWrite(GREEN_LED, HIGH); // Keep green LED ON
            digitalWrite(RED_LED, LOW);    // Keep red LED OFF
            digitalWrite(buzzer, LOW);

            myServo.write(0);  // Move servo back to 0°
            Serial.println("Green LED ON - Servo Deactivated");
        }

        // Flush serial buffer to avoid multiple readings
        while (Serial.available() > 0) {
            Serial.read();
        }

        Serial.println("Enter a new threshold distance in cm:");
    }
}
