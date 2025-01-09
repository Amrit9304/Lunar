import Command from '../../Library/Command.js';

const command = new Command('delete', {
    description: "Delete mesasges",
    category: 'utils',
    usage: 'delete [quote]',
    group: true
});

export default async function handler(m, { conn }) {
    if (!m.quoted) throw `🟥 Reply to the message you want to delete`
    try {
        let delet = m.message.extendedTextMessage.contextInfo.participant
        let bang = m.message.extendedTextMessage.contextInfo.stanzaId
        return conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet } })
    } catch {
        return conn.sendMessage(m.chat, { delete: m.quoted.vM.key })
    }
}

Object.assign(handler, command.toHandlerObject());