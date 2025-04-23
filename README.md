# Pomodoro Spotify Angular App

This is a Pomodoro timer application built with Angular that integrates with Spotify to play/pause music during work/break sessions.

## Features

- Customizable Pomodoro timer (work/break durations).
- Spotify integration using the Web Playback SDK.
- Authentication via Spotify OAuth 2.0 (PKCE flow).
- Automatic playback control (play during work, pause during break).
- Basic UI using Angular Material.

## Prerequisites

- Node.js and npm (Check Angular compatibility, e.g., v18, v20, v22+)
- Angular CLI (`npm install -g @angular/cli`)
- A Spotify Premium account (required for the Web Playback SDK).

## Setup

1.  **Clone the repository (if applicable) or ensure you are in the project directory.**

2.  **Install Dependencies:**

    ```bash
    npm install
    ```

3.  **Create a Spotify Application:**

    - Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/).
    - Log in with your Spotify account.
    - Click "Create App".
    - Give your app a name (e.g., "Angular Pomodoro") and description.
    - Agree to the terms.
    - Once created, you will see your **Client ID**. Copy this value.
    - Click "Edit Settings".
    - In the "Redirect URIs" section, add the following URI:
      ```
      http://localhost:4200/auth-callback
      ```
    - Click "Add", then scroll down and click "Save".

4.  **Configure Spotify Client ID:**
    - Open the file `src/app/services/spotify.service.ts`.
    - Find the line:
      ```typescript
      private clientId = 'YOUR_SPOTIFY_CLIENT_ID';
      ```
    - Replace `'YOUR_SPOTIFY_CLIENT_ID'` with the actual Client ID you copied from the Spotify Developer Dashboard.

## Running the Application

1.  **Start the development server:**

    ```bash
    ng serve -o
    ```

    or use the npm script:

    ```bash
    npm start
    ```

    This will build the application and open it in your default browser at `http://localhost:4200/`.

2.  **Usage:**
    - Click "Login with Spotify" to authenticate.
    - Use the timer controls (play, pause, reset).
    - Go to "Settings" (gear icon) to adjust work and break durations.
    - Music should automatically play during work sessions and pause during breaks if you are logged into Spotify.

## Development

- **Build:** `ng build` (for production build)
- **Test:** `ng test` (to run unit tests)
