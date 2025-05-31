const MemoryManager = require('../utils/memoryManager');
const AIModels = require('../utils/aiModels');
const FileProcessor = require('../utils/fileProcessor');

const memoryManager = new MemoryManager();
const aiModels = new AIModels();
const fileProcessor = new FileProcessor();

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    // Ignore bot messages and system messages
    if (message.author.bot) return;

    // Only respond to DMs or mentions
    const isMentioned = message.mentions.has(message.client.user);
    const isDM = message.channel.type === 1; // DM channel type

    if (!isMentioned && !isDM) return;

    try {
      // Show typing indicator
      await message.channel.sendTyping();

      const userId = message.author.id;
      let userMessage = message.content;

      // Remove bot mention from message
      if (isMentioned) {
        userMessage = userMessage.replace(/<@!?\d+>/g, '').trim();
      }

      // Handle commands
      if (userMessage.startsWith('!')) {
        return await handleCommand(message, userMessage, userId);
      }

      // Process attachments if any
      const attachments = [];
      if (message.attachments.size > 0) {
        for (const attachment of message.attachments.values()) {
          try {
            if (fileProcessor.isSupported(attachment.contentType)) {
              const processed = await fileProcessor.processFile(attachment);
              attachments.push(processed);
              
              // Add file content to user message for PDF/text files
              if (processed.type === 'pdf' || processed.type === 'txt') {
                userMessage += `\n\n${fileProcessor.formatFileContent(processed)}`;
              }
            }
          } catch (error) {
            await message.reply(`❌ Error processing file ${attachment.name}: ${error.message}`);
          }
        }
      }

      // If no message content and no attachments, return
      if (!userMessage.trim() && attachments.length === 0) {
        await message.reply('👋 Hi! Send me a message or upload a file and I\'ll help you analyze it!');
        return;
      }

      // Add user message to memory
      await memoryManager.addMessage(userId, 'user', userMessage, attachments);

      // Get conversation history
      const { messages, model } = await memoryManager.getConversationHistory(userId);

      // Handle image attachments for vision models
      if (attachments.some(att => att.type === 'image')) {
        const imageAttachments = attachments.filter(att => att.type === 'image');
        
        // For vision models, modify the message format
        if (aiModels.isMultimodal(model)) {
          const lastMessage = messages[messages.length - 1];
          lastMessage.content = [
            { type: 'text', text: userMessage },
            ...imageAttachments.map(img => ({
              type: 'image_url',
              image_url: { url: img.content.url }
            }))
          ];
        }
      }

      // Generate AI response
      const response = await aiModels.generateResponse(model, messages);

      // Add AI response to memory
      await memoryManager.addMessage(userId, 'assistant', response.content);

      // Split long messages
      const chunks = splitMessage(response.content);
      
      for (const chunk of chunks) {
        await message.reply(chunk);
      }

    } catch (error) {
      console.error('Error in messageCreate:', error);
      await message.reply(`❌ Sorry, I encountered an error: ${error.message}`);
    }
  }
};

