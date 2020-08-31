import { MikroORM } from "mikro-orm";
import { ConnectionManager } from "./core/connectionmanager";
import { GameManager } from "./core/gamemanager";
import { SocketManager } from "./core/socketmanager";

export namespace Global {
    export var orm: MikroORM;
    export var connectionManager : ConnectionManager = new ConnectionManager();
    export var gameManager : GameManager = new GameManager();
    export var socketManager : SocketManager = new SocketManager();
}