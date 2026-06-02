# frontend/Dockerfile
# --- Stage 1: Build React App ---
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# --- Stage 2: Serve với Nginx ---
FROM nginx:alpine

# Copy toàn bộ file đã build từ Stage 1 vào thư mục chứa web của Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Mở port 80 của Nginx (Port mặc định cho web)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]