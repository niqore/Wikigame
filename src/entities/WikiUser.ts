import { Entity, PrimaryKey, Property } from "mikro-orm";
import { Player } from "../core/player";

@Entity()
export class WikiUser {

    private player: Player;

    @PrimaryKey()
    username!: string;

    @Property()
    passwordHash!: string

    @Property()
    gamesWon!: number

    @Property()
    authToken!: string

    public getPlayer(): Player {
        if (this.player == null) this.player = new Player(this);
        return this.player;
    }

    constructor(username: string, passwordHash: string) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.gamesWon = 0;
    }
}