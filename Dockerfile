# Используем образ Bun
FROM oven/bun:latest

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем зависимости 
COPY package.json .
COPY tsconfig.json .
COPY bun.lockb .
COPY src/ ./src/
COPY index.ts .

#RUN ls



RUN bun install 
# Копируем файлы проекта
#RUN  bun build index.ts --outfile server.js


# Открываем порт 3000 для доступа
EXPOSE 3000

# Запускаем сервер
# todo убрать исходники

# env переменные окружения для конфигурации базы данных
ENV DBPATH=/db
CMD ["bun", "run", "index.ts"]