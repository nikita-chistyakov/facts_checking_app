# Application Architecture Overview

## High-Level Summary
The application is a **Client-Side Single Page Application (SPA)** built with **React** and **TypeScript**. It is designed to be containerized using **Docker** and served via **Nginx**. The core logic involves direct interaction with the **Google Gemini API** from the client browser to perform fact-checking and analysis of YouTube videos.

## Technology Stack

### Frontend
-   **Framework**: React 19
-   **Build Tool**: Vite
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS (configured via CDN/in-browser script for runtime flexibility)
-   **UI Components**: Custom components (`Layout`, `InputForm`, `Dashboard`)
-   **Visualization**: Recharts (likely for sentiment/score visualization)

### Backend / Services
-   **No Backend Server**: The app does not have its own backend API server.
-   **AI Service**: Google Gemini API (`gemini-2.5-flash` model)
    -   Used for "Deep Research" via Google Search grounding.
    -   Handles content analysis, sentiment extraction, and fact-checking.
-   **Metadata Service**: `noembed.com` (used to fetch video titles/authors without API keys).

### Deployment & Infrastructure
-   **Containerization**: Docker (Multi-stage build)
    -   Stage 1: Node.js builder to compile the React app.
    -   Stage 2: Nginx alpine image to serve static files.
-   **Web Server**: Nginx (configured on port 8080)
-   **Environment Management**: Runtime injection pattern.
    -   `env.sh` script runs at container startup.
    -   It reads environment variables (like `GEMINI_API_KEY`) and writes them to `env-config.js`.
    -   The frontend loads this script to access secrets via `window.env`.

## Data Flow

1.  **User Input**: User provides a YouTube URL.
2.  **Metadata Fetch**: App calls `noembed.com` to get the video title and author.
3.  **AI Analysis**:
    -   App constructs a complex prompt including the video metadata.
    -   App calls `Gemini API` directly from the browser.
    -   Gemini uses its **Search Tool** to find transcripts, reviews, and related discussions.
    -   Gemini returns a structured JSON response with accuracy ratings, claims, and sentiment.
4.  **Visualization**: The React frontend parses the JSON and renders the dashboard.
5.  **Chat**: Users can ask follow-up questions, which creates a new chat session with Gemini, pre-seeded with the analysis context.

## Key Architectural Patterns

-   **Thick Client**: All business logic, including API orchestration and data transformation, happens in the browser.
-   **Runtime Configuration**: The Docker image is "build once, deploy anywhere" because configuration is injected at runtime, not build time.
-   **Statelessness**: The application maintains no persistent state (database) of its own; it relies entirely on the session state and external API responses.
