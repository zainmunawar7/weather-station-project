import smbus2
import bme280
import time
import csv
import os
from datetime import datetime

# -------------------------
# SENSOR CONFIGURATION
# -------------------------
PORT = 1
ADDRESS = 0x76

# -------------------------
# INITIALISE SENSOR
# -------------------------
bus = smbus2.SMBus(PORT)
calibration_params = bme280.load_calibration_params(bus, ADDRESS)

# -------------------------
# CSV FILE PATH
# -------------------------
CSV_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'weather_data.csv')

# -------------------------
# CREATE CSV IF NOT EXISTS
# -------------------------
if not os.path.exists(CSV_FILE):
    with open(CSV_FILE, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['timestamp', 'temperature', 'humidity', 'pressure'])


def read_sensor():
    try:
        data = bme280.sample(bus, ADDRESS, calibration_params)

        temperature = round(data.temperature, 2)
        humidity = round(data.humidity, 2)
        pressure = round(data.pressure, 2)

        if not (-40 <= temperature <= 85):
            print("[Validation Error] Temperature out of range:", temperature)
            return None

        if not (0 <= humidity <= 100):
            print("[Validation Error] Humidity out of range:", humidity)
            return None

        if not (300 <= pressure <= 1100):
            print("[Validation Error] Pressure out of range:", pressure)
            return None

        return {
            'temperature': temperature,
            'humidity': humidity,
            'pressure': pressure
        }

    except Exception as e:
        print("[Sensor Error] Failed to read data:", e)
        return None


# -------------------------
# SAVE TO CSV
# -------------------------
def save_to_csv(data):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    with open(CSV_FILE, mode='a', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([
            timestamp,
            data['temperature'],
            data['humidity'],
            data['pressure']
        ])


def main():
    print("BME280 Sensor Running... Press CTRL+C to stop.\n")

    while True:
        data = read_sensor()

        if data:
            print(
                f"Temp: {data['temperature']}C | "
                f"Humidity: {data['humidity']}% | "
                f"Pressure: {data['pressure']} hPa"
            )
            save_to_csv(data)

        time.sleep(2)


if __name__ == "__main__":
    main()