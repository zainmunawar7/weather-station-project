import smbus2
import bme280
import time

# -------------------------
# SENSOR CONFIGURATION
# -------------------------
PORT = 1
ADDRESS = 0x76  # change to 0x77 if i2cdetect shows 77

# -------------------------
# INITIALISE SENSOR
# -------------------------
bus = smbus2.SMBus(PORT)
calibration_params = bme280.load_calibration_params(bus, ADDRESS)


def read_sensor():
    """
    Reads temperature, humidity, and pressure from BME280 sensor.
    Returns:
        dict: sensor readings or None if error occurs or data is invalid
    """
    try:
        data = bme280.sample(bus, ADDRESS, calibration_params)

        temperature = round(data.temperature, 2)
        humidity = round(data.humidity, 2)
        pressure = round(data.pressure, 2)

        # -------------------------
        # VALIDATE SENSOR READINGS
        # -------------------------
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
            "temperature": temperature,
            "humidity": humidity,
            "pressure": pressure
        }

    except Exception as e:
        print("[Sensor Error] Failed to read data:", e)
        return None


def main():
    print("BME280 Sensor Running... Press CTRL+C to stop.\n")

    while True:
        data = read_sensor()

        if data:
            print(
                f"Temp: {data['temperature']}°C | "
                f"Humidity: {data['humidity']}% | "
                f"Pressure: {data['pressure']} hPa"
            )

        time.sleep(2)


if __name__ == "__main__":
    main()