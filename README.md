# INFAKT - The Narrative Fact-Checker

**INFAKT** is an advanced AI-powered fact-checking and sentiment analysis engine designed to verify claims and analyze public discourse surrounding YouTube videos. Leveraging **Google Gemini 2.5** with **Search Grounding**, it automatically scrapes video context and community reactions to provide a rigorous truth rating and detecting logical fallacies.

![INFAKT Dashboard Preview](https://via.placeholder.com/1200x600?text=INFAKT+Dashboard+Preview)

## 🚀 Features

*   **Real-time Data Scraping**: Integrates with the **Piped API** to fetch actual video transcripts and top user comments without requiring official YouTube API authentication.
*   **Automated Truth Verification**: Cross-references specific claims found in the transcript against real-time Google Search results.
*   **Factual Accuracy Score**: Generates a 1-10 "Trust Score" based on the ratio of verified facts to misleading information.
*   **Discourse & Sentiment Analysis**:
    *   Analyzes actual user comments to gauge overall sentiment (Positive, Negative, Polarized).
    *   **Bot Probability**: Detects patterns indicative of astroturfing or automated spam in the comment section.
    *   **Fallacy Detector**: Identifies common logical fallacies (Ad Hominem, Straw Man, False Equivalence) in the discourse.
*   **Interactive Assistant**: A built-in AI chat interface that allows users to ask follow-up questions about specific sources or claims found in the analysis.
*   **Source Transparency**: Lists direct links to the sources used to verify or debunk claims.

## 🏗️ Architecture & Data Flow

1.  **Input**: User provides a YouTube URL.
2.  **Scraping Layer**: The app queries the **Piped API** (a privacy-friendly YouTube frontend) to retrieve:
    *   **Transcript (VTT)**: Parsed into plain text for claim extraction.
    *   **Comments**: Fetched to analyze community sentiment and bot probability.
3.  **Intelligence Layer (Gemini 2.5)**:
    *   The raw transcript and comments are injected into the system prompt.
    *   **Google Search Grounding** is triggered to verify extracted claims against external, authoritative sources (Academic papers, News, Government data).
4.  **Synthesis**: The model combines the internal video data with external search results to generate a structured JSON report.

## 🛠️ Tech Stack

*   **Frontend**: React 19, TypeScript
*   **Styling**: Tailwind CSS (with custom animations and glassmorphism effects)
*   **AI Engine**: Google Gemini API (`gemini-2.5-flash`)
*   **Data Source**: Piped API (for Transcripts/Comments) + Google Search (for Verification)
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
2.  **Analyze**: Click "Run Deep Analysis".
    *   *Note: If scraping fails due to network limitations, simply re-run the analysis.*
3.  **Review Results**:
    *   Check the **Trust Score** and **Executive Summary**.
    *   Read through **Verified Claims** to see which specific points were True, False, or Misleading.
    *   Analyze the **Discourse** section to understand how the community is reacting.
4.  **Ask Questions**: Use the **INFAKT Assistant** at the bottom right to ask specific questions like *"Why was the claim about inflation marked misleading?"*

## 📂 Project Structure

```
├── components/
│   ├── Layout.tsx          # Main application shell and navigation
│   ├── InputForm.tsx       # URL input and submission handling
│   ├── Dashboard.tsx       # Main results visualization grid
│   └── ChatInterface.tsx   # AI Assistant chat widget
├── services/
│   └── geminiService.ts    # Integration with @google/genai SDK & Piped API Scraper
├── types.ts                # TypeScript interfaces for Analysis results
├── App.tsx                 # Main entry point and state management
├── index.tsx               # DOM rendering
└── metadata.json           # Application metadata
```

## ⚠️ Disclaimer

This tool uses Generative AI to analyze content. While it uses Search Grounding and real data scraping to minimize hallucinations, it may occasionally produce incorrect results. Always verify important information with primary sources.

## 📄 License

MIT