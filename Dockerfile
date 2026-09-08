FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit --no-fund

COPY . .

# The browser accesses the API through the host port published by Docker Compose.
ARG VITE_BACKEND_URL=http://localhost:5000/api
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
