import gradio as gr
import speech_recognition as sr
# We'll import the get_response function from the most recent chatbot file
from chatbotMultiModel import get_response

def chat_with_audio(audio):
    """
    Transcribes audio to text and gets a response from the chatbot.
    """
    if audio is None:
        return "No audio input detected. Please try again."

    # Initialize the speech recognition tool
    recognizer = sr.Recognizer()

    try:
        # Use the audio file provided by Gradio
        with sr.AudioFile(audio) as source:
            # Read the audio data from the file
            audio_data = recognizer.record(source)

        # Use Google's Web Speech API to transcribe the audio to text
        text = recognizer.recognize_google(audio_data)
        
        # This print statement helps you debug the recognized text in the terminal
        print(f"[DEBUG] Recognized text: {text}")

    except sr.UnknownValueError:
        # This error occurs if the speech service cannot understand the audio
        return "Sorry, I could not understand your audio."
    except sr.RequestError as e:
        # This error occurs if there is a problem with the API request
        return f"Could not request results from speech service; {e}"
    except Exception as e:
        # Catch any other unexpected errors
        return f"An error occurred: {e}"

    # After successful transcription, get the chatbot's response
    # The `get_response` function is now being called with the transcribed text
    response = get_response(text, city_name=None)
    
    # Format the final output to display both the question and the response
    return f"Question: {text}\n\nChatbot: {response}"

# Gradio interface to create a user-friendly web UI
demo = gr.Interface(
    fn=chat_with_audio,
    inputs=gr.Audio(sources="microphone", type="filepath"),
    outputs="text",
    live=True,  # Set to True for live transcription
    title="Pesticide Recommendation Chatbot (Voice Input)"
)

if __name__ == "__main__":
    demo.launch()
