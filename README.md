# Discord AI Bot 🤖

A powerful Discord bot with multi-model AI support, multimodal capabilities, and memory management. Supports 60+ AI models from various providers including OpenAI, DeepSeek, Mistral, Meta, Microsoft, xAI, AI21 Labs, Anthropic, Google, and custom endpoints.

## ✨ Features

- 🤖 **60+ AI Models** - Extensive collection from multiple providers
- 🏢 **Multiple Providers** - OpenAI, DeepSeek, Mistral, Meta, Microsoft, xAI, AI21, and more
- 🎨 **Multimodal Capabilities** - Process images, PDFs, and text files
- 🧠 **Memory Management** - Maintains conversation context per user
- 📄 **PDF Processing** - Extract and analyze PDF content
- 🖼️ **Image Analysis** - Vision model support for image understanding
- 📁 **File Upload Support** - Process various file types
- 🔄 **Memory Reset** - Users can reset their conversation history
- 📊 **Usage Statistics** - Track user interactions and model usage
- ☁️ **Vercel Ready** - Optimized for 24/7 deployment on Vercel

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd dc-bot
npm install
```

### 2. Environment Setup

Create a `.env` file based on `env.example`:

```env
# Discord Bot Configuration
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_discord_client_id_here

# AI Provider API Keys (add only the ones you want to use)
OPENAI_API_KEY=your_openai_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
MISTRAL_API_KEY=your_mistral_api_key_here
# ... and more in env.example

# Bot Configuration
DEFAULT_MODEL=gpt-4o
MAX_MEMORY_MESSAGES=50
MAX_FILE_SIZE_MB=10
```

### 3. Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Copy the token to your `.env` file
5. Enable "Message Content Intent" in Bot settings
6. Generate invite link with these permissions:
   - Send Messages
   - Read Message History
   - Use Slash Commands
   - Attach Files

### 4. Run Locally

```bash
# Development
npm run dev

# Production
npm start
```

## 🌐 Deployment on Vercel

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

### 2. Deploy

```bash
# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 3. Set Environment Variables

In Vercel dashboard, go to your project settings and add all environment variables from your `.env` file.

### 4. Keep Bot Running 24/7

The bot includes an Express server with health endpoints to keep it running on Vercel:
- Health check: `https://your-bot.vercel.app/health`
- Status: `https://your-bot.vercel.app/`

## 🎯 Usage

### Bot Commands

- `!help` - Show help message and usage guide
- `!models` - List all available AI models by provider
- `!models <provider>` - Show models for a specific provider
- `!providers` - List all available providers
- `!model` - Show current model information
- `!model <id>` - Switch to a specific model
- `!reset` - Reset conversation memory
- `!stats` - Show usage statistics

### Interaction Methods

1. **Direct Message** - DM the bot directly
2. **Mention** - Mention the bot in any channel: `@YourBot hello`
3. **File Upload** - Upload files (PDF, images, text) for analysis

### Supported File Types

- **PDF Files** (.pdf) - Text extraction and analysis
- **Text Files** (.txt) - Content reading and processing
- **Images** (.jpg, .png, .gif, .webp) - Vision model analysis

## 🔧 Configuration

### AI Models by Provider

#### 🔥 **OpenAI** (13 models)
- GPT-4o, GPT-4o Mini, GPT-4.1 series
- o1, o1-mini, o1-preview (reasoning models)
- o3, o3-mini, o4-mini (latest models)
- GPT-4 Vision, GPT-3.5 Turbo

#### 🧠 **DeepSeek** (3 models)
- DeepSeek V3, DeepSeek R1
- MAI DeepSeek R1

#### 🌟 **Mistral** (6 models)
- Mistral Large 24.11, Medium, Small 3.1
- Mistral Nemo, 7B, Codestral 25.01

#### 🦙 **Meta Llama** (5 models)
- Llama 3 series (8B, 70B, 405B)
- Llama 3.2 Vision models (18B, 90B)

