/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2017 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import { MessageConnection, Logger } from 'vscode-jsonrpc';
import { createSocketConnection, Socket } from './socket';
import { ConsoleLogger } from './logger';

export {
    MessageConnection, Logger
}

export function listen(options: {
    webSocket: WebSocket;
    logger?: Logger;
    onConnection: (connection: MessageConnection) => void;
}) {
    const { webSocket, onConnection } = options;
    const logger = options.logger || new ConsoleLogger();
    webSocket.onopen = () => {
        const socket = toSocket(webSocket);
        const connection = createSocketConnection(socket, logger);
        onConnection(connection);
    };
}

export function toSocket(webSocket: WebSocket): Socket {
    return {
        send: content => webSocket.send(content),
        onMessage: cb => webSocket.onmessage = event => cb(event.data),
        onError: cb => webSocket.onerror = event => {
            if (event instanceof ErrorEvent) {
                cb(event.message)
            }
        },
        onClose: cb => webSocket.onclose = event => cb(event.code, event.reason),
        dispose: () => webSocket.close()
    }
}