async function handleCommand(message, command, userId) {
  const args = command.slice(1).split(' ');
  const cmd = args[0].toLowerCase();

  switch (cmd) {
    case 'models':
      if (args[1]) {
        // Show models for specific provider
        const provider = args[1].toLowerCase();
        const providerModels = aiModels.getModelsByProvider(provider);
        
        if (providerModels.length === 0) {
          const availableProviders = aiModels.getProviders().join(', ');
          await message.reply(`❌ Provider \`${provider}\` not found.\n**Available providers:** ${availableProviders}\n\nUse \`!models <provider>\` to see models for a specific provider.`);
          return;
        }
        
        const modelList = providerModels.map(m => 
          `**${m.name}** (\`${m.id}\`) ${m.multimodal ? '🎨' : '📝'}`
        ).join('\n');
        
        await message.reply(`🤖 **${provider.toUpperCase()} Models:**\n${modelList}\n\n🎨 = Multimodal (supports images)\n📝 = Text only`);
      } else {
        // Show all models grouped by provider
        const providers = aiModels.getProviders();
        let response = '🤖 **Available AI Models by Provider:**\n\n';
        
        for (const provider of providers) {
          const providerModels = aiModels.getModelsByProvider(provider);
          response += `**${provider.toUpperCase()}** (${providerModels.length} models)\n`;
          
          // Show first 3 models of each provider
          const displayModels = providerModels.slice(0, 3);
          for (const model of displayModels) {
            response += `  • ${model.name} (\`${model.id}\`) ${model.multimodal ? '🎨' : '📝'}\n`;
          }
          
          if (providerModels.length > 3) {
            response += `  • ... and ${providerModels.length - 3} more\n`;
          }
          response += '\n';
        }
        
        response += '🎨 = Multimodal | 📝 = Text only\n';
        response += '**Usage:**\n';
        response += '• `!models <provider>` - Show all models for a provider\n';
        response += '• `!model <id>` - Switch to a specific model\n';
        response += '• `!providers` - List all available providers';
        
        await message.reply(response);
      }
      break;

    case 'providers':
      const providers = aiModels.getProviders();
      const providerList = providers.map(provider => {
        const modelCount = aiModels.getModelsByProvider(provider).length;
        return `**${provider.toUpperCase()}** - ${modelCount} models`;
      }).join('\n');
      
      await message.reply(`🏢 **Available AI Providers:**\n${providerList}\n\nUse \`!models <provider>\` to see models for a specific provider.`);
      break;

    case 'model':
      if (!args[1]) {
        const currentModel = (await memoryManager.getUserMemory(userId)).model;
        const modelConfig = aiModels.models[currentModel];
        await message.reply(
          `🤖 **Current Model:** ${modelConfig?.name || currentModel} (\`${currentModel}\`)\n` +
          `🏢 **Provider:** ${modelConfig?.provider || 'unknown'}\n` +
          `${modelConfig?.multimodal ? '🎨' : '📝'} **Type:** ${modelConfig?.multimodal ? 'Multimodal' : 'Text only'}\n` +
          `📊 **Max Tokens:** ${modelConfig?.maxTokens || 'N/A'}\n\n` +
          `Use \`!models\` to see available models.`
        );
        return;
      }

      const modelId = args[1];
      const availableModels = aiModels.getAvailableModels();
      const selectedModel = availableModels.find(m => m.id === modelId);

      if (!selectedModel) {
        await message.reply(`❌ Model \`${modelId}\` not found. Use \`!models\` to see available models.`);
        return;
      }

      await memoryManager.setUserModel(userId, modelId);
      await message.reply(
        `✅ **Switched to ${selectedModel.name}!**\n` +
        `🏢 **Provider:** ${selectedModel.provider}\n` +
        `${selectedModel.multimodal ? '🎨' : '📝'} **Type:** ${selectedModel.multimodal ? 'Multimodal' : 'Text only'}`
      );
      break;

    case 'reset':
      await memoryManager.resetUserMemory(userId);
      await message.reply('🔄 Your conversation memory has been reset!');
      break;

    case 'stats':
      const stats = await memoryManager.getUserStats(userId);
      if (stats) {
        const modelConfig = aiModels.models[stats.currentModel];
        await message.reply(
          `📊 **Your Stats:**\n` +
          `💬 **Messages:** ${stats.totalMessages}\n` +
          `🤖 **Current Model:** ${modelConfig?.name || stats.currentModel} (${stats.currentModel})\n` +
          `🏢 **Provider:** ${modelConfig?.provider || 'unknown'}\n` +
          `💾 **Memory Usage:** ${stats.memoryUsage}\n` +
          `📅 **Last Updated:** ${new Date(stats.lastUpdated).toLocaleString()}`
        );
      }
      break;

    case 'help':
      await message.reply(
        `🤖 **Bot Commands:**\n` +
        `\`!help\` - Show this help message\n` +
        `\`!models\` - List all available AI models\n` +
        `\`!models <provider>\` - Show models for specific provider\n` +
        `\`!providers\` - List all AI providers\n` +
        `\`!model\` - Show current model info\n` +
        `\`!model <id>\` - Switch to a specific model\n` +
        `\`!reset\` - Reset conversation memory\n` +
        `\`!stats\` - Show your usage statistics\n\n` +
        `📎 **File Support:**\n` +
        `• PDF files (text extraction & analysis)\n` +
        `• Text files (.txt)\n` +
        `• Images (.jpg, .png, .gif, .webp) for vision models\n\n` +
        `💬 **Usage:**\n` +
        `• Mention me in a channel: @${message.client.user.username} hello\n` +
        `• DM me directly\n` +
        `• Upload files with your message\n` +
        `• Your conversation history is automatically saved\n\n` +
        `🌟 **Available Providers:** OpenAI, DeepSeek, Mistral, Meta, Microsoft, xAI, AI21, and more!`
      );
      break;

    default:
      await message.reply(`❌ Unknown command \`${cmd}\`. Use \`!help\` for available commands.`);
  }
}

function splitMessage(text, maxLength = 2000) {
  if (text.length <= maxLength) return [text];
  
  const chunks = [];
  let currentChunk = '';
  
  const lines = text.split('\n');
  for (const line of lines) {
    if (currentChunk.length + line.length + 1 > maxLength) {
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = '';
      }
      
      if (line.length > maxLength) {
        // Split very long lines
        for (let i = 0; i < line.length; i += maxLength) {
          chunks.push(line.slice(i, i + maxLength));
        }
      } else {
        currentChunk = line;
      }
    } else {
      currentChunk += (currentChunk ? '\n' : '') + line;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
} 