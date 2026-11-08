#!/bin/bash

echo "🚀 Kalamek AI - Mobile Setup"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check Node
echo -e "${BLUE}✓ Node version:${NC}"
node --version
echo ""

# Step 2: Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install --legacy-peer-deps
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 3: Create .env if it doesn't exist
if [ ! -f .env.local ]; then
  echo -e "${BLUE}🔧 Creating .env.local...${NC}"
  cat > .env.local << 'EOF'
# Add your OpenAI API key here
OPENAI_API_KEY=

# Supabase (optional for now)
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

# App settings
EXPO_PUBLIC_API_ENVIRONMENT=development
EOF
  echo -e "${YELLOW}⚠️  Created .env.local - Add your OPENAI_API_KEY if you want to test Whisper${NC}"
  echo ""
fi

# Step 4: Show instructions
echo -e "${GREEN}===================================${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}===================================${NC}"
echo ""
echo -e "${BLUE}📱 To run on your iPhone:${NC}"
echo ""
echo "1. Run this command:"
echo -e "${YELLOW}   npm start -- --tunnel${NC}"
echo ""
echo "2. Or use Expo Tunnel:"
echo -e "${YELLOW}   npx expo start --tunnel${NC}"
echo ""
echo "3. Scan the QR Code with Expo Go"
echo ""
echo -e "${BLUE}📖 Available commands:${NC}"
echo "   npm start              - Start dev server"
echo "   npm start -- --tunnel  - Start with tunnel (for mobile)"
echo "   npm run pipeline       - Test video processing"
echo "   npm run demo           - Interactive demo"
echo "   npm run test:supabase  - Test Supabase connection"
echo ""
echo -e "${YELLOW}Note: Make sure to have Expo Go installed on your iPhone${NC}"
echo "Download: https://apps.apple.com/app/expo-go/id982107779"
echo ""
