import Command from '../../Library/Command.js';
import { translate } from '@vitalets/google-translate-api'

const command = new Command('translate', {
  description: "Will translate the given word to your selected language",
  aliases: ['tr'],
  category: 'utils',
  usage: `tr <word>|<language_code>\nExample: ${global.prefix}tr zh-cn|Hello`
});

const defaultLang = 'en'
const tld = 'cn'

export default async function handler(m, { args, usedPrefix, command }) {
    let err = `
📌 *Example:*

*${usedPrefix + command}* <id> [text]
*${usedPrefix + command}* en Hello World

≡ *List of supported languages:* 

https://cloud.google.com/translate/docs/languages
`.trim()

    let lang = args[0]
    let text = args.slice(1).join(' ')
    if ((args[0] || '').length !== 2) {
        lang = defaultLang
        text = args.join(' ')
    }
    if (!text && m.quoted && m.quoted.text) text = m.quoted.text

    try {
       let result = await translate(text, { to: lang, autoCorrect: true }).catch(_ => null) 
       m.reply(result.text)
    } catch (e) {
        throw err
    } 

}

Object.assign(handler, command.toHandlerObject());