

# Etapa 2. Dependencias de desarrollo
FROM node:alpine as dev-deps
WORKDIR /app
# Copiar los archivos de configuración
COPY package.json pnpm-lock.yaml ./
# Instalar dependencias (todas)
RUN npm install -g pnpm
RUN pnpm install



# Etapa 3. Construir build
FROM node:alpine as build
WORKDIR /app
# Copiar los archivos de configuración
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .
RUN npm install -g pnpm
RUN pnpm run build


# Etapa 4. Depenedencias de produccion
FROM node:alpine as prod-deps
ENV NODE_ENV production
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --production 


# Etapa 5 Crear la imagen final ligera
FROM node:alpine as prod
EXPOSE 3000
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
CMD ["node", "dist/main.js"]
