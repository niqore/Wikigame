import { WikiUser } from "../entities/WikiUser";
import { Global } from "../global";
const bcrypt = require('bcrypt');
const crypto = require('crypto');

export class ConnectionManager {

    public async hashPassword(password: string): Promise<any> {
        return await bcrypt.hash(password, 10);
    }

    public async verifyPassword(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }

    public async registerOrError(login: string, password: string): Promise<string> {

        if (login === undefined || password === undefined || password === null || login === null) {
            return "Veuillez indiquer un nom d'utilisateur et mot de passe";
        }
        if (login.length < 3 || login.length > 16) {
            return "Le nom d'utilisateur doit faire entre 3 et 16 caractères";
        }
        if (!(/^[A-Za-z_\-0-9]*$/.test(login))) {
            return "Le nom d'utilisateur ne doit contenir que des letters, chiffre, underscore ou tiret";
        }
        let user: WikiUser = await Global.orm.em.findOne(WikiUser, { username: login });
        if (user !== null) {
            return "Un utilisateur existe déjà avec ce nom d'utilisateur";
        }
        if (password.length < 6) {
            return "Le mot de passe doit faire plus de 6 caractères";
        }

        user = new WikiUser(login, await this.hashPassword(password));
        user.authToken = this.generateToken();
        await Global.orm.em.persistAndFlush([user]);
        return null;
    }

    public async verifyConnection(username: string, password: string): Promise<WikiUser|null> {
        if (password === undefined || username === undefined || password === null || username === null) {
            return null;
        }
        let user: WikiUser = await Global.orm.em.findOne(WikiUser, { username: username });
        if (user === null) {
            return null;
        }
        if (this.verifyPassword(password, user.passwordHash)) {
            return user;
        }
        return null;
    }

    public generateToken(): string {
        return crypto.randomBytes(64).toString('hex');
    }

    public connect(user: WikiUser): void {
        user.authToken = this.generateToken();
    }

    public async getWikiUserByToken(token: string): Promise<WikiUser> {
        return await Global.orm.em.findOne(WikiUser, { authToken: token });
    }

    public async getWikiUserByName(name: string): Promise<WikiUser> {
        return await Global.orm.em.findOne(WikiUser, { username: name });
    }

    public setTokenCookie(user: WikiUser, res: any): void {
        res.cookie('token', user.authToken, { maxAge: 999999999999, httpOnly: true });
    }
}