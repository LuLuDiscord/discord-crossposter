#!/usr/bin/env node
const { spawn } = require('child_process');
const { constants } = require('os');

const runtime = spawn('docker-compose', String.raw`up --remove-orphans discord-crossposter`.split(' '), {
    stdio: ['ignore', 'inherit', 'inherit'],
});

let isClosing = false;
const close = () => {
    if (isClosing) {
        return;
    }
    isClosing = true;
    runtime.once('close', () => process.exit(0));
    runtime.kill(constants.signals.SIGINT);
};

process.on('SIGINT', close);
process.on('SIGTERM', close);
