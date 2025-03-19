# Tournament Tracker Display

A simple web application for tracking and displaying tournament brackets.

![Tournament Bracket Display](https://example.com/screenshot.png)

## Quick Start for Non-Technical Users

To get started quickly:

1. **Windows Users**: Double-click the `start-app.bat` file
2. **Mac Users**: Double-click the `start-app.sh` file (or run it from Terminal)
3. Open your web browser and go to: http://localhost:5173

For more detailed instructions, check the `GETTING-STARTED.html` file included with this application.

## Features

- Interactive tournament bracket display
- Track progress of teams through tournament rounds
- Intuitive interface for selecting match winners
- Visual display of semifinals and finals matches
- Tournament champion display

## For Developers

### Prerequisites

- Node.js (LTS version recommended)
- npm (included with Node.js)

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure

- `src/components` - UI components including tournament bracket
- `src/contexts` - State management for tournament data
- `src/types` - TypeScript type definitions
- `src/utils` - Utility functions for tournament operations

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- Vite
