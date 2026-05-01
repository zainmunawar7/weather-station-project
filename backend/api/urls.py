from django.urls import path
from . import views

urlpatterns = [
    path('weather/', views.get_latest_reading, name='get_latest_reading'),
]