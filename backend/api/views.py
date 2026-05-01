import csv
import os
import requests
from django.http import JsonResponse
from dotenv import load_dotenv

# -------------------------
# LOAD ENVIRONMENT VARIABLES
# -------------------------
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

# -------------------------
# PATH TO CSV FILE
# -------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_FILE_PATH = os.path.join(BASE_DIR, 'weather_data.csv')

# -------------------------
# OPENWEATHER API CONFIG
# -------------------------
API_KEY = os.getenv('OPENWEATHER_API_KEY')
BASE_URL = 'https://api.openweathermap.org/data/2.5'


def get_latest_reading(request):
    """
    Reads the CSV file and returns the latest sensor reading as JSON.
    """
    try:
        with open(CSV_FILE_PATH, newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            rows = list(reader)

            if not rows:
                return JsonResponse({'error': 'No data available'}, status=404)

            latest = rows[-1]

            return JsonResponse({
                'timestamp': latest['timestamp'],
                'temperature': float(latest['temperature']),
                'humidity': float(latest['humidity']),
                'pressure': float(latest['pressure']),
            })

    except FileNotFoundError:
        return JsonResponse({'error': 'CSV file not found'}, status=404)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def get_city_weather(request, city):
    """
    Fetches current weather for a given city from OpenWeatherMap.
    """
    try:
        response = requests.get(f'{BASE_URL}/weather', params={
            'q': city,
            'appid': API_KEY,
            'units': 'metric'
        })

        data = response.json()

        if response.status_code != 200:
            return JsonResponse({'error': data.get('message', 'City not found')}, status=404)

        return JsonResponse({
            'city': data['name'],
            'country': data['sys']['country'],
            'temperature': data['main']['temp'],
            'humidity': data['main']['humidity'],
            'pressure': data['main']['pressure'],
            'description': data['weather'][0]['description'],
        })

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def get_city_forecast(request, city):
    """
    Fetches hourly forecast for a given city from OpenWeatherMap.
    """
    try:
        response = requests.get(f'{BASE_URL}/forecast', params={
            'q': city,
            'appid': API_KEY,
            'units': 'metric'
        })

        data = response.json()

        if response.status_code != 200:
            return JsonResponse({'error': data.get('message', 'City not found')}, status=404)

        forecasts = []
        for item in data['list']:
            forecasts.append({
                'timestamp': item['dt_txt'],
                'temperature': item['main']['temp'],
                'humidity': item['main']['humidity'],
                'pressure': item['main']['pressure'],
                'description': item['weather'][0]['description'],
            })

        return JsonResponse({
            'city': data['city']['name'],
            'country': data['city']['country'],
            'forecasts': forecasts
        })

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)