FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate

ARG NEXT_PUBLIC_POKEMON_API_URL=https://pokeapi.co/api/v2/pokemon
ENV NEXT_PUBLIC_POKEMON_API_URL=$NEXT_PUBLIC_POKEMON_API_URL

RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production

CMD ["sh", "-c", "npx prisma db push && npm start"]
