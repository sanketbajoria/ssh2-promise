/// <reference types="node" />
import { EventEmitter } from "events";
import SSHConnection from './sshConnection';
import SFTP from './sftp';
declare class SSH2Promise extends EventEmitter {
    /**
 * For caching SSH Connection
 */
    static __cache: any;
    static SSH: typeof SSHConnection;
    static Utils: {
        peek: (arr: any[]) => any;
        endSocket: (socket: any) => void;
        prompt: (question: string, cb: Function) => void;
        createDeferredPromise: () => {
            promise: Promise<{}>;
            resolve: undefined;
            reject: undefined;
        };
    };
    static SFTP: typeof SFTP;
    static Constants: {
        "CHANNEL": {
            SSH: string;
            TUNNEL: string;
            X11: string;
        };
        "STATUS": {
            BEFORECONNECT: string;
            CONNECT: string;
            BEFOREDISCONNECT: string;
            DISCONNECT: string;
            CONTINUE: string;
        };
    };
    sftp: () => Promise<any>;
    config: any;
    deregister: Array<any>;
    disableCache: boolean;
    constructor(options: any, disableCache: boolean);
    emit(event: string | symbol, ...args: any[]): boolean;
    /**
     * Get SSH if existing from cache otherwise create new one
     * @param {*} sshConfig
     */
    getSSHConnection(sshConfig: any, isLast: boolean): any;
    /**
     * Connect SSH connection, via single or multiple hopping connection
     * @param {*} Single/Array of sshConfigs
     */
    connect(): any;
    /**
     * Close SSH Connection
     */
    close(): Promise<any[]>;
}
export = SSH2Promise;
