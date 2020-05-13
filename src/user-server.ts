
import { createServer, Server } from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';
import { Message } from './model/chat.model';
import { User } from './model/users.model';
import { Roll } from './model/dice-table.model';

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

        this.io.on('connect', (socket: socketIo.Socket) => {
            console.log('Connected client on port %s.', this.port);
            socket.on('user', (res: User) => {
                console.log('[server](new user): %s', JSON.stringify(res));
                this.users[socket.id] = res;
                socket.emit('users', Object.keys(this.users).map(k => this.users[k]));
            });

            socket.on('disconnect', () => {
                delete this.users[socket.id];
                this.io.emit('users', Object.keys(this.users).map(k => this.users[k]));
                console.log('Client disconnected');
            });

            socket.on('message', (res: Message) => {
                console.log('[server](message): %s', JSON.stringify(res));
                socket.emit('message', res);
            });

            socket.on('roll', (res: Roll[]) => {
                console.log('Roll data sent '+ res.length + ' entries')
                socket.broadcast.emit('roll', res)
            })
        });
    }

    public getApp(): express.Application {
        return this.app;
    }
}
