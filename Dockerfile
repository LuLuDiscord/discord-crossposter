# syntax = docker/dockerfile:1.2

#
# Config
#
ARG NODE_VERSION=14

#
# Base Images
#
FROM mhart/alpine-node:slim-$NODE_VERSION as runtime_base
FROM mhart/alpine-node:$NODE_VERSION as builder_base

#
# Builder Image
#
FROM builder_base as builder
WORKDIR /usr/app
# Install Build Dependencies
RUN --mount=type=cache,id=builder-apk-cache,target=/var/cache/apk ln -vs /var/cache/apk /etc/apk/cache && \
    apk add --update \
    --virtual common-dependencies \
    make \
    cmake \
    g++ \
    python \
    bash \
    jq \
    git
RUN --mount=type=cache,id=builder-yarn-global-cache,target=/root/.config/yarn/global \
    yarn global add node-gyp
# Copy Files
COPY ./package.json ./yarn.lock .yarnclean ./
# Install Development Dependencies
RUN --mount=type=cache,id=builder-yarn-local-cache,target=/usr/local/share/.cache/yarn \
    yarn install \
    # Use yarn.lock
    --frozen-lockfile \
    # Dont look for yarnrc
    --no-default-rc \
    # All dependencies
    --production=false \
    # Delete old dependencies
    --force \
    # Check cache first
    --prefer-offline
COPY ./src ./src

FROM builder_base as common
WORKDIR /usr/app
COPY tsconfig.base.json tsconfig.build.json .prettierrc.js ./

FROM builder as development
# Git Info
ARG GIT_COMMIT_SHA
ENV GIT_COMMIT_SHA $GIT_COMMIT_SHA
ARG GIT_COMMIT_AUTHOR
ENV GIT_COMMIT_AUTHOR $GIT_COMMIT_AUTHOR
ARG GIT_COMMIT_DATE
ENV GIT_COMMIT_DATE $GIT_COMMIT_DATE
ARG GIT_COMMIT_TITLE
ENV GIT_COMMIT_TITLE $GIT_COMMIT_TITLE
# Copy Common
COPY --from=common /usr/app ./
# Linting
COPY .eslintrc.js .eslintignore tsconfig.eslint.json tsconfig.json ./
COPY ./scripts ./scripts
CMD echo "override me!"

FROM builder as production
# Copy Common
COPY --from=common /usr/app ./
# Build
RUN yarn build
# Prune Dependencies
RUN --mount=type=cache,id=builder-yarn-local-cache,target=/usr/local/share/.cache/yarn \
    # Purge dev deps
    yarn install \
    # Use yarn.lock
    --frozen-lockfile \
    # Dont look for yarnrc
    --no-default-rc \
    # All dependencies
    --production=true \
    # Delete old dependencies
    --force \
    # Check cache first
    --prefer-offline

FROM runtime_base
WORKDIR /usr/app
# Copy Dependencies
COPY --from=production /usr/app/node_modules ./node_modules
COPY --from=production /usr/app/build ./build
# Git Info
ARG GIT_COMMIT_SHA
ENV GIT_COMMIT_SHA $GIT_COMMIT_SHA
ARG GIT_COMMIT_AUTHOR
ENV GIT_COMMIT_AUTHOR $GIT_COMMIT_AUTHOR
ARG GIT_COMMIT_DATE
ENV GIT_COMMIT_DATE $GIT_COMMIT_DATE
ARG GIT_COMMIT_TITLE
ENV GIT_COMMIT_TITLE $GIT_COMMIT_TITLE
# Execute Service
CMD node ./build/src/entrypoint.js
