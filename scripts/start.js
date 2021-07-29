#!/usr/bin/env node
const { spawn } = require('child_process');
const { join } = require('path');

const SERVICE_ROOT = join(__dirname, '../');

const BINARY = 'ts-node-dev';
const ENV_PATH = '.env';
const ENTRYPOINT = './src/entrypoint-dev.ts';
const NODE_OPTIONS = ['--trace-deprecation', '--trace-warnings', '--unhandled-rejections=strict'].join(' ');
const TS_CONFIG_OVERRIDES = { allowJs: false };
const DEBUG = false;
const CLEAR = false;

const ARGS = [
    '-O',
    JSON.stringify(TS_CONFIG_OVERRIDES),
    '--project',
    'tsconfig.build.json',
    DEBUG ? '--debug' : '',
    '--watch',
    ENV_PATH,
    CLEAR ? '--cls' : '',
    '--respawn',
    '--exit-child',
    ENTRYPOINT,
].filter(Boolean);

spawn(BINARY, ARGS, {
    cwd: SERVICE_ROOT,
    env: {
        ...process.env,
        NODE_OPTIONS,
    },
    stdio: 'inherit',
});
