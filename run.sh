#!/bin/bash
# SVG+PHP Universal Launcher for Linux/macOS
# ==========================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default configuration
PORT=8097
PHP_MIN_VERSION="7.4"

# Banner
clear
echo "==============================================="
echo "   SVG+PHP Universal Launcher - Linux/macOS"
echo "==============================================="
echo

# Function to check PHP version
check_php_version() {
    if command -v php &> /dev/null; then
        PHP_VERSION=$(php -r "echo PHP_VERSION;")
        echo -e "${GREEN}[OK]${NC} Found PHP $PHP_VERSION"

        # Check minimum version
        if php -r "exit(version_compare(PHP_VERSION, '$PHP_MIN_VERSION') >= 0 ? 0 : 1);"; then
            return 0
        else
            echo -e "${YELLOW}[WARNING]${NC} PHP version is older than $PHP_MIN_VERSION"
            return 0
        fi
    else
        echo -e "${RED}[ERROR]${NC} PHP not found!"
        echo
        echo "Please install PHP:"

        # OS-specific installation instructions
        if [[ "$OSTYPE" == "darwin"* ]]; then
            echo "  brew install php"
        elif [[ -f /etc/debian_version ]]; then
            echo "  sudo apt update && sudo apt install php php-cli"
        elif [[ -f /etc/redhat-release ]]; then
            echo "  sudo yum install php php-cli"
        else
            echo "  Please install PHP using your package manager"
        fi

        return 1
    fi
}

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1
    else
        return 0
    fi
}

# Function to find available port
find_available_port() {
    local port=$1
    while ! check_port $port; do
        echo -e "${YELLOW}[WARNING]${NC} Port $port is already in use"
        port=$((port + 1))
    done
    echo $port
}

# Check PHP installation
if ! check_php_version; then
    exit 1
fi

# Check for router.php
if [[ ! -f "router.php" ]]; then
    echo -e "${RED}[ERROR]${NC} router.php not found!"
    echo "Please run this script from the project directory."
    exit 1
fi

# Check and create .env file
if [[ ! -f ".env" ]]; then
    echo -e "${BLUE}[INFO]${NC} Creating default .env file..."
    cat > .env << EOF
APP_TITLE=SVG+PHP Application
APP_VERSION=1.0.0
APP_AUTHOR=Developer
CALCULATOR_TITLE=PHP Calculator
APP_BASE_URL=http://localhost:$PORT
EOF
    echo -e "${GREEN}[OK]${NC} .env file created"
fi

# Find available port
PORT=$(find_available_port $PORT)

# Display available applications
echo
echo "Available applications:"
echo "----------------------"
for svg_file in *.svg; do
    if [[ -f "$svg_file" ]]; then
        case "$svg_file" in
            "calculator.svg")
                echo -e "- ${GREEN}$svg_file${NC}     (Interactive Calculator)"
                ;;
            "pdf-processor.svg")
                echo -e "- ${GREEN}$svg_file${NC} (PDF Converter)"
                ;;
            *)
                echo -e "- ${GREEN}$svg_file${NC}"
                ;;
        esac
    fi
done

# Function to open browser
open_browser() {
    local url=$1

    # Wait a bit for server to start
    sleep 2

    # OS-specific browser opening
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "$url"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "$url"
    elif command -v gnome-open &> /dev/null; then
        gnome-open "$url"
    else
        echo -e "${YELLOW}[INFO]${NC} Please open $url in your browser"
    fi
}

# Start server
echo
echo "==============================================="
echo -e "Starting PHP server on ${BLUE}http://localhost:$PORT${NC}"
echo "Press Ctrl+C to stop the server"
echo "==============================================="
echo

# Open browser in background
open_browser "http://localhost:$PORT" &

# Trap Ctrl+C to show goodbye message
trap 'echo -e "\n\n${GREEN}Server stopped. Goodbye!${NC}\n"; exit 0' INT

# Start PHP server
php -S localhost:$PORT router.php

# If we get here, server was stopped normally
echo
echo -e "${GREEN}Server stopped.${NC}"