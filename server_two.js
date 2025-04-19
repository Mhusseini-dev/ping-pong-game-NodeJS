const express = require('express')
const axios = require('axios')
const app = express()

let PORT = 3001
let SERVER_NAME = 'server two'
let gameState = {
    isRunning: false,
    delayMs: 1000
}

const server = app.listen(PORT, () => {
    log(`ready on ${PORT}`)
})

const log = (msg,) => {
    const time = new Date().toLocaleTimeString();
    console.log(`${time} ---info: ${msg}`);
}
app.use(express.json())

app.post('/ping', (req, res) => {
    if (!gameState.isRunning) {
        return res.status(503).json({ message: 'game paused' })
    }
    log(`got ping from server one with status ${res.statusCode}`)
    res.status(200).json({ message: 'pong' })
    
    setTimeout(async () => {
        if (gameState.isRunning) {
            await sendNextPing()
        }
    }, gameState.delayMs)
})

const sendNextPing = async (retries = 2) => {
    for (let i = 0; i < retries; i++) {
        try {
            await axios.post('http://localhost:3000/ping', { 
                message: 'pong',
                attempt: i + 1
            }, {
                timeout: gameState.delayMs
            })
            log(`${SERVER_NAME} ponged server one after ${gameState.delayMs}ms`)
            return true
        } catch (error) {
            const attemptMsg = `Attempt ${i + 1}/${retries}`
            if (error.code === 'ECONNREFUSED') {
                log(`${attemptMsg}: server_one appears to be down`, 'error')
            } else if (error.code === 'ETIMEDOUT') {
                log(`${attemptMsg}: server_one timed out`, 'error')
            } else {
                log(`${attemptMsg}: ${error.message}`, 'error')
            }
            
            if (i < retries - 1) {
                log('Waiting before next retry...', 'info')
                await new Promise(resolve => setTimeout(resolve, 1000))
            } else {
                log('Max retries reached, stopping game', 'error')
                gameState.isRunning = false
            }
        }
    }
    return false
}

app.post('/control', (req, res) => {
    const { action, delay } = req.body
    
    switch (action) {
        case 'start':
            gameState.isRunning = true
            gameState.delayMs = delay || 1000
            break
        case 'pause':
            gameState.isRunning = false
            break
        case 'resume':
            gameState.isRunning = true
            break
    }
    
    res.json({ ok: true, action, state: gameState })
})

app.post('/shutdown', (req, res) => {
    res.json({ message: 'shutting down' })
    process.emit('SIGINT')
})

const shutdown = async (signal) => {
    log(`got ${signal}, closing server`)
    gameState.isRunning = false
    
    server.close(() => {
        log('closed')
        process.exit(0)
    })

    setTimeout(() => {
        log('force quit')
        process.exit(1)
    }, 10000)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))