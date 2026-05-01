import csv
import os
from django.http import JsonResponse

# -------------------------
# PATH TO CSV FILE
# -------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_FILE_PATH = os.path.join(BASE_DIR, 'weather_data.csv')


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