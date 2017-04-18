/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2017 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import * as cp from 'child_process';
import { StreamMessageReader, StreamMessageWriter } from "vscode-jsonrpc";
import { IConnection, createConnection } from "./connection";

export function createServerProcess(serverName: string, command: string, args?: string[]): IConnection {
    const serverProcess = cp.spawn(command, args);
    serverProcess.on('error', error =>
        console.error(`Launching ${serverName} Server failed: ${error}`)
    );
    serverProcess.stderr.on('data', data =>
        console.error(`${serverName} Server: ${data}`)
    );
    const reader = new StreamMessageReader(serverProcess.stdout);
    const writer = new StreamMessageWriter(serverProcess.stdin);
    return createConnection(reader, writer, () => serverProcess.kill());
}
