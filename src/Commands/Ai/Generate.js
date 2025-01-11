import axios from 'axios';
import Command from '../../Library/Command.js';

const command = new Command('generate', {
    description: "Generate image based on prompt",
    aliases: ['draw'],
    category: 'ai',
    usage: 'generate <prompt>'
});

const style = '```'

const NSFW_WORDS = [
    "boobs", "pussy", "naked", "ass", "asshole", "panty", "nudes",
	"porn", "xxx", "adult", "sex", "nude", "naked", "explicit", 
    "erotic", "hardcore", "bdsm", "cum", "dick", "blowjob", "doggystyle",
    "gore", "intimate", "strip", "masturbation", "footjob",
    "lingerie", "provocative", "incest", "escort", "prostitute", 
    "peeping", "sensual", "obscene"
];

export default async function handler(m, { conn, usedPrefix, command, args }) {
    let who = m.fromMe ? conn.user.jid : m.sender;
    let username = conn.getName(who);
    const userTag = `@${m.sender.split('@')[0]}`

    if (!args.length) {
        return conn.reply(m.chat, `Please provide a prompt for image generation. Usage: ${usedPrefix}${command} <prompt>`, m);
    }

    const prompt = args.join(' ');

    const { imageUrl, usedPrompt } = await generate(prompt);

    const caption = `───────────────\n📄 *Prompt:* ${style}${usedPrompt}${style
        }\n───────────────\n👤 *Generated By:* ${userTag}\n───────────────`;

    if (imageUrl) {
        conn.sendMessage(
            m.chat, {
            image: { url: imageUrl },
            caption: caption,
            mentions: [m.sender]
        },
            {
                quoted: m
            }
        );
    } else {
        conn.reply(m.chat, `Sorry *${username}*, there was an error generating the image. Please try again later.`, m);
    }
}

async function generate(prompt) {
    const apiUrl = "https://oni-chan-unique-api.onrender.com/api/v1/image/generate";
    const payload = {
        prompt: prompt,
        model: "stable-diffusion-3.5-large"
    };

    try {
        const response = await axios.post(apiUrl, payload, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.data.status && response.data.data && response.data.data.image) {
            return {
                imageUrl: response.data.data.image,
                usedPrompt: response.data.data.prompt
            };
        } else {
            console.error("Invalid response structure:", response.data);
            return { imageUrl: null, usedPrompt: null }; // Return null if the response is not valid
        }
    } catch (error) {
        console.error("Error testing API:");
        if (error.response) {
            console.error("Status Code:", error.response.status);
            console.error("Data:", error.response.data);
        } else {
            console.error(error.message);
        }
        return { imageUrl: null, usedPrompt: null }; // Return null if there was an error
    }
}

Object.assign(handler, command.toHandlerObject());
