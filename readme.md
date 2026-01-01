A WhatsApp bot built with Baileys and powered by AI. This bot can respond to messages, execute commands, generate content, and even run shell commands so fun right!!!

## Features

### AI ChatBot 
It auto replies your dms hehe

### Fun Commands
- `/rizz [@user]` - rizz smone up
- `/insult [@user]` - gen insults
- `/cat` - Random meow image
- `/dog` - Random dog image
- `/duck` - Random duck image
- `/fox` - Random fox image
- `/neko` - Random neko image
- `/catfact` - Random car fact
- `/joke` - Random joke
- `/chucknorris` - Chuck Norris jokes
- `/buzz` - Corporate buzzwords
- `/uselessfact` - Random useless facts
- `/techy` - Tech related phrases

### Games & Questions
- `/t [rating]` - Truth questions
- `/d [rating]` - Dare challenges
- `/wyr [rating]` - Would You Rather questions
- `/nhie [rating]` - Never Have I Ever questions
- `/paranoia [rating]` - Paranoia questions
- `/eli5 <topic>` - Explain like I'm 5

### Utility Commands
- `/qrcode <text>` - Generate QR code
- `/scanqr` - Scan QR code from replied image
- `/colormind` - Generate random color palette
- `/poll opt1, opt2, ...` - Create a poll
- `/schedule <YYYY-MM-DDTHH:MM:SS> <message>` - Schedule a message
- `/save` - Save quoted message to pinned list
- `/saves` - View all saved messages
- `/clearsaves` - Clear saved messages

### Developer Commands
- `/git <args>` - Execute git commands
- `/gh repo <args>` - Execute GitHub CLI repo commands
- `/gh issue <args>` - Execute GitHub CLI issue commands
- `/cmd <command>` - Execute shell commands with persistent working directory

### Management
- `/start` - Enable bot responses in current chat
- `/stop` - Disable bot responses in current chat
- `/help` - Show all available commands

## Installation

1. Clone the repository:
```bash
git clone https://github.com/alaotach/wp-bot
cd wp-bot
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file in the root directory:
```env
ai_api_key=your_hackclub_ai_api_key
```

4. Run the bot:
```bash
node index.ts
```

5. Scan the QR code with WhatsApp to authenticate

## Configuration

### Config File
The bot uses `config.json` to define default allowed chat names:
```json
{
  "chatNames": ["Aryan", "Ron", "120363403086364841@g.us", ...]
}
```

### Chat Names
The bot responds to messages from chats listed in chat-names.json. You can:
- Add/remove chats using `/start` and `/stop` commands
- Manually edit the file to add chat names or group JIDs
- If `chat-names.json` doesn't exist, it uses `chatNames` from `config.json`

## Credits

- AI Chat: [Hack Club AI](https://ai.hackclub.com/)
- Cat Images: [CATAAS](https://cataas.com/)
- Dog Images: [Dog CEO](https://dog.ceo/)
- Pickup Lines: Custom AWS Lambda
- Insults: [Evil Insult](https://evilinsult.com/)
- Jokes: [JokeAPI](https://jokeapi.dev/)
- Chuck Norris Jokes: [Chuck Norris API](https://api.chucknorris.io/)
- Truth/Dare/etc: [Truth or Dare Bot API](https://api.truthordarebot.xyz/)
- Color Palettes: [Colormind](http://colormind.io/)
