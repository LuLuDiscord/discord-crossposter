import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import fs from 'fs';
import path from 'path';

const ENV_FILE_PATH = path.join(__dirname, '..', '.env');
const ENV_FILE_CONTENTS = fs.readFileSync(ENV_FILE_PATH);
const ENV_VARS = dotenvExpand(dotenv.parse(ENV_FILE_CONTENTS, { debug: false }));

for (const [key, value] of Object.entries(ENV_VARS)) {
    process.env[key] = value as string;
}

import('./entrypoint');
