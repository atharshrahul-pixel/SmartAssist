# Use Node.js LTS
FROM node:20-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Create and change to the app directory
WORKDIR /usr/src/app

# Change ownership of WORKDIR to node user
RUN chown -R node:node /usr/src/app

# Switch to non-root user
USER node

# Copy package files and install dependencies
COPY --chown=node:node package*.json ./
RUN npm install --production

# Create python virtual environment and install openai-whisper
RUN python3 -m venv venv && \
    ./venv/bin/pip install --no-cache-dir openai-whisper

# Copy the rest of the application code
COPY --chown=node:node . .

# Set PORT to 7860 to match HF Spaces default
ENV PORT=7860
EXPOSE 7860

# Start the server
CMD [ "node", "server.js" ]
