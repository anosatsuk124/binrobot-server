import * as ws from 'ws';
import * as dotenv from 'dotenv';
import * as http from 'http';
dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

const server = http.createServer();
const wss = new ws.Server({ server: server });
const clientsByChannel = new Map();

wss.on('connection', (client, req) => {
    const channel = new URL(
        req.url as string,
        `http://${req.headers.host}`
    ).pathname
        .split('/')
        .slice(-1)[0];

    if (!clientsByChannel.has(channel)) {
        clientsByChannel.set(channel, new Set());
    }

    clientsByChannel.get(channel).add(client);

    client.on('message', (data) => {
        for (const receiver of clientsByChannel.get(channel) || []) {
            if (receiver == client) continue;
            try {
                receiver.send(data);
            } catch (e) {
                console.warn(e);
            }
        }

        console.log('%s', data);
        client.send(data);
    });
});

server.listen(PORT);
