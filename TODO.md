# Bot Double-Click ChatGPT Integration

## Completed Tasks
- [x] Create BotController.php with /anlashis-data endpoint that sends transcriptText to ChatGPT API
- [x] Configure OpenAI API key in .env file
- [x] Update script.js double-click event to send transcriptText to API, display ChatGPT response, and speak it using TTS

## Summary
- Added new API endpoint `/anlashis-data` in `BotController.php` that accepts POST data with transcriptText, sends it to OpenAI's GPT-4 model, and returns the AI response as JSON
- Configured OpenAI API key in .env file for secure access
- Modified the bot's double-click event listener to send the current transcriptText value to the API, display the ChatGPT response in an alert, update the transcript text input, and speak the AI-generated message using text-to-speech
- The bot now provides intelligent responses to user input when double-clicked, both visually and audibly
