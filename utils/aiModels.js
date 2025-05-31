const axios = require('axios');
const OpenAI = require('openai');
const ModelClient = require('@azure-rest/ai-inference').default;
const { isUnexpected } = require('@azure-rest/ai-inference');
const { AzureKeyCredential } = require('@azure/core-auth');

class AIModels {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.endpoint = process.env.AI_ENDPOINT;
    this.token = process.env.AI_API_KEY;

    if (!this.endpoint || !this.token) {
      throw new Error('AI_ENDPOINT and AI_API_KEY must be configured in environment variables');
    }

    this.client = ModelClient(
      process.env.AI_ENDPOINT,
      new AzureKeyCredential(process.env.AI_API_KEY)
    );

    this.models = {
      // OpenAI Models
      'gpt-4': {
        provider: 'openai',
        name: 'GPT-4',
        multimodal: true,
        maxTokens: 8192
      },
      'gpt-4o': {
        provider: 'openai',
        name: 'GPT-4o',
        multimodal: true,
        maxTokens: 128000
      },
      'gpt-4o-mini': {
        provider: 'openai',
        name: 'GPT-4o Mini',
        multimodal: true,
        maxTokens: 128000
      },
      'gpt-4.1': {
        provider: 'openai',
        name: 'GPT-4.1',
        multimodal: true,
        maxTokens: 128000
      },
      'gpt-4.1-mini': {
        provider: 'openai',
        name: 'GPT-4.1 Mini',
        multimodal: true,
        maxTokens: 128000
      },
      'gpt-4.1-nano': {
        provider: 'openai',
        name: 'GPT-4.1 Nano',
        multimodal: false,
        maxTokens: 64000
      },
      'gpt-4-vision': {
        provider: 'openai', 
        name: 'GPT-4 Vision',
        multimodal: true,
        maxTokens: 4096
      },
      'gpt-3.5-turbo': {
        provider: 'openai',
        name: 'GPT-3.5 Turbo',
        multimodal: false,
        maxTokens: 4096
      },
      'o4-mini': {
        provider: 'openai',
        name: 'o4 Mini',
        multimodal: true,
        maxTokens: 128000
      },
      'o3': {
        provider: 'openai',
        name: 'o3',
        multimodal: true,
        maxTokens: 200000
      },
      'o3-mini': {
        provider: 'openai',
        name: 'o3 Mini',
        multimodal: true,
        maxTokens: 128000
      },
      'o1': {
        provider: 'openai',
        name: 'o1',
        multimodal: false,
        maxTokens: 100000
      },
      'o1-mini': {
        provider: 'openai',
        name: 'o1 Mini',
        multimodal: false,
        maxTokens: 65536
      },
      'o1-preview': {
        provider: 'openai',
        name: 'o1 Preview',
        multimodal: false,
        maxTokens: 32768
      },

      // DeepSeek Models
      'deepseek-v3-0324': {
        provider: 'deepseek',
        name: 'DeepSeek V3',
        multimodal: true,
        maxTokens: 64000
      },
      'deepseek-r1': {
        provider: 'deepseek',
        name: 'DeepSeek R1',
        multimodal: true,
        maxTokens: 64000
      },
      'mai-ds-r1': {
        provider: 'deepseek',
        name: 'MAI DeepSeek R1',
        multimodal: true,
        maxTokens: 64000
      },

      // Mistral Models
      'mistral-7b': {
        provider: 'mistral',
        name: 'Mistral 7B',
        multimodal: false,
        maxTokens: 32768
      },
      'mistral-small-3.1': {
        provider: 'mistral',
        name: 'Mistral Small 3.1',
        multimodal: false,
        maxTokens: 128000
      },
      'mistral-medium-3-25.05': {
        provider: 'mistral',
        name: 'Mistral Medium 3',
        multimodal: false,
        maxTokens: 128000
      },
      'mistral-large-24.11': {
        provider: 'mistral',
        name: 'Mistral Large 24.11',
        multimodal: true,
        maxTokens: 128000
      },
      'mistral-nemo': {
        provider: 'mistral',
        name: 'Mistral Nemo',
        multimodal: false,
        maxTokens: 128000
      },
      'codestral-25.01': {
        provider: 'mistral',
        name: 'Codestral 25.01',
        multimodal: false,
        maxTokens: 32768
      },

      // Meta Llama Models
      'llama-3-8b-instruct': {
        provider: 'meta',
        name: 'Llama 3 8B Instruct',
        multimodal: false,
        maxTokens: 8192
      },
      'llama-3-70b-instruct': {
        provider: 'meta',
        name: 'Llama 3 70B Instruct',
        multimodal: false,
        maxTokens: 8192
      },
      'llama-3-1-405b-instruct': {
        provider: 'meta',
        name: 'Llama 3.1 405B Instruct',
        multimodal: false,
        maxTokens: 131072
      },
      'llama-3-2.1-18b-vision-instruct': {
        provider: 'meta',
        name: 'Llama 3.2.1 18B Vision',
        multimodal: true,
        maxTokens: 131072
      },
      'llama-3-2.9-90b-vision-instruct': {
        provider: 'meta',
        name: 'Llama 3.2.9 90B Vision',
        multimodal: true,
        maxTokens: 131072
      },

      // Microsoft Phi Models
      'phi-3-mini-4k-instruct': {
        provider: 'microsoft',
        name: 'Phi-3 Mini 4K',
        multimodal: false,
        maxTokens: 4096
      },
      'phi-3-mini-128k-instruct': {
        provider: 'microsoft',
        name: 'Phi-3 Mini 128K',
        multimodal: false,
        maxTokens: 128000
      },
      'phi-3-small-8k-instruct': {
        provider: 'microsoft',
        name: 'Phi-3 Small 8K',
        multimodal: false,
        maxTokens: 8192
      },
      'phi-3-small-128k-instruct': {
        provider: 'microsoft',
        name: 'Phi-3 Small 128K',
        multimodal: false,
        maxTokens: 128000
      },
      'phi-3-medium-4k-instruct': {
        provider: 'microsoft',
        name: 'Phi-3 Medium 4K',
        multimodal: false,
        maxTokens: 4096
      },
      'phi-3-medium-128k-instruct': {
        provider: 'microsoft',
        name: 'Phi-3 Medium 128K',
        multimodal: false,
        maxTokens: 128000
      },
      'phi-3.5-mini-instruct-128k': {
        provider: 'microsoft',
        name: 'Phi-3.5 Mini 128K',
        multimodal: false,
        maxTokens: 128000
      },
      'phi-3.5-moe-instruct-128k': {
        provider: 'microsoft',
        name: 'Phi-3.5 MoE 128K',
        multimodal: false,
        maxTokens: 128000
      },
      'phi-3.5-vision-instruct-128k': {
        provider: 'microsoft',
        name: 'Phi-3.5 Vision 128K',
        multimodal: true,
        maxTokens: 128000
      },
      'phi-4': {
        provider: 'microsoft',
        name: 'Phi-4',
        multimodal: false,
        maxTokens: 16384
      },
      'phi-4-mini-instruct': {
        provider: 'microsoft',
        name: 'Phi-4 Mini',
        multimodal: false,
        maxTokens: 16384
      },
      'phi-4-multimodal-instruct': {
        provider: 'microsoft',
        name: 'Phi-4 Multimodal',
        multimodal: true,
        maxTokens: 16384
      },
      'phi-4-reasoning': {
        provider: 'microsoft',
        name: 'Phi-4 Reasoning',
        multimodal: false,
        maxTokens: 16384
      },
      'phi-4-mini-reasoning': {
        provider: 'microsoft',
        name: 'Phi-4 Mini Reasoning',
        multimodal: false,
        maxTokens: 16384
      },

      // Llama 4 Models
      'llama-4-scout-17b-16e-instruct': {
        provider: 'llama',
        name: 'Llama 4 Scout 17B',
        multimodal: false,
        maxTokens: 131072
      },
      'llama-4-maverick-17b-128e-instruct-fp8': {
        provider: 'llama',
        name: 'Llama 4 Maverick 17B',
        multimodal: false,
        maxTokens: 131072
      },

      // xAI Grok Models
      'grok-3': {
        provider: 'xai',
        name: 'Grok-3',
        multimodal: true,
        maxTokens: 131072
      },
      'grok-3-mini': {
        provider: 'xai',
        name: 'Grok-3 Mini',
        multimodal: true,
        maxTokens: 131072
      },

      // Core42 Models
      'jais-30b-chat': {
        provider: 'core42',
        name: 'JAIS 30B Chat',
        multimodal: false,
        maxTokens: 32768
      },

      // AI21 Labs Models
      'jamba-1.5-mini': {
        provider: 'ai21',
        name: 'Jamba 1.5 Mini',
        multimodal: false,
        maxTokens: 256000
      },
      'jamba-1.5-large': {
        provider: 'ai21',
        name: 'Jamba 1.5 Large',
        multimodal: false,
        maxTokens: 256000
      },

      // Anthropic Models
      'claude-3': {
        provider: 'anthropic',
        name: 'Claude 3',
        multimodal: true,
        maxTokens: 8192
      },

      // Google Models
      'gemini-pro': {
        provider: 'google',
        name: 'Gemini Pro',
        multimodal: true,
        maxTokens: 8192
      },

      // Custom Model
      'custom': {
        provider: 'custom',
        name: 'Custom Model',
        multimodal: true,
        maxTokens: 8192
      }
    };
  }

  getAvailableModels() {
    return Object.entries(this.models).map(([key, model]) => ({
      id: key,
      name: model.name,
      multimodal: model.multimodal,
      provider: model.provider
    }));
  }

  async generateResponse(model, messages, options = {}) {
    try {
      const modelConfig = this.models[model];
      if (!modelConfig) {
        throw new Error(`Model ${model} not found`);
      }

      const response = await this.client.path("/chat/completions").post({
        body: {
          messages: messages,
          model: model,
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || modelConfig.maxTokens,
          provider: modelConfig.provider
        }
      });

      if (isUnexpected(response)) {
        throw response.body.error;
      }

      return {
        content: response.body.choices[0].message.content,
        usage: response.body.usage,
        model: model
      };

    } catch (error) {
      console.error(`Error calling ${model}:`, error);
      throw error;
    }
  }

  async callOpenAI(model, messages, options) {
    const response = await this.openai.chat.completions.create({
      model: this.getOpenAIModelName(model),
      messages: messages,
      max_tokens: options.maxTokens || this.models[model].maxTokens,
      temperature: options.temperature || 0.7,
    });

    return {
      content: response.choices[0].message.content,
      usage: response.usage,
      model: model
    };
  }

  getOpenAIModelName(model) {
    // Map custom model names to actual OpenAI API names
    const mapping = {
      'gpt-4-vision': 'gpt-4-vision-preview',
      'gpt-4o': 'gpt-4o',
      'gpt-4o-mini': 'gpt-4o-mini',
      'o1': 'o1',
      'o1-mini': 'o1-mini',
      'o1-preview': 'o1-preview'
    };
    return mapping[model] || model;
  }

  async callAnthropic(model, messages, options) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key not configured');
    }

    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: 'claude-3-sonnet-20240229',
      max_tokens: options.maxTokens || 4096,
      messages: messages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }))
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`,
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      }
    });

    return {
      content: response.data.content[0].text,
      usage: response.data.usage,
      model: model
    };
  }

  async callGoogle(model, messages, options) {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('Google API key not configured');
    }

    const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
      contents: messages.map(msg => ({
        parts: [{ text: msg.content }],
        role: msg.role === 'assistant' ? 'model' : 'user'
      })),
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 8192
      }
    });

    return {
      content: response.data.candidates[0].content.parts[0].text,
      usage: response.data.usageMetadata,
      model: model
    };
  }

  async callCustom(model, messages, options) {
    const modelConfig = this.models[model];

    // Single endpoint and API key for all models
    const endpoint = process.env.AI_ENDPOINT;
    const apiKey = process.env.AI_API_KEY;

    if (!endpoint) {
      throw new Error('AI endpoint not configured. Please set AI_ENDPOINT in environment variables.');
    }

    if (!apiKey) {
      throw new Error('API key not configured. Please set AI_API_KEY in environment variables.');
    }

    const response = await axios.post(endpoint, {
      model: model,
      messages: messages,
      max_tokens: options.maxTokens || modelConfig.maxTokens,
      temperature: options.temperature || 0.7,
      provider: modelConfig.provider // Optional: send provider info to endpoint
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      content: response.data.choices?.[0]?.message?.content || response.data.content || response.data.response,
      usage: response.data.usage,
      model: model
    };
  }

  isMultimodal(model) {
    return this.models[model]?.multimodal || false;
  }

  getModelsByProvider(provider) {
    return Object.entries(this.models)
      .filter(([key, model]) => model.provider === provider)
      .map(([key, model]) => ({
        id: key,
        name: model.name,
        multimodal: model.multimodal
      }));
  }

  getProviders() {
    const providers = new Set();
    Object.values(this.models).forEach(model => providers.add(model.provider));
    return Array.from(providers);
  }
}

module.exports = AIModels; 