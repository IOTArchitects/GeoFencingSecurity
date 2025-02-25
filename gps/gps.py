import serial
import pynmea2

# Adjust the COM port and baud rate if needed.
# You can find the correct COM port from your Device Manager.
ser = serial.Serial('COM9', baudrate=9600, timeout=1)

print("Reading GPS data...")

while True:
    try:
        # Read a line from the serial port
        line = ser.readline().decode('ascii', errors='replace').strip()
        if line.startswith('$GPGGA'):
            # Parse the GPGGA sentence which contains position and satellite data
            msg = pynmea2.parse(line)
            print("Latitude: {} {}".format(msg.latitude, msg.lat_dir))
            print("Longitude: {} {}".format(msg.longitude, msg.lon_dir))
            print("Satellites: {}".format(msg.num_sats))
            print("-" * 40)
    except serial.SerialException as e:
        print("Serial error:", e)
        break
    except pynmea2.ParseError as e:
        # Skip lines that don't parse correctly
        continue
