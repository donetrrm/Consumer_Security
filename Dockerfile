# Usa una imagen de node.js como base
FROM node:18.16.0

# Establece el directorio de trabajo en /app
WORKDIR /app

# Copia los archivos de la aplicación al contenedor
COPY ./Consumer_Security ./

# Instala las dependencias
RUN npm install

# Comando para iniciar la aplicación
CMD ["npm", "start"]
