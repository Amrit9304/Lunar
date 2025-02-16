import chalk from 'chalk'
import { format } from 'util'
import path, { join } from 'path'
import { fileURLToPath } from 'url'
import { unwatchFile, watchFile } from 'fs'
import { smsg } from './src/Library/simple.js'

/**
 * @type {import('@whiskeysockets/baileys')}
 */
const { proto } = (await import('@whiskeysockets/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(function () {
    clearTimeout(this)
    resolve()
}, ms))

/**
 * Handle messages upsert
 * @param {import('@whiskeysockets/baileys').BaileysEventMap<unknown>['messages.upsert']} groupsUpdate 
 */
export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || []
    if (!chatUpdate)
        return
    this.pushMessage(chatUpdate.messages).catch(console.error)
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m)
        return
    if (global.db.data == null)
        await global.loadDatabase()
    try {
        m = smsg(this, m) || m
        if (!m)
            return
        m.exp = 0
        m.credit = false
        m.bank = false
        m.chicken = false
        try {
            // FOR CONTACTS
            if (!global.db.data.contacts) {
                global.db.data.contacts = [];
            }

            function contactExists(contactId) {
                return global.db.data.contacts.some(contact => contact.id === contactId);
            }
            
            function addContact(senderId) {
                if (!contactExists(senderId)) {
                    global.db.data.contacts.push({ id: senderId });
                }
            }
            
            addContact(m.sender);

            // TODO: use loop to insert data instead of this
            let user = global.db.data.users[m.sender]
            if (typeof user !== 'object')
                global.db.data.users[m.sender] = {}
            if (user) {
                if (!isNumber(user.exp))
                    user.exp = 0
                if (!isNumber(user.credit))
                    user.credit = 10
                if (!isNumber(user.bank))
                    user.bank = 0
                if (!isNumber(user.chicken))
                    user.chicken = 0  
                if (!isNumber(user.lastclaim))
                    user.lastclaim = 0
                if (!('registered' in user))
                    user.registered = false
                    //-- user registered 
                if (!user.registered) {
                    if (!('name' in user))
                        user.name = m.name
                    if (!isNumber(user.age))
                        user.age = -1
                    if (!isNumber(user.regTime))
                        user.regTime = -1
                }
                //--user number
                if (!isNumber(user.afk))
                    user.afk = -1
                if (!('afkReason' in user))
                    user.afkReason = ''
                if (!('banned' in user))
                    user.banned = false
                if (!isNumber(user.warn))
                    user.warn = 0
                if (!isNumber(user.level))
                    user.level = 0
                if (!('role' in user))
                    user.role = 'Recruit 🔰'
                if (!('autolevelup' in user))
                    user.autolevelup = true
                if (!('chatbot' in user))
                    user.chatbot = false
            } else
                global.db.data.users[m.sender] = {
                    exp: 0,
                    credit: 0,
                    bank: 0,
                    chicken: 0,
                    lastclaim: 0,
                    registered: false,
                    name: m.name,
                    age: -1,
                    regTime: -1,
                    afk: -1,
                    afkReason: '',
                    banned: false,
                    warn: 0,
                    level: 0,
                    role: 'Tadpole',
                    autolevelup: true,
                    chatbot: false
                }

            // //FOR CARDS    
            // if (!global.db.data.cards) {
            //     global.db.data.cards = {};
            // }
                
            // if (!global.db.data.cards[m.sender]) {
            //     global.db.data.cards[m.sender] = {
            //         deck: [],
            //         collection: []
            //     };
            // }

            let chat = global.db.data.chats[m.chat]
            if (typeof chat !== 'object')
                global.db.data.chats[m.chat] = {}
            if (chat) {
                if (!('isBanned' in chat)) chat.isBanned = false
                if (!('welcome' in chat))  chat.welcome = false
                if (!('detect' in chat))   chat.detect = false
                if (!('sWelcome' in chat)) chat.sWelcome = ''
                if (!('sBye' in chat))     chat.sBye = ''
                if (!('sPromote' in chat)) chat.sPromote = ''
                if (!('sDemote' in chat))  chat.sDemote = ''
                if (!('delete' in chat))   chat.delete = true
                if (!('antiLink' in chat)) chat.antiLink = false
                if (!('viewonce' in chat)) chat.viewonce = false
                if (!("nsfw" in chat))     chat.nsfw = false
                if (!('cards' in chat))    chat.cards = false
                if (!isNumber(chat.expired)) chat.expired = 0
            } else
                global.db.data.chats[m.chat] = {
                    isBanned: false,
                    welcome: false,
                    detect: false,
                    sWelcome: '',
                    sBye: '',
                    sPromote: '',
                    sDemote: '',
                    delete: true,
                    antiLink: false,
                    viewonce: false,
                    useDocument: true,
                    onlyLatinos: false,
                    nsfw: false, 
                    cards: false,
                    expired: 0,
                }
            let settings = global.db.data.settings[this.user.jid]
            if (typeof settings !== 'object') global.db.data.settings[this.user.jid] = {}
            if (settings) {
                if (!('self' in settings)) settings.self = false
                if (!('autoread' in settings)) settings.autoread = false
                if (!('restrict' in settings)) settings.restrict = false
                if (!('status' in settings)) settings.status = 0
            } else global.db.data.settings[this.user.jid] = {
                self: false,
                autoread: false,
                restrict: false, 
                status: 0
            }
        } catch (e) {
            console.error(e)
        }
        if (opts['nyimak'])
            return
        if (!m.fromMe && opts['self'])
            return
        if (opts['pconly'] && m.chat.endsWith('g.us'))
            return
        if (opts['gconly'] && !m.chat.endsWith('g.us'))
            return
        if (opts['swonly'] && m.chat !== 'status@broadcast')
            return
        if (typeof m.text !== 'string')
            m.text = ''

        const isROwner = [conn.decodeJid(global.conn.user.id), ...global.owner.map(([number]) => number)].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
        const isOwner = isROwner || m.fromMe
        const isMods = isOwner || global.mods.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
        const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)

        if (opts['queque'] && m.text && !(isMods || isPrems)) {
            let queque = this.msgqueque, time = 1000 * 5
            const previousID = queque[queque.length - 1]
            queque.push(m.id || m.key.id)
            setInterval(async function () {
                if (queque.indexOf(previousID) === -1) clearInterval(this)
                await delay(time)
            }, time)
        }

        if (m.isBaileys)
            return
        m.exp += Math.ceil(Math.random() * 15)

        let usedPrefix
        let _user = global.db.data && global.db.data.users && global.db.data.users[m.sender]
        const groupMetadata = (m.isGroup ? ((conn.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(_ => null)) : {}) || {}
        const participants = (m.isGroup ? groupMetadata.participants : []) || []
        const user = (m.isGroup ? participants.find(u => conn.decodeJid(u.id) === m.sender) : {}) || {} // User Data
        const bot = (m.isGroup ? participants.find(u => conn.decodeJid(u.id) == this.user.jid) : {}) || {} // Your Data
        const isRAdmin = user?.admin == 'superadmin' || false
        const isAdmin = isRAdmin || user?.admin == 'admin' || false // Is User Admin?
        const isBotAdmin = bot?.admin || false // Are you Admin?

        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './src/Commands')
        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin)
                continue
            if (plugin.disabled)
                continue
            const __filename = join(___dirname, name)
            if (typeof plugin.all === 'function') {
                try {
                    await plugin.all.call(this, m, {
                        chatUpdate,
                        __dirname: ___dirname,
                        __filename
                    })
                } catch (e) {
                    console.error(e)
                }
            }
            if (!opts['restrict'])
                if (plugin.tags && plugin.tags.includes('admin')) {
                    // global.dfail('restrict', m, this)
                    continue
                }
            const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
            let _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix
            let match = (_prefix instanceof RegExp ? // RegExp Mode?
                [[_prefix.exec(m.text), _prefix]] :
                Array.isArray(_prefix) ? // Array?
                    _prefix.map(p => {
                        let re = p instanceof RegExp ? // RegExp in Array?
                            p :
                            new RegExp(str2Regex(p))
                        return [re.exec(m.text), re]
                    }) :
                    typeof _prefix === 'string' ? // String?
                        [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
                        [[[], new RegExp]]
            ).find(p => p[1])
            if (typeof plugin.before === 'function') {
                if (await plugin.before.call(this, m, {
                    match,
                    conn: this,
                    participants,
                    groupMetadata,
                    user,
                    bot,
                    isROwner,
                    isOwner,
                    isRAdmin,
                    isAdmin,
                    isBotAdmin,
                    isPrems,
                    chatUpdate,
                    __dirname: ___dirname,
                    __filename
                }))
                    continue
            }
            if (typeof plugin !== 'function')
                continue
            if ((usedPrefix = (match[0] || '')[0])) {
                let noPrefix = m.text.replace(usedPrefix, '')
                let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
                args = args || []
                let _args = noPrefix.trim().split` `.slice(1)
                let text = _args.join` `
                command = (command || '').toLowerCase()
                let fail = plugin.fail || global.dfail // When failed
                let isAccept = plugin.command instanceof RegExp ? // RegExp Mode?
                    plugin.command.test(command) :
                    Array.isArray(plugin.command) ? // Array?
                        plugin.command.some(cmd => cmd instanceof RegExp ? // RegExp in Array?
                            cmd.test(command) :
                            cmd === command
                        ) :
                        typeof plugin.command === 'string' ? // String?
                            plugin.command === command :
                            false                
 
                if (!isAccept) 
                    continue
                m.plugin = name
                if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
                    let chat = global.db.data.chats[m.chat]
                    let user = global.db.data.users[m.sender]
                    if (name !== 'Unbanchat' && chat?.isBanned)
                        return // Except this
                        if (name !== 'owner-unbanuser.js' && user?.banned) {
                            let banDetails = user.banned.bannedBy
                                ? `*Banned by:* ${user.banned.bannedBy.split('@')[0]}\n*Banned in:* ${
                                    user.banned.bannedIn
                                }\n*Banned on:* ${new Date(user.banned.banTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`
                                : ''
                        let reason = `*Reason:* ${user.banned.banReason}`
                        conn.reply(m.chat, `🟥 *You are banned from using the bot.*\n\n${reason}\n${banDetails}`, m)
                        return
                    }
                }
                if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) { // Both Owner
                    fail('owner', m, this)
                    continue
                }
                if (plugin.rowner && !isROwner) { // Real Owner
                    fail('rowner', m, this)
                    continue
                }
                if (plugin.owner && !isOwner) { // Number Owner
                    fail('owner', m, this)
                    continue
                }
                if (plugin.mods && !isMods) { // Moderator
                    fail('mods', m, this)
                    continue
                }
                if (plugin.premium && !isPrems) { // Premium
                    fail('premium', m, this)
                    continue
                }
                if (plugin.group && !m.isGroup) { // Group Only
                    fail('group', m, this)
                    continue
                } else if (plugin.botAdmin && !isBotAdmin) { // You Admin
                    fail('botAdmin', m, this)
                    continue
                } else if (plugin.admin && !isAdmin) { // User Admin
                    fail('admin', m, this)
                    continue
                }
                if (plugin.private && m.isGroup) { // Private Chat Only
                    fail('private', m, this)
                    continue
                }
                // if (plugin.register == true && _user.name2 == false) { // Butuh daftar?
                //     fail('unnick', m, this)
                //     continue
                // }
                if (plugin.register == true && _user.registered == false) { // Butuh daftar?
                    fail('unreg', m, this)
                    continue
                }
                m.isCommand = true
                let xp = 'exp' in plugin ? parseInt(plugin.exp) : 15 // XP Earning per command
                if (xp > 200)
                    m.reply('chirrido -_-') // Hehehe
                else
                    m.exp += xp
                // if (!isPrems && plugin.diamond && global.db.data.users[m.sender].diamond < plugin.diamond * 1) {
                //     this.reply(m.chat, `🟥 Your diamonds ran out\nuse the following command to buy more diamonds \n*${usedPrefix}buy* <amount> \n*${usedPrefix}buyall*`, m)
                //     continue // Limit finished
                // }
                if (!isPrems && plugin.credit && global.db.data.users[m.sender].credit < plugin.credit * 1) {
                    this.reply(m.chat, `🟥 You don't have enough gold`, m)
                    continue // Gold finished
                }
                if (plugin.level > _user.level) {
                    this.reply(m.chat, `🟥 Level required ${plugin.level} to use this command. \nYour level ${_user.level}`, m)
                    continue // If the level has not been reached
                }
                let extra = {
                    match,
                    usedPrefix,
                    noPrefix,
                    _args,
                    args,
                    command,
                    text,
                    conn: this,
                    participants,
                    groupMetadata,
                    user,
                    bot,
                    isROwner,
                    isOwner,
                    isRAdmin,
                    isAdmin,
                    isBotAdmin,
                    isPrems,
                    chatUpdate,
                    __dirname: ___dirname,
                    __filename
                }
                try {
                    await plugin.call(this, m, extra)
                    if (!isPrems) m.credit = m.credit || plugin.credit || false
                } catch (e) {
                    // Error occured
                    m.error = e
                    console.error(e)
                    if (e) {
                        let text = format(e)
                        for (let key of Object.values(global.APIKeys))
                            text = text.replace(new RegExp(key, 'g'), '#HIDDEN#')
                        m.reply(text)
                    }
                } finally {
                    // m.reply(util.format(_user))
                    if (typeof plugin.after === 'function') {
                        try {
                            await plugin.after.call(this, m, extra)
                        } catch (e) {
                            console.error(e)
                        }
                    }
                    // if (m.diamond)
                    //     m.reply(`Utilizaste *${+m.diamond}* 💎`)
                    if (m.credit)
                        m.reply(`You used *${+m.credit}*`)
                }
                break
            }
        }
    } catch (e) {
        console.error(e)
    } finally {
        if (opts['queque'] && m.text) {
            const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
            if (quequeIndex !== -1)
                this.msgqueque.splice(quequeIndex, 1)
        }
        //console.log(global.db.data.users[m.sender])
        let user, stats = global.db.data.stats
        if (m) {
            if (m.sender && (user = global.db.data.users[m.sender])) {
                user.exp += m.exp
                //user.diamond -= m.diamond * 1
                user.credit -= m.credit * 1
                user.bank -= m.bank
                user.chicken -= m.chicken
            }

            let stat
            if (m.plugin) {
                let now = +new Date
                if (m.plugin in stats) {
                    stat = stats[m.plugin]
                    if (!isNumber(stat.total))
                        stat.total = 1
                    if (!isNumber(stat.success))
                        stat.success = m.error != null ? 0 : 1
                    if (!isNumber(stat.last))
                        stat.last = now
                    if (!isNumber(stat.lastSuccess))
                        stat.lastSuccess = m.error != null ? 0 : now
                } else
                    stat = stats[m.plugin] = {
                        total: 1,
                        success: m.error != null ? 0 : 1,
                        last: now,
                        lastSuccess: m.error != null ? 0 : now
                    }
                stat.total += 1
                stat.last = now
                if (m.error == null) {
                    stat.success += 1
                    stat.lastSuccess = now
                }
            }
        }

        try {
            if (!opts['noprint']) await (await import(`./src/Library/print.js`)).default(m, this)
        } catch (e) {
            console.log(m, m.quoted, e)
        }
        if (opts['autoread'])
            await this.chatRead(m.chat, m.isGroup ? m.sender : undefined, m.id || m.key.id).catch(() => { })
    }
}

