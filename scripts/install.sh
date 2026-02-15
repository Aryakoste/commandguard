#!/bin/bash
set -e

echo "🛡️  Installing CommandGuard..."

if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed. Please install Node.js first."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building project..."
npm run build

echo "🔗 Linking command..."
npm link

echo "⚙️  Setting up CommandGuard..."
commandguard setup

echo "✅ Done! CommandGuard is installed."
echo "🔄 Please restart your terminal or run 'source ~/.bashrc' (or ~/.zshrc) to enable the hook."
