# Use the official Node.js image
FROM node:16

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy app files
COPY . .

# Expose the backend port (e.g., 5000)
EXPOSE 5000

# Run the server
CMD ["node", "server.js"]