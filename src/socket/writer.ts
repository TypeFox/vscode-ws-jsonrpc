/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2017 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import { AbstractStreamMessageWriter } from "../stream";
import { IWebSocket } from "./socket";

export class WebSocketMessageWriter extends AbstractStreamMessageWriter {

    constructor(protected readonly socket: IWebSocket) {
        super();
    }

    protected send(content: string): void {
        try {
            this.socket.send(content);
        } catch (e) {
            this.fireError(e);
        }
    }

}
