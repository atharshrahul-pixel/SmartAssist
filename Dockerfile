# Use Node.js LTS
FROM node:20-slim

# Install system dependencies
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    ffmpeg \
    libgomp1

# Create and change to the app directory
WORKDIR /usr/src/app

# Change ownership of WORKDIR to node user
RUN chown -R node:node /usr/src/app

# Switch to non-root user
USER node

# Copy package files and install dependencies
COPY --chown=node:node package*.json ./
RUN --mount=type=cache,target=/home/node/.npm,uid=1000,gid=1000 \
    npm install --production

# Create python virtual environment and install openai-whisper
RUN --mount=type=cache,target=/home/node/.cache/pip,uid=1000,gid=1000 \
    python3 -m venv venv && \
    ./venv/bin/pip install openai-whisper

# Copy the rest of the application code
COPY --chown=node:node . .

# Set PORT to 7860 to match HF Spaces default
ENV PORT=7860
EXPOSE 7860

# Start the server
CMD [ "node", "server.js" ]
