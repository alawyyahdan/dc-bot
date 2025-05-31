import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

export const MODEL_CATEGORIES = {
  'OpenAI': {
    color: 0x00ff00,
    models: {
      'gpt4o': 'openai/gpt-4o',
      'gpt4o-mini': 'openai/gpt-4o-mini',
      'gpt41': 'openai/gpt-4.1',
      'gpt41-mini': 'openai/gpt-4.1-mini',
      'gpt41-nano': 'openai/gpt-4.1-nano',
      'o4-mini': 'openai/o4-mini',
      'o3': 'openai/o3',
      'o3-mini': 'openai/o3-mini',
      'o1': 'openai/o1',
      'o1-mini': 'openai/o1-mini',
      'o1-preview': 'openai/o1-preview'
    }
  },
  'Deepseek': {
    color: 0x0000ff,
    models: {
      'deepseek-v3': 'deepseek-ai/deepseek-v3-0324',
      'deepseek-r1': 'deepseek-ai/deepseek-r1',
      'mai-ds-r1': 'deepseek-ai/mai-ds-r1'
    }
  },
  'Mistral': {
    color: 0xff0000,
    models: {
      'mistral-7b': 'mistral-ai/mistral-7b',
      'mistral-small': 'mistral-ai/mistral-small-3.1',
      'mistral-medium': 'mistral-ai/mistral-medium-3-25.05',
      'mistral-large': 'mistral-ai/mistral-large-24.11',
      'mistral-nemo': 'mistral-ai/mistral-nemo',
      'codestral': 'mistral-ai/codestral-25.01'
    }
  },
  'Meta': {
    color: 0xffff00,
    models: {
      'llama-8b': 'meta/meta-llama-3-8b-instruct',
      'llama-70b': 'meta/meta-llama-3-70b-instruct',
      'llama-405b': 'meta/meta-llama-3-1-405b-instruct',
      'llama-vision-18b': 'meta/meta-llama-3-2.1-18b-vision-instruct',
      'llama-vision-90b': 'meta/meta-llama-3-2.9-90b-vision-instruct'
    }
  },
  'Microsoft': {
    color: 0xff00ff,
    models: {
      'phi3-mini-4k': 'microsoft/phi-3-mini-4k-instruct',
      'phi3-mini-128k': 'microsoft/phi-3-mini-128k-instruct',
      'phi3-small-8k': 'microsoft/phi-3-small-8k-instruct',
      'phi3-small-128k': 'microsoft/phi-3-small-128k-instruct',
      'phi3-medium-4k': 'microsoft/phi-3-medium-4k-instruct',
      'phi3-medium-128k': 'microsoft/phi-3-medium-128k-instruct',
      'phi35-mini': 'microsoft/phi-3.5-mini-instruct-128k',
      'phi35-moe': 'microsoft/phi-3.5-moe-instruct-128k',
      'phi35-vision': 'microsoft/phi-3.5-vision-instruct-128k',
      'phi4': 'microsoft/phi-4',
      'phi4-mini': 'microsoft/phi-4-mini-instruct',
      'phi4-multimodal': 'microsoft/phi-4-multimodal-instruct',
      'phi4-reasoning': 'microsoft/phi-4-reasoning',
      'phi4-mini-reasoning': 'microsoft/phi-4-mini-reasoning'
    }
  }
};

export const AVAILABLE_MODELS = Object.values(MODEL_CATEGORIES).reduce((acc, category) => {
  return { ...acc, ...category.models };
}, {});

export const aiClient = ModelClient(
  process.env.AI_ENDPOINT,
  new AzureKeyCredential(process.env.AI_API_KEY)
); 