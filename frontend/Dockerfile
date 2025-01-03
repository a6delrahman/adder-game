# 1. Base image for building the app
FROM node:23.5.0 AS builder

# 2. Set working directory in container
WORKDIR /app

# 3. Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install --loglevel verbose

# 4. Copy the app source code and build the production files
COPY . .
RUN npm run build

# 5. Base image for serving static files
FROM nginx:stable-alpine

# 6. Copy the build output to the Nginx HTML directory
COPY --from=builder /app/dist /usr/share/nginx/html

# 7. Copy custom Nginx configuration if needed
# Optional: COPY nginx.conf /etc/nginx/nginx.conf

# 8. Expose port 80
EXPOSE 80

# 9. Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
