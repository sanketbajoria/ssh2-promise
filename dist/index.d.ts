import SSHConstants from './sshConstants';
import SSHUtils from './sshUtils';
import SFTP from './sftp';
import BaseSSH2Promise from './BaseSSH2Promise';
import TunnelConfig from './TunnelConfig';
declare class SSH2Promise extends BaseSSH2Promise {
    /**
 * For caching SSH Connection
 */
    static __cache: any;
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
    close(): Promise<{}>;
}
export { SSH2Promise, SSHUtils, SSHConstants, TunnelConfig };