/**
 * Handle groups participants update
 * @param {import('@whiskeysockets/baileys').BaileysEventMap<unknown>['group-participants.update']} groupsUpdate 
 */
export async function participantsUpdate({ id, participants, action }) {
    if (opts['self'])
        return
    // if (id in conn.chats) return // First login will spam
    if (this.isInit)
        return
    if (global.db.data == null)
        await loadDatabase()
    let chat = global.db.data.chats[id] || {}
    let text = ''

    const emoji = {
        promote: '👤👑',
        demote: '👤🙅‍♂️',
        welcome: '👋',
        bye: '👋',
        bug: '🐛',
        mail: '📮',
        owner: '👑'
    };

    const welcomeMessages = [
        '*Hey @user, welcome to the group*!',
        '*Great to have you here, @user*',
        '*Welcome to the party! @user*',
        '*Hello @user, nice to see you here!*',
        '*Welcome to the gang, @user!*',
        '*Welcome, @user Hope you enjoy your stay!*',
        '*Yo @user, hope you brought some snacks!*',
        '*Welcome, @user! Ready to rock and roll?*',
        '*Hello, @user! Time to party!*',
        '*Glad you could make it, @user!*',
        '*Welcome, @user! Feel free to join the fun!*',
        '*Hello @user! Welcome to the madness!*',
        '*Welcome, @user! Hope you brought cookies!*'
    ];

    switch (action) {
        case 'add':
            if (chat.welcome) {
                for (let user of participants) {
                    let randomIndex = Math.floor(Math.random() * welcomeMessages.length);
                    let text = welcomeMessages[randomIndex].replace('@user', `@${user.split('@')[0]}`);

                    try {
                        this.sendMessage(id, {
                            text: text,
                            contextInfo: {
                                mentionedJid: [user]
                            }
                        })
                    } catch (error) {
                        console.error(`Error sending welcome message: ${error}`);
                    }
                }
            }
            break;
        case 'remove':
            if (chat.welcome) {
                for (let user of participants) {
                    let text = (chat.sBye || this.bye || conn.bye || `Goodbye @user, we're probably not gonna miss you`)
                        .replace('@user', '@' + user.split('@')[0]);

                    try {
                        this.sendMessage(id, {
                            text: text,
                            contextInfo: {
                                mentionedJid: [user]
                            }
                        });
                    } catch (error) {
                        console.error(`Error sending goodbye message: ${error}`);
                    }
                }
            }
            break;
        case "promote":
                const promoteText = (chat.sPromote || this.spromote || conn.spromote || `Ara Ara, looks like *@user* got demoted`).replace("@user", "@" + participants[0].split("@")[0]);
                if (chat.detect) {
                    this.sendMessage(id, {
                        text: promoteText.trim(),
                        mentions: [participants[0]]
                    });
                }
                break;
        case "demote":
                const demoteText = (chat.sDemote || this.sdemote || conn.sdemote || `Congratulations *@user*, you're now an admin`)
                    .replace("@user", "@" + participants[0].split("@")[0]);
                if (chat.detect) {
                    this.sendMessage(id, {
                        text: demoteText.trim(),
                        mentions: [participants[0]]
                    });
                }
                break;
    }
}

