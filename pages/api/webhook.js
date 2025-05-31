import { verifyKey } from 'discord-interactions';
import { AVAILABLE_MODELS, MODEL_CATEGORIES, generateCompletion } from '../../lib/ai';
import { getUserPreferences, saveUserPreferences, getUserHistory, saveUserHistory } from '../../lib/storage';

const INTERACTION_TYPE = {
  PING: 1,
  APPLICATION_COMMAND: 2,
  MESSAGE_COMPONENT: 3
};

const RESPONSE_TYPE = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4
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
  const { data, member } = interaction;
  const userId = member.user.id;
  const options = data.options || [];

  switch (data.name) {
    case 'model': {
      const newModel = options.find(opt => opt.name === 'name')?.value;
      
      if (!newModel) {
        const prefs = await getUserPreferences(userId);
        return {
          type: RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Current model: \`${prefs.model}\` (${AVAILABLE_MODELS[prefs.model]})`
          }
        };
      }

      await saveUserPreferences(userId, { model: newModel });
      return {
        type: RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Model changed to: \`${newModel}\` (${AVAILABLE_MODELS[newModel]})`
        }
      };
    }

    case 'models': {
      return {
        type: RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
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
        type: RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "Conversation history has been cleared!"
        }
      };
    }

    default:
      return {
        type: RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
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
    const aiResponse = await generateCompletion(
      conversationHistory,
      AVAILABLE_MODELS[prefs.model]
    );

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const signature = req.headers['x-signature-ed25519'];
  const timestamp = req.headers['x-signature-timestamp'];
  const body = JSON.stringify(req.body);

  const isValidRequest = verifyKey(
    body,
    signature,
    timestamp,
    process.env.DISCORD_PUBLIC_KEY
  );

  if (!isValidRequest) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const interaction = req.body;

  try {
    let response;
    
    if (interaction.type === INTERACTION_TYPE.PING) {
      response = { type: RESPONSE_TYPE.PONG };
    } else if (interaction.type === INTERACTION_TYPE.APPLICATION_COMMAND) {
      response = await handleCommand(interaction);
    } else if (interaction.type === INTERACTION_TYPE.MESSAGE_COMPONENT) {
      response = await handleMessage(interaction);
    } else {
      response = {
        type: RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'Unknown interaction type'
        }
      };
    }

    return res.status(200).json(response);

  } catch (error) {
    console.error('Handler Error:', error);
    return res.status(500).json({
      type: RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'An error occurred while processing your request.'
      }
    });
  }
} 