# Use Node.js LTS
FROM node:20-slim

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application code
COPY . .

# We can set PORT to 7860 to match HF Spaces default
ENV PORT=7860
EXPOSE 7860

# Start the server
CMD [ "node", "server.js" ]
