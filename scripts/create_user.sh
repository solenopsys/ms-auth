#!/bin/bash

# Проверка наличия всех аргументов
if [ "$#" -lt 3 ]; then
    echo "Usage: $0 <email> <secret> <root_secret>"
    exit 1
fi

PORT=80
CLIENT_ID=$1
CLIENT_SECRET=$2
ROOT_SECRET=$3
PERMISSIONS='["file:publish","npm:publish"]'

# Выполнение curl запроса
response=$(curl -s -X POST "http://auth.solenopsys.org:${PORT}/auth/register/root" \
  -H "Content-Type: application/json" \
  -d "{
    \"client_id\": \"${CLIENT_ID}\",
    \"client_secret\": \"${CLIENT_SECRET}\",
    \"root_secret\": \"${ROOT_SECRET}\",
    \"permissions\": ${PERMISSIONS}
  }" \
  -w "\nStatus code: %{http_code}")

# Вывод результата
echo "$response"

# Проверка статуса
if [[ $response == *"Status code: 200"* ]]; then
    echo "Registration successful!"
else
    echo "Registration failed!"
    exit 1
fi