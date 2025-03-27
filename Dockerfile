# Use Bun 1.2.6 as the base image
FROM oven/bun:1.2.6

# Set working directory
WORKDIR /app

# Accept build argument
ARG DESTINY_API_KEY
ENV DESTINY_API_KEY=$DESTINY_API_KEY

# Copy package files
COPY package*.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the application
RUN bun run build

# Expose the port your app runs on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["bun", "run", "start"] 