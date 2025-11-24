import requests

# Paste your API key here
API_KEY = "679d9c1c1328528d15a01854c367e37e"

# Test a simple weather request
url = f"https://api.openweathermap.org/data/2.5/weather?q=delhi&appid={API_KEY}"

try:
    response = requests.get(url)
    response.raise_for_status() # This will raise an HTTPError for bad responses (4xx or 5xx)
    data = response.json()
    print("Connection successful!")
    print(f"Weather data received: {data['weather'][0]['description']}, {data['main']['temp']}°C")
except requests.exceptions.RequestException as e:
    print("Connection failed!")
    print(f"An error occurred: {e}")
