
import { createServer, Server } from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';
import { Message } from './model/message.model';
import { User } from './model/user.model';

export class UserServer {
    public static readonly PORT: number = 8080;
    private app: express.Application;
    private server: Server;
    private io: SocketIO.Server;
    private port: string | number;
    private users: { [socketId: string]: User } = {};

    constructor() {
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.listen();
    }

    private createApp(): void {
        this.app = express();
    }

    private createServer(): void {
        this.server = createServer(this.app);
    }

    private config(): void {
        this.port = process.env.PORT || UserServer.PORT;
    }

    private sockets(): void {
        this.io = socketIo(this.server);
    }

    private listen(): void {
        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });

        this.io.on('connect', (socket: any) => {
            console.log('Connected client on port %s.', this.port);
            socket.on('user', (u: User) => {
                console.log('[server](new user): %s', JSON.stringify(u));
                this.users[socket.id] = u;
                this.io.emit('users', Object.keys(this.users).map(k => this.users[k]));
            });

            socket.on('message', (m: Message) => {
                console.log('[server](message): %s', JSON.stringify(m));
                this.io.emit('message', m);
            });

            socket.on('disconnect', () => {
                delete this.users[socket.id];
                this.io.emit('users', Object.keys(this.users).map(k => this.users[k]));
                console.log('Client disconnected');
            });
        });
    }

    public getApp(): express.Application {
        return this.app;
    }
}
