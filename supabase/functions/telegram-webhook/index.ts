const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
const APP_URL = Deno.env.get('APP_URL') // URL of your hosted Vite app

console.log("Function initialized")

Deno.serve(async (req: { url: string | URL; method: string; json: () => any }) => {
    try {
        const url = new URL(req.url)
        if (req.method !== 'POST') {
            return new Response('Method Not Allowed', { status: 405 })
        }

        const payload = await req.json()
        console.log("Received payload:", payload)

        const message = payload.message
        if (!message || !message.text) {
            return new Response('OK', { status: 200 })
        }

        const chatId = message.chat.id
        const text = message.text

        if (text === '/start') {
            const welcomeText = 'Привет! Добро пожаловать в Sardoba Project. Жми кнопку ниже, чтобы открыть магазин 👇'
            await sendMessage(chatId, welcomeText)
        } else {
            await sendMessage(chatId, 'Я пока понимаю только /start и работу через приложение.')
        }

        return new Response(
            JSON.stringify({ ok: true }),
            { headers: { "Content-Type": "application/json" } },
        )
    } catch (error) {
        console.error("Error:", error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        return new Response(
            JSON.stringify({ error: errorMessage }),
            { status: 500, headers: { "Content-Type": "application/json" } },
        )
    }
})

async function sendMessage(chatId: number, text: string) {
    const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`

    // Construct the inline keyboard with the Web App button
    // Note: We specifically check if APP_URL is set
    const webAppBtn = APP_URL
        ? {
            inline_keyboard: [
                [{ text: "🚀 Открыть Проект", web_app: { url: APP_URL } }]
            ]
        }
        : undefined

    const payload = {
        chat_id: chatId,
        text: text,
        reply_markup: webAppBtn
    }

    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })

    const result = await response.json()
    if (!result.ok) {
        console.error("Telegram API Error:", result)
    }
    return result
}
