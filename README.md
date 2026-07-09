# Promptify

Promptify is an AI voice assistant widget built with React, Vite, and Electron. It uses Whisper for accurate voice-to-text and LLaMA 3 to generate high-quality prompts or commands based on natural language input.

## Features

- **Global Shortcut**: Press `Ctrl+Shift+V` to open the widget over any application.
- **Auto-Listening**: Automatically starts listening when the widget opens.
- **Smart Generation**: Generates comprehensive AI prompts.
- **Auto-Pasting**: Injects the generated prompt directly into your currently focused application.

## Development

1. Run `npm install` to install dependencies.
2. Create a `.env` file with `VITE_GROQ_API_KEY=your_key_here`.
3. Run `npm run electron:dev` to start the application in development mode.

## Build

Run `npm run electron:build` to build the Windows executable.
