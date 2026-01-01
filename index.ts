import makeWASocket, {DisconnectReason,useMultiFileAuthState} from 'baileys';
import Pino from 'pino';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';

const chatHistory: Record<string, Array<{text: string | undefined, timestamp: number | Long | null | undefined}>> = {}

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
    if (!msg.message || msg.key.fromMe) return

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

    if (!chatHistory[jid]) chatHistory[jid] = []
    chatHistory[jid].push({text: text ?? undefined,timestamp: msg.messageTimestamp})

    if (!text) return

    if (text === 'ping' && msg.key.remoteJid && !isGroup) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: 'pong'
      })
    }
  })
}

startBot()
