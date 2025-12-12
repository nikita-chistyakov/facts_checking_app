# FCKTY - The Narrative Fact-Checker

**FCKTY** is an advanced AI-powered fact-checking and sentiment analysis engine designed to verify claims and analyze public discourse surrounding YouTube videos. Leveraging **Google Gemini 2.5** with **Search Grounding**, it automatically scrapes video context and community reactions to provide a rigorous truth rating and detecting logical fallacies.

[FCKTY App Preview](https://ai.studio/apps/drive/1xm8E54rdvOBNjEg7ZI0evOl_1OMItHyT)

<a href="https://ai.studio/apps/drive/1xm8E54rdvOBNjEg7ZI0evOl_1OMItHyT" target="_blank">FCKTY App Preview</a>

## 🚀 Features

*   **Automated Truth Verification**: Takes a YouTube URL, retrieves the transcript/summary, and cross-references specific claims against real-time Google Search results.
*   **Factual Accuracy Score**: Generates a 1-10 "Trust Score" based on the ratio of verified facts to misleading information.
*   **Discourse & Sentiment Analysis**:
    *   Analyzes public comments to gauge overall sentiment (Positive, Negative, Polarized).
    *   **Bot Probability**: Detects patterns indicative of astroturfing or automated spam.
    *   **Fallacy Detector**: Identifies common logical fallacies (Ad Hominem, Straw Man, False Equivalence) in the discourse.
*   **Interactive Assistant**: A built-in AI chat interface that allows users to ask follow-up questions about specific sources or claims found in the analysis.
*   **Source Transparency**: Lists direct links to the sources used to verify or debunk claims.

## 🛠️ Tech Stack

*   **Frontend**: React 19, TypeScript
*   **Styling**: Tailwind CSS (with custom animations and glassmorphism effects)
*   **AI Engine**: Google Gemini API (`gemini-2.5-flash`)
*   **Grounding**: Google Search Tool (built into the Gemini SDK)
*   **Visualization**: Recharts for data visualization (gauges and radial charts)

## 📋 Prerequisites

To run this project, you need:

1.  A modern web browser.
2.  A **Google Gemini API Key** with access to the `gemini-2.5-flash` model and Google Search Grounding.
    *   Get one here: [Google AI Studio](https://aistudio.google.com/)

## ⚡ Getting Started

### 1. Environment Setup

This project uses modern ES modules and imports dependencies directly via `esm.sh` for a lightweight, bundler-free development experience in this specific environment.

Ensure you have your API Key ready.

### 2. Configuration

The application expects the API Key to be available in the environment variables as `API_KEY`.

*(Note: In a standard local Create React App or Vite setup, you would create a `.env` file)*:
```env
REACT_APP_GEMINI_API_KEY=your_api_key_here
# or for Vite
VITE_API_KEY=your_api_key_here
```

### 3. Running the App

1.  Clone the repository.
2.  Install dependencies (if converting to a standard Node environment):
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

## 📖 Usage

1.  **Input URL**: Paste the link to a YouTube video you want to analyze.
2.  **Analyze**: Click "Run Deep Analysis". The system will:
    *   Identify the video title and author.
    *   Scrape/Search for the transcript and key arguments.
    *   Search for public reactions and comments.
    *   Perform a fact-check against trusted web sources.
3.  **Review Results**:
    *   Check the **Trust Score** and **Executive Summary**.
    *   Read through **Verified Claims** to see which specific points were True, False, or Misleading.
    *   Analyze the **Discourse** section to understand how the community is reacting.
4.  **Ask Questions**: Use the **FCKTY Assistant** at the bottom right to ask specific questions like *"Why was the claim about inflation marked misleading?"*

## 📂 Project Structure

```
├── components/
│   ├── Layout.tsx          # Main application shell and navigation
│   ├── InputForm.tsx       # URL input and submission handling
│   ├── Dashboard.tsx       # Main results visualization grid
│   └── ChatInterface.tsx   # AI Assistant chat widget
├── services/
│   └── geminiService.ts    # Integration with @google/genai SDK
├── types.ts                # TypeScript interfaces for Analysis results
├── App.tsx                 # Main entry point and state management
├── index.tsx               # DOM rendering
└── metadata.json           # Application metadata
```

## ⚠️ Disclaimer

This tool uses Generative AI to analyze content. While it uses Search Grounding to minimize hallucinations, it may occasionally produce incorrect results. Always verify important information with primary sources.

## 📄 License

MIT
