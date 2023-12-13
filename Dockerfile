# Etapa 1. Dependencias de desarrollo
FROM node:alpine as dev-deps
WORKDIR /app
# Copiar los archivos de configuración
COPY package.json pnpm-lock.yaml ./
# Instalar dependencias (todas)
RUN npm install -g pnpm
RUN pnpm install



# Etapa 2. Construir build
FROM node:alpine as build
WORKDIR /app
# Copiar los archivos de configuración
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .
RUN npm install -g pnpm
RUN pnpm run build


# Etapa 3. Depenedencias de produccion
FROM node:alpine as prod-deps
ENV NODE_ENV production
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --production 

# Etapa 4. Generar los archivos ssl
#FROM alpine:latest as openssl
#WORKDIR /certs
#RUN apk --no-cache add openssl
#RUN openssl genrsa -passout pass:Prelmo010921 -des3 -out ca.key 4096
#RUN openssl req -passin pass:Prelmo010921 -new -x509 -days 365 -key ca.key -out ca.crt -subj "/C=MX/ST=Puebla/L=Puebla/O=PRELMO/OU=PRELMO/CN=localhost" 
#RUN openssl genrsa -passout pass:Prelmo010921 -des3 -out server.key 4096
#RUN openssl req -passin pass:Prelmo010921 -new -key server.key -out server.csr -subj "/C=MX/ST=Puebla/L=Puebla/O=PRELMO/OU=SERVER/CN=localhost"
#RUN openssl x509 -req -passin pass:Prelmo010921 -days 365 -in server.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out server.crt
#RUN openssl rsa -passin pass:Prelmo010921 -in server.key -out server.key

# Etapa 5 Crear la imagen final ligera
FROM node:alpine as prod
EXPOSE 3000
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
#COPY --from=openssl /certs ./dist/certs
CMD ["node", "dist/main.js"]
