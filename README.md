# Discord Cross-poster

A service to cross-post messages in Discord text channels automatically.

<!-- TOC depthFrom:2 -->

-   [1. Development](#1-development)
    -   [1.1. Testing](#11-testing)

<!-- /TOC -->

## 1. Development

If you wish to contribute, you can clone your own fork then execute the following commands to get setup:

```bash
# Install dependencies
yarn install \
    --frozen-lockfile \
    --production=false \
    --prefer-offline
```

If you want to build the source code, run `yarn build`.

You can additionally run `yarn clean` to clean the build output for both languages.

### 1.1. Testing

Once you have the development environment setup, you can run `yarn test` to run the test suite.

If you would like to generate coverage, you can run `yarn test:coverage`.

If you want to watch the test files and re-run them on code changes, you can run `yarn test:watch`
