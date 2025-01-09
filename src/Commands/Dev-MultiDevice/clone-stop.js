import fs from 'fs'
import Command from '../../Library/Command.js'

const command = new Command('disconnect', {
  description: "disconnect",
  aliases: [],
  category: 'dev',
  usage: 'disconnect',
  private: true
});

export default async function handler(m, { conn }) {
    if (!m.sender) {
        await conn.sendMessage(
            m.chat,
            { text: `⛔ Error: Sender information is missing.` },
            { quoted: m }
        )
        return
    }

    const senderNumber = m.sender.split('@')[0] // Extract sender's number
    const authFolderPath = `./sessions/${senderNumber}`
    console.log(authFolderPath)

    if (!fs.existsSync(authFolderPath)) {
        await conn.sendMessage(
            m.chat,
            { text: `⛔ No credentials found for your number. There is nothing to disconnect.` },
            { quoted: m }
        )
        return
    }

    try {
        // Remove the authentication folder
        fs.rmSync(authFolderPath, { recursive: true, force: true })

        await conn.sendMessage(
            m.chat,
            { text: `✅ Disconnected successfully! Your credentials have been removed.` },
            { quoted: m }
        )
    } catch (error) {
        console.error(error)
        await conn.sendMessage(
            m.chat,
            { text: `❌ An error occurred while disconnecting: ${error.message}` },
            { quoted: m }
        )
    }
}

Object.assign(handler, command.toHandlerObject());
