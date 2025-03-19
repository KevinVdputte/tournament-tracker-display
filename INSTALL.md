# Installation Guide for Non-Technical Users

This guide will help you start the Tournament Tracker Display application on your local computer.

## Step 1: Install Node.js

Node.js is required to run this application. Here's how to install it:

1. Go to [https://nodejs.org/](https://nodejs.org/)
2. Download the "LTS" version (recommended for most users)
3. Run the installer and follow the on-screen instructions
   - Click "Next" on each screen
   - Accept the default installation settings
   - Click "Install" when prompted

## Step 2: Download and Extract the Application

1. If you received this application as a ZIP file:
   - Right-click the ZIP file and select "Extract All"
   - Choose a location where you want to extract the files
   - Click "Extract"

2. If you're downloading from GitHub:
   - Click the green "Code" button
   - Select "Download ZIP"
   - Extract the ZIP as described above

## Step 3: Open Terminal/Command Prompt

### On Windows:
1. Press the Windows key on your keyboard
2. Type "cmd" or "Command Prompt"
3. Click on the Command Prompt application

### On Mac:
1. Press Cmd + Space to open Spotlight
2. Type "Terminal"
3. Click on the Terminal application

## Step 4: Navigate to the Application Folder

1. In the terminal/command prompt, type `cd` followed by the path to where you extracted the application
   
   For example:
   ```
   cd C:\Users\YourName\Downloads\tournament-tracker-display
   ```
   
   or on Mac:
   ```
   cd /Users/YourName/Downloads/tournament-tracker-display
   ```

2. Press Enter

## Step 5: Install Dependencies

1. In the terminal/command prompt, type:
   ```
   npm install
   ```

2. Press Enter and wait for the installation to complete
   - This might take a few minutes
   - You'll see text scrolling in the terminal as files are downloaded

## Step 6: Start the Application

1. In the terminal/command prompt, type:
   ```
   npm run dev
   ```

2. Press Enter
   - The application will start
   - You'll see a message with a URL (usually http://localhost:5173)

## Step 7: View the Application

1. Open your web browser (Chrome, Firefox, Edge, etc.)
2. Type `http://localhost:5173` in the address bar
3. Press Enter

You should now see the Tournament Tracker Display application running in your browser!

## Troubleshooting

If you encounter any problems:

1. Make sure you have installed Node.js correctly
2. Ensure you're in the correct folder when running the commands
3. Try closing the terminal/command prompt and starting again
4. If you see error messages, try searching for them online or contact support

## Stopping the Application

When you're done using the application:

1. Go back to the terminal/command prompt window
2. Press Ctrl+C on your keyboard
3. Type "y" if prompted and press Enter 