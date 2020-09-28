import { Player } from "./player";
import { WikiUser } from "../entities/WikiUser";
const request = require('request');

export class Game {
    
    private players: Player[] = [];
    public maxPlayers: number;
    public id: string;
    public startPage: string;
    public endPage: string;

    constructor(id: string, user: WikiUser, maxPlayers: number) {
        this.id = id;
        this.maxPlayers = maxPlayers;
        this.reloadObjectives();
    }

    public join(player: Player): boolean {
        if (this.players.length === this.maxPlayers) return false;
        this.players.push(player);
        player.currentGame = this;
        player.publicInfo.pageCount = 0;
        player.publicInfo.pagesPath = [];
        this.updatePlayer(player);
        this.sendObjectives(player);
        console.log(player.user.username + " joined the game with id " + this.id + " (" + this.players.length + "/" + this.maxPlayers + ")");
        return true;
    }

    public leave(player: Player): boolean {
        for (let i = 0; i < this.players.length; ++i) {
            if (this.players[i] === player) {
                player.currentGame = null;
                delete this.players[i];
                console.log(player.user.username + " left the game with id " + this.id + " (" + this.players.length + "/" + this.maxPlayers + ")");
                return true;
            }
        }
        return false;
    }

    public isDead(): boolean {
        return this.players.length === 0;
    }

    public updatePlayer(player: Player): void {
        for (var i in this.players) {
            this.players[i].socket.emit('update player', player.publicInfo);
        }
    }

    public playerNewPage(player: Player, page: string): void {
        player.publicInfo.pageCount++;
        player.publicInfo.pagesPath.push(page);
        player.publicInfo.page = page;
        this.updatePlayer(player);
        if (player.publicInfo.page === this.endPage) {
            this.gameEnd(player);
        }
    }

    public sendObjectives(player: Player): void {
        player.socket.emit('objectives', { "begin": this.startPage, "end": this.endPage });
    }

    public reloadObjectives(): void {
        const url = 'https://fr.wikipedia.org/w/api.php?action=query&list=random&format=json&rnnamespace=0&rnlimit=2&origin=*';

        request.get({
            url: url,
            json: true,
            headers: {'User-Agent': 'request'}
        }, (err: any, res: any, data: any) => {
            if (err) {
              console.log('Error:', err);
            } else if (res.statusCode !== 200) {
              console.log('Status:', res.statusCode);
            } else {
                this.startPage = data.query.random[0].title;
                this.endPage = data.query.random[1].title;
                for (var i in this.players) {
                    this.players[i].publicInfo.pageCount = 0;
                    this.players[i].publicInfo.pagesPath = [];
                    this.sendObjectives(this.players[i]);
                    this.updatePlayer(this.players[i]);
                }
            }
        });
    }

    public gameEnd(winner: Player): void {
        let results = [];
        for (var i in this.players) {
            results.push(this.players[i].generateResults(this.players[i] == winner));
        }
        for (var i in this.players) {
            this.players[i].socket.emit('game end', results);
        }
    }
}