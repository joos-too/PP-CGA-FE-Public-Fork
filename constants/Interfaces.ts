export interface GameResponse {
    id: string;
    created: string;
    updated: string;
    type: string;
    code: string;
    deck_size: number;
    max_players: number;
    number_of_start_cards: number;
    gamemode: string;
}

export interface PlayerStatus {
    playerName: string,
    playerStatus: boolean,
    playerImg: string
}

interface Card {
    suit: string,
    value: string,
}

export interface MauGameData {
    current_player: string,
    discard_pile: Card,
    draw_pile: number,
    hand: Card[],
    players: { [key: string]: number },
}

export interface LuegenGameData {
    players: { [key: string]: number },
    current_player: string,
    hand: Card[],
    discard_pile_count: number,
    removed_pile: string[],
    round_value: string,
    n_last: number,
    last_player: string,
}