# Ping-Pong Game – Node.js Multi-Server Simulation

This project simulates a "ping-pong" game between two independent Node.js servers. The servers send `ping` and `pong` requests back and forth via HTTP. A separate CLI tool is used to control the game (start, pause, resume, stop).

---

## Project Structure

- `server-one.js`: Runs on port `3000`, initiates the game.
- `server-two.js`: Runs on port `3001`, responds to and returns pings.
- `cli.js`: Interactive cli controller to start/pause/resume/stop the game.

---

## How It Works

- The servers communicate by sending POST requests to each other.
- The CLI sends control commands to both servers using HTTP requests.
- Game can be paused/resumed or stopped cleanly.
- Includes retry logic if one of the servers becomes temporarily unavailable.

---

## Installation

Make sure you have **Node.js** installed, then:

```bash
npm install

node server_one.js #to start server one
node server_two.js # to start server two
node cli.js # to start the interactive cli 

from this cli you can start the game with the set delay you need. for example -> start 5000 
