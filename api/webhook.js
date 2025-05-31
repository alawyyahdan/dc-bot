import { verifyKey } from 'discord-interactions';
import { InteractionType, InteractionResponseType } from 'discord-interactions';
import { AVAILABLE_MODELS, MODEL_CATEGORIES, aiClient } from '../lib/ai.js';
import { getUserPreferences, saveUserPreferences, getUserHistory, saveUserHistory } from '../lib/storage.js';

export const config = {
  runtime: 'edge',
};

function createModelListEmbeds() {
  return Object.entries(MODEL_CATEGORIES).map(([category, data]) => ({
    title: `${category} Models`,
    color: data.color,
    description: Object.entries(data.models)
      .map(([shortName, fullName]) => `\`${shortName}\`: ${fullName}`)
      .join('\n')
  }));
}

async function handleCommand(interaction) {
  const { commandName, data, member } = interaction;
  const userId = member.user.id;
  const options = data.options || [];

  switch (commandName) {
    case 'model': {
      const newModel = options.find(opt => opt.name === 'name')?.value;
      
      if (!newModel) {
        const prefs = await getUserPreferences(userId);
        return {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Current model: \`${prefs.model}\` (${AVAILABLE_MODELS[prefs.model]})`
          }
        };
      }

      if (!AVAILABLE_MODELS[newModel]) {
        return {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Invalid model. Use `/models` to see available models.'
          }
        };
      }

      await saveUserPreferences(userId, { model: newModel });
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Model changed to: \`${newModel}\` (${AVAILABLE_MODELS[newModel]})`
        }
      };
    }

    case 'models': {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: createModelListEmbeds(),
          ephemeral: true
        }
      };
    }

    case 'clear': {
      await saveUserHistory(userId, [{
        role: "system",
        content: "You are a helpful assistant who responds succinctly. Maintain context of our conversation."
      }]);
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "Conversation history has been cleared!"
        }
      };
    }

    default:
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'Unknown command'
        }
      };
  }
}

async function handleMessage(message) {
  const userId = message.author.id;
  const prefs = await getUserPreferences(userId);
  let conversationHistory = await getUserHistory(userId);

  conversationHistory.push({
    role: "user",
    content: message.content
  });

  if (conversationHistory.length > 11) {
    conversationHistory = [
      conversationHistory[0],
      ...conversationHistory.slice(-10)
    ];
  }

  try {
    const response = await aiClient.path("/chat/completions").post({
      body: {
        messages: conversationHistory,
        temperature: 1.0,
        top_p: 1.0,
        model: AVAILABLE_MODELS[prefs.model]
      }
    });

    if (response.status !== 200) {
      throw new Error('AI response error');
    }

    const aiResponse = response.body.choices[0].message.content;
    conversationHistory.push({
      role: "assistant",
      content: aiResponse
    });

    await saveUserHistory(userId, conversationHistory);
    return aiResponse;

  } catch (error) {
    console.error('AI Error:', error);
    return "Sorry, I encountered an error while processing your request.";
  }
}

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const signature = request.headers.get('x-signature-ed25519');
  const timestamp = request.headers.get('x-signature-timestamp');
  const body = await request.text();

  const isValidRequest = verifyKey(
    body,
    signature,
    timestamp,
    process.env.DISCORD_PUBLIC_KEY
  );

  if (!isValidRequest) {
    return new Response('Invalid signature', { status: 401 });
  }

  const interaction = JSON.parse(body);

  try {
    let response;
    
    if (interaction.type === InteractionType.APPLICATION_COMMAND) {
      response = await handleCommand(interaction);
    } else if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
      response = await handleMessage(interaction);
    } else {
      response = {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'Unknown interaction type'
        }
      };
    }

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Handler Error:', error);
    return new Response(JSON.stringify({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'An error occurred while processing your request.'
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 