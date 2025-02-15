#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "iPhone";
const char* password = "Batman@123";
const char* apiKey = "EOBFEIONT10IWMSZ";
const char* server = "http://api.thingspeak.com/update";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi");

  // Send static data for testing
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = String(server) + "?api_key=" + apiKey +
                 "&field1=12.345678&field2=98.765432";
    Serial.print("Sending static data: ");
    Serial.println(url);
    http.begin(url);
    int httpCode = http.GET();
    String payload = http.getString();
    Serial.print("HTTP Code: ");
    Serial.println(httpCode);
    Serial.print("Response payload: ");
    Serial.println(payload);
    http.end();
  }
}

void loop() {
  // Nothing here
}
