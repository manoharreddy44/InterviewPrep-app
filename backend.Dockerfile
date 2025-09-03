# backend.Dockerfile
FROM node:20.11.0

WORKDIR /app

# Install backend dependencies from root
COPY package*.json ./
RUN npm install

# Copy backend source code
COPY backend/ ./backend/

EXPOSE 5000

CMD ["npm", "run", "dev"]