/**
 * Handle groups update
 * @param {import('@whiskeysockets/baileys').BaileysEventMap<unknown>['groups.update']} groupsUpdate 
 */
export async function groupsUpdate(groupsUpdate) {
    if (opts['self'])
        return
    for (const groupUpdate of groupsUpdate) {
        const id = groupUpdate.id
        if (!id) continue
        let chats = global.db.data.chats[id], text = ''
        if (!chats?.detect) continue
        if (groupUpdate.desc) text = (chats.sDesc || this.sDesc || conn.sDesc || '*Description changed to* \n@desc').replace('@desc', groupUpdate.desc)
        if (groupUpdate.subject) text = (chats.sSubject || this.sSubject || conn.sSubject || 'The group name changed to \n@group').replace('@group', groupUpdate.subject)
        if (groupUpdate.icon) text = (chats.sIcon || this.sIcon || conn.sIcon || 'The group icon changed to').replace('@icon', groupUpdate.icon)
        if (groupUpdate.revoke) text = (chats.sRevoke || this.sRevoke || conn.sRevoke || 'The group link changes to\n@revoke').replace('@revoke', groupUpdate.revoke)
        if (!text) continue
        await this.sendMessage(id, { text, mentions: this.parseMention(text) })
    }
}

export async function deleteUpdate(message) {
    try {
        const { fromMe, id, participant } = message
        if (fromMe)
            return
        let msg = this.serializeM(this.loadMessage(id))
        if (!msg)
            return
        let chat = global.db.data.chats[msg.chat] || {}
        if (chat.delete)
            return
        await this.reply(msg.chat, `You deleted a message 
┌─⊷ ANTI DELETE 
▢ *Number :* @${participant.split`@`[0]} 
└─────────────
To disable this feature, type 
*/off antidelete*
*.enable delete*
`.trim(), msg, {
            mentions: [participant]
        })
        this.copyNForward(msg.chat, msg).catch(e => console.log(e, msg))
    } catch (e) {
        console.error(e)
    }
}

global.dfail = (type, m) => {
    let msg = {
        rowner: '👑 This command can only be used by the *Creator*',
        owner: '🔱 This command can only be used by the *Owner*',
        mods: '🔰  This function is only for *mods*',
        premium: '💠 Este comando es solo para miembros *Premium*\n\nEscribe */premium* para más info',
        group: '⚙️ This command can only be used in groups!',
        private: '📮 This command can only be used in private chat',
        admin: '🛡️ This command is only for *Group Admins*',
        botAdmin: '💥 Bot need to be an *Admin!* of this group to use this command',
        unreg: '📇 Register to use this feature by typing:\n\n*/reg name.age*\n\n📌Example : */reg akeno.20*',
        restrict: '🔐 This feature is *disable* for now'
    }[type]
    if (msg) return m.reply(msg)
}

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.magenta("✅ Updated 'handler.js'"))
    if (global.reloadHandler) console.log(await global.reloadHandler())
}) 
