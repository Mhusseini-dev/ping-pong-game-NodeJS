const axios = require('axios')
const readline = require('readline')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

let gameDelay = 1000
let isGameRunning = false

async function sendControlCommand(action, server, delay = null) {
    try {
        let payload = { action }
        if (delay) payload.delay = delay
        await axios.post(`http://localhost:${server}/control`, payload)
    } catch (error) {
        console.error(`error with server ${server}: ${error.message}`)
    }
}

function showMenu() {
    console.log('welcome to the ping pong game ')
    console.log('\nto start the game, type -> start [delay_ms]. for example, start 5000')
    console.log('tp pause the game, type ->  pause')
    console.log('to resume -> resume')
    console.log('to stop -> stop')
    console.log('\ntype a command: ')
}

const handleCommand = async (input) => {
    let [cmd, delayStr] = input.toLowerCase().trim().split(' ')
    let delay = parseInt(delayStr)

    switch (cmd) {
        case 'start':
            if(isGameRunning) {
                console.log('game is already started') 
                break 
            }
            if (delay && !isNaN(delay)) {
                gameDelay = delay
            }
            await sendControlCommand('start', 3000, gameDelay)
            await sendControlCommand('start', 3001, gameDelay)
            isGameRunning = true
            console.log(`started with ${gameDelay}ms delay`)
            break
        case 'pause':
            if (!isGameRunning) {
                console.log('game is not started yet')
                break
            }
            await sendControlCommand('pause', 3000)
            await sendControlCommand('pause', 3001)
            console.log('\ngame is paused')
            break
        case 'resume':
            if (!isGameRunning) {
                console.log('\ngame is not started yet')
                break
            }
            await sendControlCommand('resume', 3000)
            await sendControlCommand('resume', 3001)
            console.log('\n game is resumed')
            break
        case 'stop':
            try {
                await axios.post('http://localhost:3000/shutdown')
                console.log('server one shutting down')
            } catch (error) {
                console.log('server one already stopped')
            }
            try {
                await axios.post('http://localhost:3001/shutdown')
                console.log('server two shutting down')
            } catch (error) {
                console.log('server two already stopped')
            }
            console.log('shutting down cli...')
            rl.close()
            process.exit(0)
        default:
            console.log('unrecognized command')
    }
    showMenu()
}

showMenu()

rl.on('line', handleCommand)

rl.on('close', () => {
    console.log('shut down completed')
    process.exit(0)
})