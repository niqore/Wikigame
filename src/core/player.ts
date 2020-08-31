import { WikiUser } from "../entities/WikiUser";
import { Game } from "./game";

export class Player {
    
    public user: WikiUser;
    public currentGame: Game = null;
    public socket: SocketIO.Socket = null;

    public publicInfo: { pageCount: number, pagesPath: string[], pseudo: string, page: string } = {
        pageCount: 0,
        pagesPath: [],
        pseudo: 'Unknown user',
        page: '?'
    };

    constructor(user: WikiUser) {
        this.user = user;
        this.publicInfo.pseudo = user.username;
    }
};