# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Chỉ copy file package trước để tối ưu hóa việc cache layer của Docker
COPY package*.json ./

RUN npm install

# Copy toàn bộ mã nguồn backend vào container
COPY . .

# Backend của bạn chạy port 4000 (như trong Dashboard.jsx gọi tới)
EXPOSE 4000

CMD ["npm", "run", "server"] 
# (Lưu ý: Thay "run server" bằng lệnh khởi chạy backend thật của bạn, ví dụ "start" hoặc "node server.js")