import { User } from "./users.model";

export class Message {
    constructor(private from: User, private content: string) {}
}