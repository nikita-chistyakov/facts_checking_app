# INFAKT System Architecture

This document provides a technical overview of the INFAKT application, detailing the data flow, component structure, and integration logic between the Frontend, Piped API, and Google Gemini API.

## 🔄 System Context Diagram

INFAKT operates as a client-side Single Page Application (SPA) that orchestrates data fetching and AI synthesis directly from the browser.

```mermaid
graph TD
    User[User] -->|Enters YouTube URL| GUI[React Frontend]
    
    subgraph "Data Acquisition Layer"
        GUI -->|1. Request Metadata| Piped[Piped API (Public Instance)]
        Piped -->|2. Return Stream Data| GUI
        GUI -->|3. Request Comments| Piped
        Piped -->|4. Return Comments JSON| GUI
        GUI -->|5. Request Subtitles| Piped
        Piped -->|6. Return VTT File| GUI
    end

    subgraph "Intelligence Layer"
        GUI -->|7. Send Context + Prompt| Gemini[Gemini 2.5 Flash API]
        Gemini -->|8. Perform Search Grounding| GoogleSearch[Google Search]
        GoogleSearch -->|9. Return Sources| Gemini
        Gemini -->|10. Synthesize JSON Report| GUI
    end

    GUI -->|11. Render Dashboard| User
```

## 🧩 Component Hierarchy

The application follows a standard React component tree structure, prioritizing separation of concerns between layout, user input, and data visualization.

```text
App.tsx (Root / State Container)
├── Layout.tsx (Theme Context / Navigation / Shell)
│   └── (Children)
├── InputForm.tsx (URL Validation / Submission / Loading State)
└── Dashboard.tsx (Analysis Visualization)
    ├── ScoreGauge (Recharts RadialBar - Accuracy Score)
    ├── InfoTooltip (Contextual Help)
    ├── ClaimCard (Individual Fact Check Item)
    │   └── ConfidenceMeter (Visual Indicator)
    └── ChatInterface.tsx (RAG-lite Chat Widget)
        └── Google GenAI Chat Session (Stateful Conversation)
```

## 💾 Data Flow & State Management

### 1. The Scraping Pipeline (`geminiService.ts`)
Unlike traditional scrapers that run on a backend, INFAKT utilizes the **Piped API** to fetch data client-side.
*   **Endpoint 1**: `/streams/{videoId}` - Retrieves video metadata and available subtitle tracks.
*   **Endpoint 2**: `/comments/{videoId}` - Retrieves top-level comments for sentiment analysis.
*   **Processing**:
    *   VTT cleaning regex removes timestamps and HTML tags to save context tokens.
    *   Comments are concatenated into a single "Public Discourse" block.

### 2. The Prompt Engineering Strategy
We utilize a **Hybrid-Context Prompt** approach:
1.  **System Instruction**: Enforces the persona of a rigorous fact-checker and defines the JSON output schema strictly.
2.  **Dynamic Context Injection**:
    *   If scraping succeeds: The actual transcript text is injected into the prompt.
    *   If scraping fails: Fallback instructions tell the model to use Google Search to find the video's content summary.
3.  **Tool Use**: The `googleSearch` tool is enabled with `thinkingBudget: 8192` (Thinking Config), allowing the model to perform multi-step verification before generating the final JSON.

### 3. Response Parsing
*   The raw text response from Gemini is regex-matched for a JSON code block.
*   Grounding Metadata (URLs) are extracted separately from the `candidates[0].groundingMetadata` object to provide clickable citations.

## 🛡️ Technical Decisions & Trade-offs

| Decision | Context | Trade-off |
| :--- | :--- | :--- |
| **Client-Side Scraping** | Uses Piped API directly from the browser. | **Pro**: No backend server costs/maintenance. **Con**: Subject to CORS policies or API rate limits on public instances. |
| **Gemini 2.5 Flash** | Used for both analysis and chat. | **Pro**: Massive context window (1M tokens) easily fits hour-long transcripts + high speed. **Con**: None significant for this use case. |
| **Tailwind CSS** | Styling engine. | **Pro**: Rapid development, dark mode support via class strategy. |
| **No Database** | State is ephemeral. | **Pro**: Privacy-first, no user tracking. **Con**: History is lost on refresh (by design). |

## 🚀 Future Scalability Considerations

1.  **Proxy Server**: To mitigate Piped API rate limits, a lightweight Node.js proxy could be introduced to rotate instances.
2.  **Vector DB**: For analyzing entire channels, transcripts could be embedded and stored in a vector database (e.g., Pinecone) for retrieval-augmented generation (RAG) across multiple videos.
