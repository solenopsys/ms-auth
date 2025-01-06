#!/bin/bash

# Проверка наличия всех аргументов
if [ "$#" -lt 2 ]; then
   echo "Usage: $0 <client_id> <client_secret>"
   exit 1
fi

PORT=80
CLIENT_ID=$1
CLIENT_SECRET=$2

# Выполнение curl запроса
response=$(curl -s -X POST "http://auth.solenopsys.org:${PORT}/auth/token" \
 -H "Content-Type: application/json" \
 -d "{
   \"client_id\": \"${CLIENT_ID}\",
   \"client_secret\": \"${CLIENT_SECRET}\"
 }" \
 -w "\nStatus code: %{http_code}")

# Вывод результата
echo "$response"

# Проверка статуса
if [[ $response == *"Status code: 200"* ]]; then
   echo "Token generation successful!"
else
   echo "Token generation failed!"
   exit 1
fi