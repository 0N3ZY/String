# String

A free messaging and community app.

## Run locally

Requirements: Node.js 20.9 or later.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Current prototype

The first interface prototype is built with Next.js, React, TypeScript and CSS. It includes:

- Community/server navigation
- Workspace and channel navigation
- Switchable and closable chat tabs
- Search through the sample messages
- A working local message composer (Enter to send, Shift + Enter for a new line)
- Emoji picker and attachment menu demonstrations
- Responsive layout with a mobile navigation drawer

Messages and interactions currently use local sample data in the browser. Authentication, persistent storage, realtime messaging, file uploads and voice/video are not connected yet.

## Development

The UI foundation is currently on the `feat/string-ui-foundation` branch.
