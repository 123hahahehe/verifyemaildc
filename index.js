const { Client, Intents, MessageEmbed } = require('discord.js');
const emailVerify = require('email-verify');
const express = require('express');

const client1 = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const client2 = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Discord bot 1
client1.once('ready', () => {
    console.log('Bot 1 is ready!');
});

client1.on('messageCreate', handleMessage);

// Discord bot 2
client2.once('ready', () => {
    console.log('Bot 2 is ready!');
});

client2.on('messageCreate', handleMessage);

function handleMessage(message) {
    if (message.author.bot || !message.content) return;

    const emails = extractEmails(message.content);

    if (emails.length === 0) return;

    for (const email of emails) {
        validateEmail(email)
            .then(valid => sendValidationMessage(message.channel, email, valid))
            .catch(() => sendErrorMessage(message.channel, email));
    }
}

function extractEmails(text) {
    const regex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    return text.match(regex) || [];
}

function validateEmail(email) {
    return new Promise((resolve, reject) => {
        emailVerify.verify(email, function (err, info) {
            if (err) {
                reject(err);
            } else {
                resolve(info.success);
            }
        });
    });
}

function sendValidationMessage(channel, email, valid) {
    const embed = new MessageEmbed()
        .setTitle(`**${email}**`)
        .setDescription(`Status: ${valid ? 'Valid' : 'Invalid'}`)
        .setColor(valid ? '#00ff00' : '#ff0000');

    channel.send({ embeds: [embed] });
}

function sendErrorMessage(channel, email) {
    const embed = new MessageEmbed()
        .setDescription(`An error occurred while validating the email ${email}.`)
        .setColor('#ff0000');

    channel.send({ embeds: [embed] });
}

// Express server
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('hi lol');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Fetch the Discord bot tokens from environment variables
const token1 = process.env.DISCORD_TOKEN_1;
const token2 = process.env.DISCORD_TOKEN_2;

// Check if tokens are provided
if (!token1 || !token2) {
    console.error('One or both Discord bot tokens are missing.');
    process.exit(1);
}

// Login with the Discord bot tokens
client1.login(token1).catch(error => console.error(`Error logging in Bot 1: ${error}`));
client2.login(token2).catch(error => console.error(`Error logging in Bot 2: ${error}`));
