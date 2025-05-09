# API Routes Documentation

This folder contains the API routes for the MemeKage meme Generator.

## Available Routes

### `/api/transcribe`
- **Method**: POST
- **Purpose**: Transcribes audio using Hugging Face's Wav2Vec2 model
- **Input**: Audio file (webm format) in form-data
- **Output**: JSON with transcribed text

### `/api/generate-caption`
- **Method**: POST
- **Purpose**: Generates an anime-style meme caption from transcribed text
- **Input**: JSON with `text` field
- **Output**: JSON with generated caption

### `/api/generate-meme`
- **Method**: POST
- **Purpose**: Creates a meme by overlaying caption on an anime image
- **Input**: JSON with `caption` field
- **Output**: JSON with URL to the generated meme image

### `/api/health`
- **Method**: GET
- **Purpose**: Health check endpoint
- **Output**: JSON with status and timestamp
