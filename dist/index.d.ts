import SSHConnection from './sshConnection';
import SFTP from './sftp';
import BaseSSH2Promise from './BaseSSH2Promise';
declare class SSH2Promise extends BaseSSH2Promise {
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
    rawSFTP: () => Promise<any>;
    config: any;
    deregister: Array<any>;
    disableCache: boolean;
    constructor(options: any, disableCache?: boolean);
    /**
     * Get SFTP session, with promise and async/await
     */
    sftp(): SFTP;
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
