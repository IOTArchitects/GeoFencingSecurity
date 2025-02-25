import serial
import pynmea2
import requests
from datetime import datetime

# Setup serial connection (adjust the COM port and baud rate as needed)
ser = serial.Serial('COM9', baudrate=9600, timeout=1)

# ThingSpeak channel details
WRITE_API_KEY = "JTOV3ORZ4XTJHBEW"
THINGSPEAK_URL = "https://api.thingspeak.com/update.json"

print("Reading GPS data and sending to ThingSpeak channel 2855678...")

while True:
    try:
        line = ser.readline().decode('ascii', errors='replace').strip()
        if line.startswith('$GPGGA'):
            msg = pynmea2.parse(line)
            
            # Combine today's date with the GPS fix time to form a full timestamp.
            timestamp_full = datetime.combine(datetime.utcnow().date(), msg.timestamp)
            timestamp_str = timestamp_full.strftime("%Y-%m-%d %H:%M:%S")
            
            # Map GPS data to ThingSpeak fields
            params = {
                "api_key": WRITE_API_KEY,
                "field1": msg.latitude,      # Latitude
                "field2": msg.longitude,     # Longitude
                "field3": msg.altitude,      # Altitude
                "field4": msg.num_sats,      # Number of Satellites
                "created_at": timestamp_str  # Timestamp in ISO 8601 format
            }
            
            response = requests.get(THINGSPEAK_URL, params=params)
            
            if response.status_code == 200:
                print("Update successful, entry ID:", response.text)
            else:
                print("Error updating ThingSpeak channel. Status code:", response.status_code)
            
            print("-" * 40)
    except serial.SerialException as e:
        print("Serial error:", e)
        break
    except pynmea2.ParseError as pe:
        print("Parse error, skipping:", pe)
        continue
