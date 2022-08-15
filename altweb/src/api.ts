import { Game } from './data/game';


export async function getGame() {
    try {
        const response = await fetch('http://localhost:8080/game');
        
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const result = (await response.json()) as Game;

        console.log(result);
    } catch (error) {
        console.error(error);
    }
}

export async function joinGame() {
    try {
        const response = await fetch('http://localhost:8080/add_player');
        
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const result = (await response.json()) as Game;

        console.log(result);
    } catch (error) {
        console.error(error);
    }
}