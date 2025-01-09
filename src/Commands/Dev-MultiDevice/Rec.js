const {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    jidNormalizedUser
} = await import('@whiskeysockets/baileys');
import NodeCache from 'node-cache';
import fs from "fs";
import pino from 'pino';
import * as ws from 'ws';
import { makeWASocket } from '../../Library/simple.js';
const { CONNECTING } = ws;
import Command from '../../Library/Command.js'

const command = new Command('reconnect', {
    description: "Reconnects",
    aliases: ['rec'],
    category: 'dev',
    usage: 'reconnect',
    private: true
});

if (global.conns instanceof Array) console.log();
else global.conns = [];

export default async function handler(m, { conn: _conn, args }) {
    if (!((args[0] && args[0] == 'plz') || (await global.conn).user.jid == _conn.user.jid)) {
        throw '';
    }

    async function bbts() {
        let authFolderB = m.sender.split('@')[0];

        if (!fs.existsSync("./sessions/" + authFolderB)) {
            fs.mkdirSync("./sessions/" + authFolderB, { recursive: true });
        }
        args[0] ? fs.writeFileSync("./sessions/" + authFolderB + "/creds.json", JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t')) : "";

        const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${authFolderB}`);
        const msgRetryCounterMap = (MessageRetryMap) => { };
        const msgRetryCounterCache = new NodeCache();
        const { version } = await fetchLatestBaileysVersion();

        const MethodMobile = process.argv.includes("mobile");

        const connectionOptions = {
            logger: pino({ level: 'silent' }),
            mobile: MethodMobile,
            browser: ["Ubuntu", "Chrome", "20.0.04"],
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
            },
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
            getMessage: async (clave) => {
                let jid = jidNormalizedUser(clave.remoteJid);
                let msg = await store.loadMessage(jid, clave.id);
                return msg?.message || "";
            },
            msgRetryCounterCache,
            msgRetryCounterMap,
            defaultQueryTimeoutMs: undefined,
            version
        };

        let conn = makeWASocket(connectionOptions);
        if (!conn.authState.creds.registered) {
        }

        conn.isInit = false;

        let isInit = true

        async function connectionUpdate(update) {
            const { connection, lastDisconnect, isNewLogin, qr } = update;
            if (isNewLogin) conn.isInit = true;

            const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
            if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
                let i = global.conns.indexOf(conn);
                if (i < 0) return console.log(await creloadHandler(true).catch(console.error));
                delete global.conns[i];
                global.conns.splice(i, 1);

                if (code !== DisconnectReason.connectionClosed) {
                    m.reply(`🟨 *Error*`)
                    console.log(`🟨 Error`)
                    process.send('reset');
                } else {
                    m.reply(`🟥 *Closing session*`)
                    console.log(`🟥 Closing session`)
                    process.send('reset');
                }
            }
            if (global.db.data == null) loadDatabase();

            if (connection == 'open') {
                conn.isInit = true;
                global.conns.push(conn);
                await sleep(5000);
                if (args[0]) return;
                m.reply('🟩 *Connected successfully*')
                console.log('Connected successfully')
            }
        }

        setInterval(async () => {
            if (!conn.user) {
                try { conn.ws.close(); } catch { }
                conn.ev.removeAllListeners();
                let i = global.conns.indexOf(conn);
                if (i < 0) return;
                delete global.conns[i];
                global.conns.splice(i, 1);
            }
        }, 60000);

        let handler = await import('../../../handler.js');
        let creloadHandler = async function (restatConn) {
            try {
                const Handler = await import(`../../../handler.js?update=${Date.now()}`).catch(console.error);
                if (Object.keys(Handler || {}).length) handler = Handler;
            } catch (e) {
                console.error(e);
            }
            if (restatConn) {
                try { conn.ws.close(); } catch { }
                conn.ev.removeAllListeners();
                conn = makeWASocket(connectionOptions);
                isInit = true;
            }

            if (!isInit) {
                conn.ev.off('messages.upsert', conn.handler);
                conn.ev.off('group-participants.update', conn.participantsUpdate);
                conn.ev.off('groups.update', conn.groupsUpdate);
                conn.ev.off('message.delete', conn.onDelete);
                conn.ev.off('call', conn.onCall);
                conn.ev.off('connection.update', conn.connectionUpdate);
                conn.ev.off('creds.update', conn.credsUpdate);
            }

            conn.welcome = global.conn.welcome + '';
            conn.bye = global.conn.bye + '';
            conn.spromote = global.conn.spromote + '';
            conn.sdemote = global.conn.sdemote + '';

            conn.handler = handler.handler.bind(conn);
            conn.participantsUpdate = handler.participantsUpdate.bind(conn);
            conn.groupsUpdate = handler.groupsUpdate.bind(conn);
            conn.onDelete = handler.deleteUpdate.bind(conn);
            conn.connectionUpdate = connectionUpdate.bind(conn);
            conn.credsUpdate = saveCreds.bind(conn, true);

            conn.ev.on('messages.upsert', conn.handler);
            conn.ev.on('group-participants.update', conn.participantsUpdate);
            conn.ev.on('groups.update', conn.groupsUpdate);
            conn.ev.on('message.delete', conn.onDelete);
            conn.ev.on('connection.update', conn.connectionUpdate);
            conn.ev.on('creds.update', conn.credsUpdate);
            isInit = false;
            return true;
        }
        creloadHandler(false);
    }

    let authFolderPath = `./sessions/${m.sender.split('@')[0]}`;
    if (fs.existsSync(authFolderPath)) {
        bbts();
    } else {
        await bbts();
    }
}

Object.assign(handler, command.toHandlerObject());

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}