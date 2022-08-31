
export type Player = {
    id: number;
    latency: number;
    name: string;
    money: number;
    lives: number;
    income: number;
    lastping: number;
}

export type AddedPlayer = {
    fieldId: number;
    gameId: string;
    key: string;
}