#!/bin/bash

# Export API and WebSocket URLs
export api_url="https://pp-cga.mc-otc.de"
export ws_url="wss://pp-cga.mc-otc.de"
# LOCAL API and WebSocket URLs
#export api_url="http://192.168.178.127:8070"
#export ws_url="ws://192.168.178.127:8070"

# Create a guest user and extract JWT
client=$(curl -s -X POST api_url + "$api_url/user/guest" -H 'accept: application/json' -d '')
client_jwt=$(echo "$client" | grep -o '"jwt_token":"[^"]*"' | sed 's/"jwt_token":"//;s/"//')

echo "Client JWT: $client_jwt"

echo "Input game_id into console:"
read game_id

# Print actions to send to WebSocket (for copying, see also https://github.com/phillipc0/PP-CGA-BE/blob/master/docs/)
echo 'Actions (for copying):'
echo '{"action": "join"}'
echo '{"action": "ready", "ready": true}'

# Open WebSocket connection
npx wscat --connect $ws_url/game/ws/$game_id?token=$client_jwt

