#!/bin/bash

echo "===== Tournament Tracker Display ====="
echo "Starting application... Please wait."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed."
    echo "Please install Node.js from https://nodejs.org/"
    echo
    echo "After installing Node.js, run this script again."
    read -p "Press Enter to exit."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies... This may take a few minutes."
    npm install
    if [ $? -ne 0 ]; then
        echo "Error installing dependencies."
        read -p "Press Enter to exit."
        exit 1
    fi
fi

# Start the application
echo "Starting the application..."
echo
echo "Once the server is running, open your web browser and go to:"
echo "http://localhost:5173"
echo
echo "To stop the application, press Ctrl+C in this window."
echo

npm run dev

read -p "Press Enter to exit." 