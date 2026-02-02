# Voice Transcription Demo

A simple web application for recording audio and transcribing speech to text using Google Gemini 2.0 Flash API.

## Features

- 🎤 Record audio and insert transcribed text at cursor position
- 📊 Real-time audio waveform visualization during recording
- 🎨 Modern UI with glassmorphism effect
- ⚡ Fast processing with Gemini 2.0 Flash
- 🌐 Multi-language support

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure Gemini API Key:**

   Create a `.env.local` file in the root directory:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your Gemini API key:

   ```
   VITE_GEMINI_API_KEY=your-api-key-here
   ```

   Get your API key from: https://aistudio.google.com/apikey

3. **Start development server:**

   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:5173`

## Usage

1. Type text in the input field and place cursor at desired insertion position
2. Click the microphone button to start recording
3. Speak clearly into the microphone
4. Click confirm (✓) to complete or cancel (✗) to discard the recording
5. Transcribed text will be automatically inserted at cursor position

## Tech Stack

- **Vite** - Fast build tool
- **React** - UI framework
- **TypeScript** - Type safety
- **Google Gemini 2.0 Flash** - Speech-to-text transcription
- **react-audio-voice-recorder** - Audio recording hook
- **react-audio-visualize** - Real-time audio visualization

## Notes

- Requires HTTPS or localhost for microphone access
- Supports Chrome, Firefox, Edge (latest versions)
- Gemini API is free with quota limits

## Project Structure

```
src/
├── components/
│   ├── VoiceInput.tsx         # Voice recording and input component
│   └── VoiceInput.css         # Styles for VoiceInput
├── services/
│   └── whisperService.ts      # Gemini API integration
├── App.tsx                     # Main application component
├── App.css                     # Component styles
├── index.css                   # Global styles
└── main.tsx                    # Entry point
```
