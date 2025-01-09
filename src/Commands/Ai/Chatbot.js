import fetch from 'node-fetch';

export async function before(m, { conn }) {
    try {
        if (m.isBaileys && m.fromMe) {
            return true;
        }

        const users = global.db.data.users;
        const chats = global.db.data.chats;

        const user = users[m.sender];
        const chat = chats[m.chat];

        if (m.sender === conn.user.jid) {
            return;
        }

        if (
            m.mtype === 'protocolMessage' ||
            m.mtype === 'pollUpdateMessage' ||
            m.mtype === 'reactionMessage' ||
            m.mtype === 'stickerMessage'
        ) {
            return;
        }

        if (
            !m.msg ||
            !m.message ||
            m.key.remoteJid !== m.chat ||
            user.banned ||
            chat.isBanned
        ) {
            return;
        }

        if (!m.quoted) {
            //console.log('Message is not a quoted message, ignoring');
            return;
        }

        if (!user.chatbot && !chat.chatbot) {
            return false;
        }

        const msg = encodeURIComponent(m.text);
        const uid = encodeURIComponent(m.sender);

        const response = await fetch(`https://oni-chan-unique-api.vercel.app/forge?user=${uid}&text=${msg}`);
        const data = await response.json();

        if (!data || !data.response) {
            console.error('Invalid response from API:', data);
            return;
        }

        const reply = data.response;
        m.reply(reply);
    } catch (error) {
        console.error("Error occurred:", error);
    }
}