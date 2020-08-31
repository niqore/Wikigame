import { Global } from "../global";
import { Game } from "./game";

var cookie = require('cookie');

export class SocketManager {

    public async handleSocket(socket: SocketIO.Socket): Promise<void> {
        var cookies = cookie.parse(socket.handshake.headers.cookie);
        if (cookies['token'] == undefined) {
            return;
        }
        const user = await Global.connectionManager.getWikiUserByToken(cookies['token']);
        const player = user.getPlayer();
        if (user === null) {
            socket.disconnect();
            return;
        }

        player.socket = socket;
        if (player.currentGame !== null) {
            player.currentGame.join(player);
        }

        socket.on('disconnect', () => {
            Global.gameManager.forceLeaveGame(user);
            player.socket = null;
        });
        socket.on('quitGame', () => {
            socket.disconnect();
        });
        socket.on('update page', function(page) {
            player.currentGame.playerNewPage(player, page);
        });
    }
};