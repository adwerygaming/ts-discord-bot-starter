# ts-discord-bot-starter

A Discord bot starter project built with TypeScript and `discord.js`. This repository provides a solid foundation for creating a modern, feature-rich Discord bot with a clean, organized, and scalable structure.

## Features

-   **TypeScript First**: Fully written in TypeScript for type safety and modern language features.
-   **Dynamic Command Handling**: Slash commands, buttons, and dropdowns are loaded dynamically from their respective directories.
-   **Example Components**: Includes ready-to-use examples for slash commands, buttons, and dropdown menus.
-   **Environment-based Configuration**: Uses a `.env` file for easy management of secrets and configuration.
-   **In-Memory Caching**: Implements a simple in-memory cache using `lru-cache` for temporary data storage.
-   **Modern Build System**: Uses `tsup` for efficient TypeScript compilation.

## Project Structure

The core logic of the bot is organized within the `src/` directory:

```
src/
├── database/      # In-memory caching logic using lru-cache
├── discord/       # All discord.js related logic
│   ├── buttons/   # Handlers for button interactions
│   ├── commands/  # Slash command definitions
│   ├── dropdowns/ # Handlers for select menu interactions
│   ├── Client.ts  # Discord client initialization
│   └── CommandHandler.ts # Loads and handles all interactions
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── index.ts       # Main application entry point
```

## Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites

-   [Node.js](https://nodejs.org/) >= 21.0.0 (as specified in `package.json`)
-   [npm](https://www.npmjs.com/) (or another package manager like yarn or pnpm)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/adwerygaming/ts-discord-bot-starter.git
    cd ts-discord-bot-starter
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

### Configuration

The bot requires environment variables to connect to Discord.

1.  Create a `.env` file in the root of the project:
    ```sh
    touch .env
    ```

2.  Add the following variables to the `.env` file. You can get these from the [Discord Developer Portal](https://discord.com/developers/applications).
    ```env
    # The token for your Discord bot
    DISCORD_TOKEN="YOUR_BOT_TOKEN"

    # The client ID of your Discord application
    DISCORD_CLIENT_ID="YOUR_CLIENT_ID"
    ```
    *These keys are required in `src/discord/Client.ts` and `src/discord/CommandHandler.ts`.*

### Running the Bot

-   **For development (with hot-reloading):**
    The project uses `tsx` to run TypeScript files directly and `nodemon` to watch for changes.
    ```sh
    nodemon
    ```

-   **For production:**
    First, build the project, then run the compiled JavaScript.
    ```sh
    # Build the TypeScript source into JavaScript
    npm run build

    # Start the bot from the 'dist' directory
    node dist/index.js
    ```

## Available Commands

The bot comes with the following slash commands pre-configured:

-   `/ping`: Checks the bot's responsiveness and replies with "Pong!".
    -   *Source: `src/discord/commands/Ping.ts`*
-   `/example button`: Demonstrates how message buttons work.
    -   *Source: `src/discord/commands/example/button.ts`*
-   `/example dropdown`: Demonstrates how dropdown select menus work.
    -   *Source: `src/discord/commands/example/dropdown.ts`*
