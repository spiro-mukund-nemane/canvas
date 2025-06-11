FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (cache layer)
COPY package*.json ./
RUN npm install

RUN npm i -g serve

# Copy the rest of the project files
COPY . .

RUN --mount=type=secret,id=VITE_PUBLIC_BACKEND_API_URL,env=VITE_PUBLIC_BACKEND_API_URL \
    --mount=type=secret,id=VITE_PUBLIC_BACKEND_API_URL_KEY,env=VITE_PUBLIC_BACKEND_API_KEY \
    --mount=type=secret,id=VITE_SPIRO_MAPS_LIGHT_STYLE_API_URL,env=VITE_SPIRO_MAPS_LIGHT_STYLE_API_URL \
    --mount=type=secret,id=VITE_SPIRO_MAPS_DARK_STYLE_API_URL,env=VITE_SPIRO_MAPS_DARK_STYLE_API_URL \
    --mount=type=secret,id=VITE_SPIRO_MAPS_STYLE_API_KEY,env=VITE_SPIRO_MAPS_STYLE_API_KEY \
    --mount=type=secret,id=VITE_SPIRO_MAPS_DIRECTIONS_API_URL,env=VITE_SPIRO_MAPS_DIRECTIONS_API_URL \
    --mount=type=secret,id=VITE_SPIRO_MAPS_DIRECTIONS_API_KEY,env=VITE_SPIRO_MAPS_DIRECTIONS_API_KEY \
    npm run build

# Expose Vite dev server port
EXPOSE 3000

# Start the Vite dev server

CMD [ "serve", "-s", "dist" ]
# CMD [ "npm","run","preview"]