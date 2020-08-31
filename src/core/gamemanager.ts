import { Game } from "./game";
import { WikiUser } from "../entities/WikiUser";

export class GameManager {

    private games = new Map<string, Game>();

    public inGame(user: WikiUser): boolean {
        return user.getPlayer().currentGame != null;
    }

    public gameExists(gameId: string): boolean {
        return this.games.has(gameId);
    }

    public forceLeaveGame(user: WikiUser): boolean {
        const player = user.getPlayer();
        const game = player.currentGame;
        if (game === null) return false;
        const res = game.leave(player);
        if (game.isDead()) {
            this.games.delete(game.id);
            console.log("Game " + game.id + " destroyed");
        }
        return res;
    }

    public createGame(user: WikiUser): Game {
        let id: string;
        do {
            id = Math.random().toString(36).slice(2);
        } while (this.games.has(id));
        console.log("Game " + id + " created by " + user.username);
        const game = new Game(id, user, 8);
        user.getPlayer().currentGame = game;
        this.games.set(id, game);
        return game;
    }

    public getGame(id: string): Game {
        return this.games.get(id);
    }
}