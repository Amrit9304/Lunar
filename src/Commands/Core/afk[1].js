export function before(m) {
    let user = global.db.data.users[m.sender]
    if (user.afk > -1) {
        m.reply(`
🎎 Your afk status has been set: False\n\n
⏱️ *AFK Duration :* ${(new Date - user.afk).toTimeString()}
  `.trim())
        user.afk = -1
        user.afkReason = ''
    }
    let jids = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])]
    for (let jid of jids) {
        let user = global.db.data.users[jid]
        if (!user)
            continue
        let afkTime = user.afk
        if (!afkTime || afkTime < 0)
            continue
        let reason = user.afkReason || ''
        m.reply(`${user.name} is currently AFK 

${reason ? '*Reason* : ' + reason : '*Reason* : Without reason'}\n
*AFK Duration* : ${(new Date - afkTime).toTimeString()}
  `.trim())
    }
    return true
}
