FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy server files
COPY . .

# Expose backend port
EXPOSE 5000

# Start backend
CMD ["node", "server.js"]