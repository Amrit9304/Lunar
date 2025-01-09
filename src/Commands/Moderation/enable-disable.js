let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
    let isEnable = /true|enable|(turn)?on|1/i.test(command)
    let chat = global.db.data.chats[m.chat]
    let user = global.db.data.users[m.sender]
    let bot = global.db.data.settings[conn.user.jid] || {}
    let type = (args[0] || '').toLowerCase()
    let isAll = false, isUser = false

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    switch (type) {
        case 'welcome':
        case 'bv':
        case 'bienvenida':
            if (!m.isGroup) {
                if (!isOwner) {
                    global.dfail('group', m, conn)
                    throw false
                }
            } else if (!isAdmin) {
                global.dfail('admin', m, conn)
                throw false
            }
            chat.welcome = isEnable
            break

        case 'detect':
        case 'detector':
            if (!m.isGroup) {
                if (!isOwner) {
                    global.dfail('group', m, conn)
                    throw false
                }
            } else if (!isAdmin) {
                global.dfail('admin', m, conn)
                throw false
            }
            chat.detect = isEnable
            break

        case 'antidelete':
        case 'delete':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.delete = !isEnable
            break

        case 'document':
        case 'documento':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) return dfail('admin', m, conn)
            }
            chat.useDocument = isEnable
            break
        case 'public':
        case 'publico':
            isAll = true
            if (!isROwner) {
                global.dfail('rowner', m, conn)
                throw false
            }
            global.opts['self'] = !isEnable
            break
        case 'antilink':
        case 'antilinkwa':
        case 'antilinkwha':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.antiLink = isEnable
            break

        case 'sololatinos':
        case 'sololatino':
        case 'onlylatinos':
        case 'onlylat':
        case 'onlylatan':
        case 'sololatan':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.onlyLatinos = isEnable
            break

        case 'nsfw':
        case '+18':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.nsfw = isEnable
            break

        case 'card':
        case 'cards':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.cards = isEnable
            break

        case 'cardgame':
            isAll = true
            if (!isROwner) {
                global.dfail('rowner', m, conn)
                throw false
            }
            chat.cardgame = isEnable
            break

        case 'autolevelup':
            isUser = true
            user.autolevelup = isEnable
            break

        case 'chatbot':
        case 'autosimi':
        case 'autosimsimi':
            isUser = true
            user.chatbot = isEnable
            break

        case 'restrict':
        case 'restringir':
            isAll = true
            if (!isOwner) {
                global.dfail('owner', m, conn)
                throw false
            }
            bot.restrict = isEnable
            break

        case 'onlypv':
        case 'onlydm':
        case 'onlymd':
        case 'solopv':
            isAll = true
            if (!isROwner) {
                global.dfail('rowner', m, conn)
                throw false
            }
            global.opts['pconly'] = isEnable
            break

        case 'gponly':
        case 'onlygp':
        case 'grouponly':
        case 'sologp':
        case 'sologrupo':
            isAll = true
            if (!isROwner) {
                global.dfail('rowner', m, conn)
                throw false
            }
            global.opts['gconly'] = isEnable
            break

        default:
          
    // ┌─⊷ *ADMIN*
    // ▢ welcome
    // ▢ antilink
    // ▢ detect 
    // ▢ document
    // ▢ nsfw
    // ▢ cards
    // └───────────── 

    // ┌─⊷ *USERS*
    // ▢ chatbot 
    // └─────────────
    
    // ┌─⊷ *OWNER*
    // ▢ public
    // ▢ solopv
    // ▢ sologp
    // └─────────────

            if (!/[01]/.test(command)) return m.reply(`♻ Available Features ♻

🎉 Welcome
- Enables the bot to send welcome messages when a new member joins

🍀 NSFW
- Enable/Disable NSFW content in the group

🔗 Chatbot
- Enable/Disable chatbot

🔝 Autolevelup
- Enable/Disable autolevelup

*📌 Example :*
*${usedPrefix}enable* welcome
*${usedPrefix}disable* welcome
    `)
            throw false
    }

    m.reply(`*${isEnable ? `🟩 Enabled "${capitalizeFirstLetter(type)}"` : `🟥 Disabled "${capitalizeFirstLetter(type)}"`}*`.trim());

}
handler.help = ['en', 'dis'].map(v => v + 'able <option>')
handler.tags = ['nable']
handler.command = /^((en|dis)able|(tru|fals)e|(turn)?o(n|ff)|[01])$/i

export default handler