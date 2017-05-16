/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2017 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import { DataCallback } from "vscode-jsonrpc/lib/messageReader";
import { AbstractStreamMessageReader } from "../stream";
import { IWebSocket } from "./socket";

export class WebSocketMessageReader extends AbstractStreamMessageReader {

    protected state: 'initial' | 'listening' | 'closed' = 'initial';
    protected callback: DataCallback | undefined;
    protected readonly events: { message?: any, error?: any }[] = [];

    constructor(protected readonly socket: IWebSocket) {
        super();
        this.socket.onMessage(message =>
            this.readMessage(message)
        );
        this.socket.onError(error =>
            this.fireError(error)
        );
        this.socket.onClose((code, reason) => {
            if (code !== 1000) {
                const error: Error = {
                    name: '' + code,
                    message: `Error during socket reconnect: code = ${code}, reason = ${reason}`
                };
                this.fireError(error);
            }
            this.fireClose();
        });
    }

    listen(callback: DataCallback): void {
        if (this.state === 'initial') {
            if (this.events.length !== 0) {
                const event = this.events.pop()!;
                if (event.message) {
                    super.readMessage(event.message, callback);
                } else if (event.error) {
                    this.fireError(event.error);
                } else {
                    this.fireClose();
                }
            }
            this.callback = callback;
            this.state = 'listening';
        }
    }

    protected readMessage(message: any): void {
        if (this.state === 'initial') {
            this.events.splice(0, 0, { message });
        } else if (this.state === 'listening') {
            super.readMessage(message, this.callback!);
        }
    }

    protected fireError(error: any): void {
        if (this.state === 'initial') {
            this.events.splice(0, 0, { error });
        } else if (this.state === 'listening') {
            super.fireError(error);
        }
    }

    protected fireClose(): void {
        if (this.state === 'initial') {
            this.events.splice(0, 0, {});
        } else if (this.state === 'listening') {
            super.fireClose();
        }
        this.state = 'closed';
    }

}
