FROM node:20-slim

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    ffmpeg \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app
RUN chown -R node:node /usr/src/app
USER node

# Dependencies — cached layer, only re-runs if package*.json changes
COPY --chown=node:node package*.json ./
RUN --mount=type=cache,target=/home/node/.npm,uid=1000,gid=1000 \
    npm install --production --no-audit --no-fund

# Python venv + Whisper install + model pre-download (cached unless this layer changes)
RUN --mount=type=cache,target=/home/node/.cache/pip,uid=1000,gid=1000 \
    python3 -m venv venv && \
    ./venv/bin/pip install openai-whisper

# App code — last so code changes don't bust dependency cache
COPY --chown=node:node . .

ENV PORT=7860
EXPOSE 7860

CMD ["node", "server.js"]
