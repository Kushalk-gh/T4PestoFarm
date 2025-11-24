def detect_language_safe(text):
    text = text.strip().lower()
    english_defaults = [
        "hi", "hii", "hiii", "hello", "hey", "ok", "okay", "thanks", "thank you",
        "bye", "goodbye", "tata", "good bye", "see you", "later", "apple", "rotten",
        "scrub", "what", "are", "you", "doing", "how", "weather", "in", "delhi",
        "checking", "yes", "no", "please", "sorry", "excuse", "me", "help", "yes",
        "no", "maybe", "sure", "fine", "great", "awesome", "cool", "nice", "good",
        "bad", "sad", "happy", "angry", "love", "hate", "like", "dislike", "yes",
        "no", "okay", "alright", "sure", "fine", "great", "awesome", "cool", "nice"
    ]
    if text in english_defaults or len(text) < 3:
        return "en"
    try:
        from langdetect import detect
        return detect(text)
    except Exception:
        return "en"

print('Testing language detection:')
test_inputs = ['bye', 'tata', 'hi', 'hello', 'apple scrub', 'rotten apple due to scrub', 'what are you doing', 'weather in Delhi']
for inp in test_inputs:
    print(f'{inp} -> {detect_language_safe(inp)}')