#### 🔬 **Microsoft Phi** (13 models)
- Phi-3 series (Mini, Small, Medium variants)
- Phi-3.5 series with Vision support
- Phi-4 series including Reasoning models

#### 🦙 **Llama 4** (2 models)
- Llama 4 Scout 17B, Maverick 17B

#### 🚀 **xAI Grok** (2 models)
- Grok-3, Grok-3 Mini

#### 🌍 **Core42** (1 model)
- JAIS 30B Chat (Arabic-focused)

#### 🧮 **AI21 Labs** (2 models)
- Jamba 1.5 Mini, Jamba 1.5 Large

#### 🎭 **Anthropic** (1 model)
- Claude 3 Sonnet

#### 🌈 **Google** (1 model)
- Gemini Pro

### Memory Management

- Conversation history is stored per user
- Configurable message limit (default: 50 messages)
- Automatic cleanup of old files
- JSON-based storage in `/data/memory/`

### File Processing

- Maximum file size: 10MB (configurable)
- Automatic cleanup after 1 hour
- Secure file handling with validation
- Support for multimodal AI analysis

## 🏗️ Project Structure

```
dc-bot/
├── index.js              # Main entry point
├── package.json          # Dependencies
├── vercel.json           # Vercel configuration
├── env.example           # Environment variables template
├── events/               # Discord event handlers
│   ├── ready.js         # Bot ready event
│   └── messageCreate.js # Message handling
├── utils/               # Utility modules
│   ├── aiModels.js      # AI model management (60+ models)
│   ├── memoryManager.js # Memory/conversation management
│   └── fileProcessor.js # File processing utilities
└── data/               # Data storage
    └── memory/         # User conversation memory
```

## 🔒 Security Features

- Environment variable protection
- File size validation
- Content type checking
- Automatic file cleanup
- Error handling and logging
- Provider-specific endpoint configuration

## 📊 Monitoring

The bot includes built-in monitoring:
- Health check endpoints
- Error logging
- Usage statistics per user and model
- File cleanup scheduling
- Memory usage tracking
- Provider status monitoring

## 🛠️ Development

### Adding New AI Models

1. Update the `models` object in `utils/aiModels.js`
2. Add provider-specific endpoint configuration
3. Add API key environment variables to `env.example`
4. Test the integration

### Extending File Support

1. Add new MIME types to `supportedTypes` in `utils/fileProcessor.js`
2. Implement processing method for the new type
3. Update the formatting function

## ⚠️ Important Notes

- **API Keys**: You only need API keys for the providers you want to use
- **Costs**: Monitor your API usage to avoid unexpected costs
- **Permissions**: Bot requires "Message Content Intent" in Discord settings
- **File Limits**: Processing is limited by configured size limits
- **Memory**: Stored locally - consider database for production scale
- **Endpoints**: Some providers may require custom endpoint configuration

## 🎯 Popular Model Recommendations

### **For General Use:**
- `gpt-4o` - Latest OpenAI model with vision
- `claude-3` - Excellent reasoning capabilities
- `deepseek-r1` - Strong performance at lower cost

### **For Vision Tasks:**
- `gpt-4-vision` - Image analysis and understanding
- `llama-3-2.1-18b-vision-instruct` - Open source vision
- `phi-4-multimodal-instruct` - Efficient multimodal

### **For Coding:**
- `codestral-25.01` - Specialized for code generation
- `deepseek-v3-0324` - Strong coding capabilities
- `o1` - Advanced reasoning for complex problems

### **For Reasoning:**
- `o1` - OpenAI's reasoning model
- `phi-4-reasoning` - Microsoft's reasoning model
- `grok-3` - xAI's advanced model

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

If you encounter issues:
1. Check the console logs for errors
2. Verify environment variables for your chosen providers
3. Ensure Discord bot permissions are correct
4. Check API key validity and quotas
5. Verify endpoint configurations for custom providers

---

Made with ❤️ for the Discord community

**Total Models Supported: 60+ across 11 providers** 🚀 