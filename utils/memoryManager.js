const fs = require('fs-extra');
const path = require('path');

class MemoryManager {
  constructor() {
    this.memoryDir = path.join(__dirname, '../data/memory');
    this.maxMessages = parseInt(process.env.MAX_MEMORY_MESSAGES) || 50;
    this.ensureMemoryDir();
  }

  async ensureMemoryDir() {
    await fs.ensureDir(this.memoryDir);
  }

  getUserMemoryPath(userId) {
    return path.join(this.memoryDir, `${userId}.json`);
  }

  async getUserMemory(userId) {
    try {
      const memoryPath = this.getUserMemoryPath(userId);
      if (await fs.pathExists(memoryPath)) {
        const data = await fs.readJson(memoryPath);
        return {
          messages: data.messages || [],
          model: data.model || process.env.DEFAULT_MODEL || 'gpt-4',
          createdAt: data.createdAt,
          lastUpdated: data.lastUpdated
        };
      }
      return {
        messages: [],
        model: process.env.DEFAULT_MODEL || 'gpt-4',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error reading memory for user ${userId}:`, error);
      return {
        messages: [],
        model: process.env.DEFAULT_MODEL || 'gpt-4',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
    }
  }

  async addMessage(userId, role, content, attachments = []) {
    try {
      const memory = await this.getUserMemory(userId);
      
      const message = {
        role,
        content,
        timestamp: new Date().toISOString(),
        attachments
      };

      memory.messages.push(message);

      // Keep only the last N messages
      if (memory.messages.length > this.maxMessages) {
        memory.messages = memory.messages.slice(-this.maxMessages);
      }

      memory.lastUpdated = new Date().toISOString();

      await this.saveUserMemory(userId, memory);
      return memory;
    } catch (error) {
      console.error(`Error adding message for user ${userId}:`, error);
      throw error;
    }
  }

  async saveUserMemory(userId, memory) {
    try {
      const memoryPath = this.getUserMemoryPath(userId);
      await fs.writeJson(memoryPath, memory, { spaces: 2 });
    } catch (error) {
      console.error(`Error saving memory for user ${userId}:`, error);
      throw error;
    }
  }

  async resetUserMemory(userId) {
    try {
      const memoryPath = this.getUserMemoryPath(userId);
      const newMemory = {
        messages: [],
        model: process.env.DEFAULT_MODEL || 'gpt-4',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      await this.saveUserMemory(userId, newMemory);
      return newMemory;
    } catch (error) {
      console.error(`Error resetting memory for user ${userId}:`, error);
      throw error;
    }
  }

  async setUserModel(userId, model) {
    try {
      const memory = await this.getUserMemory(userId);
      memory.model = model;
      memory.lastUpdated = new Date().toISOString();
      await this.saveUserMemory(userId, memory);
      return memory;
    } catch (error) {
      console.error(`Error setting model for user ${userId}:`, error);
      throw error;
    }
  }

  async getConversationHistory(userId, includeSystem = true) {
    try {
      const memory = await this.getUserMemory(userId);
      let messages = memory.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      if (includeSystem) {
        messages.unshift({
          role: 'system',
          content: 'You are a helpful AI assistant in a Discord server. Be conversational, friendly, and helpful. You can process various file types including PDFs when users upload them.'
        });
      }

      return {
        messages,
        model: memory.model
      };
    } catch (error) {
      console.error(`Error getting conversation history for user ${userId}:`, error);
      return {
        messages: includeSystem ? [{
          role: 'system',
          content: 'You are a helpful AI assistant in a Discord server.'
        }] : [],
        model: process.env.DEFAULT_MODEL || 'gpt-4'
      };
    }
  }

  async getUserStats(userId) {
    try {
      const memory = await this.getUserMemory(userId);
      return {
        totalMessages: memory.messages.length,
        currentModel: memory.model,
        createdAt: memory.createdAt,
        lastUpdated: memory.lastUpdated,
        memoryUsage: `${memory.messages.length}/${this.maxMessages}`
      };
    } catch (error) {
      console.error(`Error getting stats for user ${userId}:`, error);
      return null;
    }
  }

  async getAllUsersStats() {
    try {
      const files = await fs.readdir(this.memoryDir);
      const userFiles = files.filter(file => file.endsWith('.json'));
      
      const stats = [];
      for (const file of userFiles) {
        const userId = file.replace('.json', '');
        const userStats = await this.getUserStats(userId);
        if (userStats) {
          stats.push({ userId, ...userStats });
        }
      }
      
      return stats;
    } catch (error) {
      console.error('Error getting all users stats:', error);
      return [];
    }
  }
}

module.exports = MemoryManager; 