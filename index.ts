import 'dotenv/config';
import makeWASocket, {DisconnectReason,useMultiFileAuthState} from 'baileys';
import Pino from 'pino';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import OpenAI from 'openai';

const client = new OpenAI({
    baseURL: "https://ai.hackclub.com/proxy/v1",
    apiKey: process.env.ai_api_key,
});

// /stop /start /addchat

const chatNames = ["Aryan", "maal+kinn", "Ron", "120363403086364841@g.us", "sticker", "ToothBrush", "keeda", "Fire", "Anand", "Jai Shri", "Dev Bhardwaj", "Priyanshu", "saniya", "ShUbHaM"]

const chatHistory: Record<string, Array<{text: string | undefined, timestamp: number | Long | null | undefined, role: 'user' | 'assistant'}>> = {}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')

  const sock = makeWASocket({
    auth: state,
    logger: Pino({ level: 'silent' }),
    printQRInTerminal: true
  })

  const groupCache: Record<string, string> = {}

  async function getGroupName(jid: string) {
    if (!groupCache[jid]) {
        const meta = await sock.groupMetadata(jid)
        groupCache[jid] = meta.subject
    }
    return groupCache[jid]
  }

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      console.log('Scan this QR code with WhatsApp:')
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'open') {
      console.log('WhatsApp bot connected')
    }

    if (connection === 'close') {
      const reason = (lastDisconnect?.error as Boom)?.output?.statusCode
      if (reason !== DisconnectReason.loggedOut) {
        startBot()
      } else {
        console.log('Logged out. Delete auth folder and re-scan.')
      }
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    console.log('Received message:', msg.key.remoteJid, msg.key.fromMe)
    if (!msg.message) return

    const jid = msg.key.remoteJid
    if (!jid) return
    const isGroup = jid.endsWith('@g.us')

    let chatName
    let senderName

    if (isGroup) {
        chatName = await getGroupName(jid)
        const sender = msg.key.participant
        senderName = msg.pushName || sender?.split('@')[0] || 'Unknown'
    } else {
        chatName = msg.pushName || jid.split('@')[0]
        senderName = chatName
    }

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text

    const isAllowed = isGroup ? chatNames.includes(jid) : chatNames.some(name => chatName.toLowerCase().includes(name.toLowerCase()))
    if (!isAllowed) {
        return
    }

    if (!chatHistory[jid]) chatHistory[jid] = []
    chatHistory[jid].push({text: text ?? undefined, timestamp: msg.messageTimestamp, role: 'user'})

    console.log(`${text}, ${isGroup}`)
    if (!text) return

    if (msg.key.remoteJid && msg.key.fromMe && text === '/stop') {
        chatNames.splice(chatNames.indexOf(chatName), 1)
        console.log(`Stopped responding to ${chatName}`)
        return
    }
    if (msg.key.remoteJid && msg.key.fromMe && text === '/start') {
        if (!chatNames.includes(chatName)) {
            chatNames.push(chatName)
            console.log(`Started responding to ${chatName}`)
        }
    }

    if (msg.key.remoteJid && isAllowed && !msg.key.fromMe) {
        console.log('generating response...')
        const recents = chatHistory[jid].slice(-100)
        const ctxmsgs = recents.map(historyMsg => ({
            role: historyMsg.role,
            content: historyMsg.text || ""
        }))
        console.log(`replying to ${senderName} in chat ${chatName}`)
        console.log('messages:', ctxmsgs)

        const resp = await client.chat.completions.create({
            model: "qwen/qwen-32b",
            messages: ctxmsgs,
            stream: false,
        })
        const content = resp.choices[0].message.content
        const reply = typeof content === 'string' ? content : Array.isArray(content) ? (content as any[]).find(item => 'text' in item)?.text || 'No response': 'No response'
        chatHistory[jid].push({text: reply, timestamp: Date.now(), role: 'assistant'})
        
        await sock.sendMessage(msg.key.remoteJid, {
          text: reply
        })
    }
  })
}

startBot()
