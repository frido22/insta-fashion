# Insta-Fashion 👗

Insta-Fashion is an AI-powered style recommendation platform that analyzes Instagram fashion influencer content to provide personalized fashion recommendations. Using advanced image recognition and AI, it helps users discover and develop their personal style based on visual inspiration.

## Features 🌟

- Instagram grid screenshot analysis
- Advanced style recognition
- Personalized clothing recommendations
- Multi-price point suggestions
- Smart outfit combinations
- Style board creation
- Social sharing features

## Tech Stack 💻

- **Frontend**: Next.js 15.1, React 19, TailwindCSS
- **Backend**: Next.js API Routes
- **AI**: OpenAI GPT-4 Vision for image analysis
- **Image Processing**: Advanced computer vision for fashion recognition
- **Shopping Integration**: Major fashion retailer APIs

## Getting Started 🚀

1. Clone the repository:

```bash
git clone https://github.com/yourusername/insta-fashion.git
cd insta-fashion
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Then edit `.env` with your API keys:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables 🔐

Create a `.env.example` file in the root directory:

```env
# OpenAI API Configuration
OPENAI_API_KEY=

# Optional: Development Settings
NODE_ENV=development
```

## Usage 📱

1. Upload Instagram grid screenshots from your favorite fashion influencers
2. Specify your preferences (budget, size, favorite retailers)
3. Get personalized style recommendations
4. Create and share style boards
5. Shop recommended items directly through the platform

## Project Structure 📁

```
src/
├── app/
│   ├── api/         # API routes
│   ├── style/       # Style analysis features
│   └── boards/      # Style boards functionality
├── components/      # Reusable components
└── utils/          # Utility functions
```

## Contributing 🤝

Contributions are welcome! Please read our contributing guidelines for details.

## License 📄

This project is licensed under the MIT License - see the LICENSE file for details.
