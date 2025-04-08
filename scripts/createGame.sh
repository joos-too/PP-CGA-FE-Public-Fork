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

# Create a new game and extract Game ID

# MauMau
#game=$(curl -s -X POST "$api_url/game" -H "Authorization: $client_jwt" -H "Content-Type: application/json" -d '{"type": "maumau", "deck_size": 32, "number_of_start_cards": 5, "gamemode":"gamemode_classic"}')
# Lügen
game=$(curl -s -X POST "$api_url/game" -H "Authorization: $client_jwt" -H "Content-Type: application/json" -d '{"type": "l\u00FCgen", "deck_size": 32, "number_of_start_cards": 5, "gamemode":"gamemode_classic"}')
game_code=$(echo "$game" | grep -o '"code":"[^"]*"' | sed 's/"code":"//;s/"//')
game_id=$(echo "$game" | grep -o '"id":"[^"]*"' | sed 's/"id":"//;s/"//')

echo "Game Created: $game"
echo "Game Code: $game_code"
echo "Game ID: $game_id"
echo "Client 1 JWT: $client_jwt"

# Print actions to send to WebSocket (for copying, see also https://github.com/phillipc0/PP-CGA-BE/blob/master/docs/)
echo 'Actions (for copying):'
echo '{"action": "join"}'
echo '{"action": "ready", "ready": true}'

# Open WebSocket connection
npx wscat --connect $ws_url/game/ws/$game_id?token=$client_jwt




