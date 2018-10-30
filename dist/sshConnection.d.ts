/// <reference types="node" />
import { EventEmitter } from 'events';
import SSH2Promise = require('./index');
import { TunnelConfig } from './TunnelConfig';
export default class SSHConnection extends EventEmitter {
    __sshTunnels: Array<SSH2Promise>;
    config: any;
    [index: string]: any;
    private activeTunnels;
    private __$connectPromise;
    private __retries;
    private __err;
    private __sftp;
    private __x11;
    private sshConnection;
    constructor(options: any);
    /**
      * Emit message on this channel
      * @param {*} channel
      * @param {*} status
      * @param {*} ssh
      * @param {*} payload
      */
    emit(channel: string, status: string, payload?: any): boolean;
    /**
     * Get shell socket
     */
    shell(options?: any): Promise<any>;
    /**
     * Get a sftp session
     */
    sftp(createNew: boolean): Promise<any>;
    /**
     * Get a subsys
     */
    subsys(cmd: string): Promise<any>;
    /**
     * Spawn a command
     */
    spawn(cmd: string, params?: Array<string>, options?: any): Promise<any>;
    /**
     * Exec a command
     */
    exec(cmd: string, params?: Array<string>, options?: any): Promise<any>;
    /**
     * Get a Socks Port
     */
    getSocksPort(localPort: number): Promise<number>;
    /**
     * Get a X11 port
     */
    x11(cmd: string): Promise<any>;
    /**
     * Close SSH Connection
     */
    close(): Promise<any>;
    /**
     * Connect the SSH Connection
     */
    connect(c?: any): Promise<any>;
    /**
     * Get existing tunnel by name
     */
    getTunnel(name: string): any;
    /**
     * Add new tunnel if not exist
     */
    addTunnel(tunnelConfig: TunnelConfig): Promise<any>;
    /**
     * Close the tunnel
     */
    closeTunnel(name?: string): Promise<any>;
}
