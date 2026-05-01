from django.urls import path
from . import views

urlpatterns = [
    path('weather/', views.get_latest_reading, name='get_latest_reading'),
    path('weather/<str:city>/', views.get_city_weather, name='get_city_weather'),
    path('forecast/<str:city>/', views.get_city_forecast, name='get_city_forecast'),
]