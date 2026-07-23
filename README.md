# The Conversation Inbox - Yellow.ai Assignment

A purpose-built triage view designed for CX agents to handle AI-escalated customer conversations. The goal of this inbox is speed and context—agents need to instantly know *why* a ticket is in their queue and resolve it without leaving their keyboard.

## Live Demo

**[View the Live Application](https://yellow-ai.mohammedyaseenagha.in/)**
*(Hosted on Vercel)*

## Setup & Run

This project uses [Bun](https://bun.sh/) (or your preferred package manager like npm/yarn) and Vite.

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Start the development server:**
   ```bash
   bun run dev
   ```

3. **Build for production:**
   ```bash
   bun run build
   ```

## Tech Stack

- **Core:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS v4, custom CSS variables, class-variance-authority
- **Components:** Radix UI primitives (via shadcn/ui), Lucide React (icons)
- **State & Data Fetching:** TanStack React Query v5
- **Mock Backend:** MSW (Mock Service Worker) for API simulation (delay, errors)
- **Shortcuts:** `react-hotkeys-hook`

## Product Decisions

The primary focus of this build was **Agent Speed and Context**. Instead of building a generic CRUD email client, the UI prioritizes the information an agent actually needs to triage a frustrated user:

1. **Surface Critical Context:** Escalation reasons (e.g., "CSAT Drop", "Frustrated User"), Customer LTV, Priority, and AI summaries are placed at the very top of the ticket. Agents don't have to read the entire chat history to know what's wrong.
2. **Action-Oriented AI:** Added a "Suggested Reply" block with a one-click "Use" button that populates the reply box.
3. **Responsive by Default:** CX agents might have half-screen windows open. The layout gracefully downgrades from a side-by-side view to a single-pane mobile view.
4. **Keyboard-First Navigation:** Triage requires speed. Everything from navigating between tickets to sending replies and resolving them can be done without touching the mouse.

## Keyboard Shortcuts

- `Ctrl + .` : Resolve the current ticket
- `Ctrl + Down` : Move to the next ticket
- `Ctrl + Up` : Move to the previous ticket
- `Ctrl + K` or `Cmd + K` : Open search/filter modal
- `Ctrl + M` : Open the shortcuts & debug menu
- `Esc` : Close any open modals
- `Ctrl + Enter` (in text area): Send reply AND automatically move to the next ticket
- `Enter` (in text area): Send reply only

## Architecture & Tradeoffs

- **Why MSW for Mocking?** Instead of hardcoding delays or hacking `setTimeout` in the API layer, MSW intercepts requests at the network level. This allowed me to easily build a "Debug Menu" (accessible via `Ctrl + M`) to simulate 200-500ms network latency, flaky connections, and outright 500 server errors on demand.
- **Why React Query?** The app is heavily reliant on server state (tickets, messages). React Query natively handles caching, stale times, and loading/error states without the boilerplate of Redux or Context API.
- **Strict Network Verification vs. Optimistic Updates:** On resolving a ticket, the UI waits for network confirmation rather than assuming success. Given that this tool deals with angry customers, verifying the state change with the server is prioritized over an immediate optimistic update that might silently roll back if the API fails.
- **Tailwind & shadcn/ui:** Allowed for rapid iteration of a premium, accessible design system without writing hundreds of lines of custom CSS.

## Known Limitations / Out of Scope

As per the assignment brief, the following were explicitly scoped out and left unimplemented:
- Real authentication and multi-tenancy.
- WebSockets / Real-time incoming tickets (data is fetched/polled via React Query).
- A real production backend database.
