import { MikroORM } from "mikro-orm";
import { Global } from "./global";
import { WikiUser } from "./entities/WikiUser";
import { SocketManager } from "./core/socketmanager";

var express = require('express');
var app = express();
var http = require('http').createServer(app);
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var io = require('socket.io')(http);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/res', express.static(path.join(__dirname, '../res')));
app.set('views', __dirname + '/../src/views');
app.set('view engine', 'ejs');

app.get('/', async function (req: any, res: any) {
    let user = await Global.connectionManager.getWikiUserByToken(req.cookies['token']);
    if (user !== null) {
        if (Global.gameManager.inGame(user)) {
            res.sendFile('game.html', { 'root': __dirname + '/../src/pages/' });
        }
        else {
            res.redirect('/join')
        }
    }
    else {
        res.redirect('/connection');
    }
});

app.post('/connection', async function (req: any, res: any) {
    let user : WikiUser;
    if ((user = await Global.connectionManager.verifyConnection(req.body.login, req.body.password)) !== null) {
        Global.connectionManager.setTokenCookie(user, res);
        res.redirect('/');
    }
    else {
        res.redirect('/connection?error=1');
    }
});

app.get('/connection', async function (req: any, res: any) {
    if (await Global.connectionManager.getWikiUserByToken(req.cookies['token']) !== null) {
        res.redirect('/');
    }
    else {
        res.sendFile('connection.html', { 'root': __dirname + '/../src/pages/' });
    }
});

app.post('/register', async function (req: any, res: any) {
    let error = await Global.connectionManager.registerOrError(req.body.login, req.body.password);
    res.type("text/plain");
    if (error === null) {
        Global.connectionManager.setTokenCookie(await Global.connectionManager.getWikiUserByName(req.body.login), res);
        res.end('');
    }
    else {
        res.end(error);
    }
});

app.get('/register', async function (req: any, res: any) {
    if (await Global.connectionManager.getWikiUserByToken(req.cookies['token']) !== null) {
        res.redirect('/');
    }
    else {
        res.sendFile('register.html', { 'root': __dirname + '/../src/pages/' });
    }
});

app.get('/join', async function (req: any, res: any) {
    let user = await Global.connectionManager.getWikiUserByToken(req.cookies['token']);
    if (user !== null) {
        Global.gameManager.forceLeaveGame(user);
        res.render('join', { error: '' });
    }
    else {
        res.redirect('/');
    }
});

app.post('/join', async function (req: any, res: any) {
    let user = await Global.connectionManager.getWikiUserByToken(req.cookies['token']);
    if (user !== null) {
        Global.gameManager.forceLeaveGame(user);
        if (req.body.gameId !== undefined && req.body.gameId !== null) {
            if (Global.gameManager.gameExists(req.body.gameId)) {
                user.getPlayer().currentGame = Global.gameManager.getGame(req.body.gameId);
                res.redirect('/');
            }
            else {
                res.render('join', { error: "La partie n'existe pas" });
            }
        }
        else {
            res.render('join', { error: '' });
        }
    }
    else {
        res.redirect('/');
    }
});

app.post('/creategame', async function (req: any, res: any) {
    let user = await Global.connectionManager.getWikiUserByToken(req.cookies['token']);
    if (user !== null) {
        if (!Global.gameManager.inGame(user)) {
            Global.gameManager.createGame(user);
        }
    }
    res.redirect('/');
});

async function loadDatabase(): Promise<void> {
    Global.orm = await MikroORM.init({
        entitiesDirs: ['../dist/entities'],
        entitiesDirsTs: ['../src/entities'],
        dbName: './dist/database.db',
        type: 'sqlite',
        clientUrl: 'sqlite:./dist/database.db',
        baseDir: __dirname,
    });
}

loadDatabase();

io.on('connection', async function(socket: SocketIO.Socket) {
    Global.socketManager.handleSocket(socket);
});

http.listen(8080, function () {
    console.log('listening on *:8080');
});