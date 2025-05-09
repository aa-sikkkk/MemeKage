# MemeKage

A Next.js application that lets users record voice messages, transcribe them, and turn them into anime memes.

## Features

- Record audio using the browser's MediaRecorder API
- Transcribe audio using Hugging Face's Wav2Vec2 model
- Generate funny anime-style captions
- Create memes by overlaying captions on anime images
- Download and share generated memes

## Tech Stack

- **Frontend**: Next.js (App Router), Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **AI**: Hugging Face Inference API
- **Image Processing**: node-canvas

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Hugging Face API key

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone 
   cd memekage
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create a `.env.local` file in the root directory with the following variables:
   \`\`\`
   HUGGINGFACE_API_KEY=your_huggingface_api_key
   \`\`\`

4. Create the necessary folders:
   \`\`\`bash
   mkdir -p public/images public/generated
   \`\`\`

5. Add some anime images to the `public/images` folder named:
   - anime1.jpg
   - anime2.jpg
   - anime3.jpg
   - anime4.jpg
   - anime5.jpg

### Running Locally

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see the application.

### Building for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## Deployment to Vercel

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Add the environment variables in the Vercel dashboard
4. Deploy!

## Project Structure

- `/src/app`: Next.js App Router pages and layouts
- `/src/app/api`: API routes for transcription, caption generation, and meme creation
- `/src/components`: React components including the main meme generator
- `/src/hooks`: Custom React hooks
- `/src/lib`: Utility functions
- `/public`: Static assets including anime images and generated memes


