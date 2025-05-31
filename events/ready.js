const cron = require('node-cron');
const FileProcessor = require('../utils/fileProcessor');

const fileProcessor = new FileProcessor();

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`🤖 Bot logged in as ${client.user.tag}!`);
    console.log(`📊 Serving ${client.guilds.cache.size} servers`);
    console.log(`👥 Watching ${client.users.cache.size} users`);
    
    // Set bot status
    client.user.setActivity('AI Assistant | !help for commands', { type: 'WATCHING' });
    
    // Schedule file cleanup every hour
    cron.schedule('0 * * * *', async () => {
      console.log('🧹 Running scheduled file cleanup...');
      try {
        await fileProcessor.cleanupOldFiles();
        console.log('✅ File cleanup completed');
      } catch (error) {
        console.error('❌ Error during file cleanup:', error);
      }
    });
    
    console.log('✅ Bot is fully ready and operational!');
  }
}; 