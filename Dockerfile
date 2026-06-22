# Use Node.js 20
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Build the NestJS app
RUN npm run build

# Expose port
EXPOSE 10000

# Start the app
CMD ["npm", "run", "start:prod"]
