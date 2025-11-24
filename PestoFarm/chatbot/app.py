import os
import io
from flask import Flask, request, jsonify
from flask_cors import CORS
import speech_recognition as sr
from PIL import Image
# Removed 'requests' as it's no longer strictly needed here, 
# but keeping it if other parts rely on it. Let's keep the imports clean.
# import requests 

# Import the core logic file, which now uses Gemini for image analysis
import chatbotMultiModel 

app = Flask(__name__)
CORS(app)

# 🌿 Supported categories
CATEGORIES = ['flowers', 'fruits', 'vegetables', 'intents']

# -----------------------------------------------------
# 💬 Text Chat Endpoint
# -----------------------------------------------------
@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json(force=True)
    message = data.get('message', '').strip()
    city = data.get('city', None)
    category = data.get('category', None)

    if not message:
        return jsonify({"error": "No message provided."}), 400

    # Ensure the category is valid based on the logic in chatbotMultiModel
    if not category or category not in chatbotMultiModel.CATEGORIES:
        valid_cats = ', '.join(chatbotMultiModel.CATEGORIES)
        return jsonify({"error": f"Invalid category. Choose from: {valid_cats}"}), 400

    # Note: Weather handling is now generally managed within get_response
    # in chatbotMultiModel, which is a cleaner design.
    # However, for consistency with the original code's explicit check:
    if "weather" in message.lower() or "temperature" in message.lower():
        weather_data = chatbotMultiModel.get_weather(city)
        if "error" in weather_data:
            return jsonify({"response": weather_data["error"]})
        
        # This part assumes chatbotMultiModel.get_weather returns raw data.
        # It's generally better to rely on chatbotMultiModel.get_response to format the output.
        # Let's call get_response to ensure translation/full logic is applied.
        pass # Fall through to general chatbot logic

    # 💬 General chatbot text logic (handles weather, intents, and category-specific queries)
    try:
        # Note: We are using a default language 'en' here. The core logic in 
        # chatbotMultiModel handles language detection and translation based on the message itself.
        response_text = chatbotMultiModel.get_response(message, category, city)
        return jsonify({"response": response_text})
    except Exception as e:
        print(f"Chat route error: {e}")
        return jsonify({"error": f"Internal error: {str(e)}"}), 500

# -----------------------------------------------------
# 🧠 Multimodal (Text + Image + Audio)
# -----------------------------------------------------
@app.route('/multimodal', methods=['POST'])
def multimodal():
    audio_file = request.files.get('audio')
    image_file = request.files.get('image')
    
    # Text data from the form
    message = request.form.get('message', '')
    city = request.form.get('city', '')
    category = request.form.get('category', 'intents')

    user_text = None
    final_user_input = message # Start with direct text input

    # 🎤 AUDIO PROCESSING
    if audio_file:
        recognizer = sr.Recognizer()
        audio_io = io.BytesIO(audio_file.read())
        try:
            # We assume the audio file is in a supported format like WAV
            with sr.AudioFile(audio_io) as source:
                audio_data = recognizer.record(source)
            user_text = recognizer.recognize_google(audio_data)
            final_user_input = user_text # Use transcribed text if successful
        except Exception as e:
            user_text = f"[Audio not clear: {e}]"
            
    # 🖼️ IMAGE PROCESSING (Now using Gemini API)
    image_result = ""
    if image_file:
        image_bytes = image_file.read()
        image_result = chatbotMultiModel.analyze_image_gemini(image_bytes)

    # 💬 TEXT RESPONSE
    chatbot_response = ""
    
    # --- 💡 FIX: Logic to suppress chatbot response for generic image inputs ---
    
    # List of generic phrases (case-insensitive)
    generic_image_messages = ["analyze this image", "scan this photo", "check this image", "image analysis", ""]
    
    should_run_chatbot = True
    
    # Normalize the user input for the check
    normalized_input = final_user_input.lower().strip()
    
    # Condition to skip chatbot: If we have an image result AND the input is generic.
    if image_result and normalized_input in generic_image_messages:
        should_run_chatbot = False
        
    # Only process text if we have a valid non-generic input
    if should_run_chatbot and normalized_input and normalized_input != "[audio not clear]":
        try:
            chatbot_response = chatbotMultiModel.get_response(final_user_input, category, city)
        except Exception as e:
            chatbot_response = f"Chatbot Error: {str(e)}"

    # 🧩 Combine outputs
    final_response_parts = []
    
    # 1. User Input/Transcription
    if audio_file and user_text and user_text != "[Audio not clear]":
        final_response_parts.append(f"🎤 You said: {user_text}")
    elif message:
        final_response_parts.append(f"💬 Message: {message}")

    # 2. Image Analysis Result
    if image_result:
        final_response_parts.append(f"🖼️ Image Analysis:\n{image_result}")

    # 3. Chatbot Response (based on text/audio)
    if chatbot_response:
        final_response_parts.append(f"🤖 Chatbot: {chatbot_response}")

    final_response = "\n\n".join(final_response_parts)
    
    if not final_response:
        final_response = "No valid input (text, audio, or image) was processed."

    return jsonify({"response": final_response.strip()})

# -----------------------------------------------------
# 📸 Simple Image Upload Endpoint
# -----------------------------------------------------
@app.route('/upload', methods=['POST'])
def upload_image():
    image_file = request.files.get('file')
    if not image_file:
        return jsonify({"error": "No image provided."}), 400

    image_bytes = image_file.read()
    
    # ⚠️ Call the new Gemini-based function from the core logic file
    result_text = chatbotMultiModel.analyze_image_gemini(image_bytes)
    
    # We return the result under 'label' for backward compatibility with the old frontend
    return jsonify({"label": result_text})

# -----------------------------------------------------
# 🔊 Text-to-Speech Placeholder
# -----------------------------------------------------
@app.route('/tts', methods=['POST'])
def tts():
    # Placeholder for actual TTS implementation
    return jsonify({"response": "🔊 Text-to-speech coming soon!"})

# -----------------------------------------------------
# 🚀 Main
# -----------------------------------------------------
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host='0.0.0.0', port=port)