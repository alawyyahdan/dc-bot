import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { AVAILABLE_MODELS } from '../lib/ai.js';

const commands = [
  {
    name: 'model',
    description: 'View or change the AI model',
    options: [
      {
        name: 'name',
        description: 'The model to switch to',
        type: 3, // STRING
        required: false,
        choices: Object.entries(AVAILABLE_MODELS).map(([shortName, fullName]) => ({
          name: shortName,
          value: shortName
        }))
      }
    ]
  },
  {
    name: 'models',
    description: 'List all available AI models'
  },
  {
    name: 'clear',
    description: 'Clear conversation history'
  }
];

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commands }
    );
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})(); 