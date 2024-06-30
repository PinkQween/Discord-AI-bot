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

    if (message.content.startsWith('!batch')) {
        const args = message.content.slice(6).trim().split(' ');
        const count = parseInt(args[0]);
        const prompt = args.slice(1).join(' ');

        console.log(`Generating ${count} images with prompt: ${prompt}`);

        try {
            for (let i = 0; i < count; i++) {
                const response = await axios.post(automatic1111, {
                    prompt: prompt + positivePrompt,
                    negative_prompt: negativePrompt
                });

                const imageBuffer = Buffer.from(response.data.images[0], 'base64');
                const filename = `output_${i}.png`;

                fs.writeFileSync(filename, imageBuffer);

                await message.channel.send({
                    files: [{
                        attachment: filename,
                        name: filename
                    }]
                });

                fs.unlinkSync(filename);
            }
        } catch (error) {
            console.error('Error generating images:', error);
            fs.writeFile('error.log', `Error generating images: ${error}\n`, { flag: 'a' }, (err) => {
                if (err) throw err;
                console.error('Error generating images:', error);
            });
            message.reply('Sorry, Google Colab isn\'t running.');
        }
    }

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
            fs.writeFile('error.log', `Error generating image: ${error}\n`, { flag: 'a' }, (err) => {
                if (err) throw err;
                console.error('Error generating image:', error);
            });
            message.reply('Sorry, google collab isn\'t running.');
        }
    }
});

client.login(token)
    .catch(error => {
        console.error('Error logging in:', error);
    });