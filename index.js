const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const fs = require('fs');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const { TOKEN: token, AUTOMATIC1111: automatic1111, NEGATIVE_PROMPT: negativePrompt, POSITIVE_PROMPT: positivePrompt } = process.env;

client.once('ready', () => {
    console.log('Bot is online!');
});

client.on('messageCreate', async message => {
    console.log(message.content);

    if (message.author.bot) return;

    if (message.content.startsWith('!generate')) {
        const prompt = message.content.slice(10).trim();

        console.log(prompt);

        try {
            const response = await axios.post(automatic1111, {
                prompt: prompt + positivePrompt,
                negative_prompt: negativePrompt
            });

            const imageBuffer = Buffer.from(response.data.images[0], 'base64');

            fs.writeFileSync('output.png', imageBuffer);

            await message.channel.send({
                files: [{
                    attachment: 'output.png',
                    name: 'output.png'
                }]
            });

            fs.unlinkSync('output.png');
        } catch (error) {
            console.error('Error generating image:', error);
            // message.reply('Sorry, there was an error generating the image.');
        }
    }
});

client.login(token)
    .catch(error => {
        console.error('Error logging in:', error);
    });