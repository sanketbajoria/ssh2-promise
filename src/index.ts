import { EventEmitter } from "events";
import SSHConnection from './sshConnection';
import SSHConstants from './sshConstants';
import SSHUtils from './sshUtils';
import SFTP from './sftp';
import BaseSSH2Promise from './BaseSSH2Promise';

function isRegistered(sshConnection: SSHConnection, sshTunnel: SSH2Promise) {
    return sshTunnel.deregister.filter((i) => {
        return i.sshConnection.config.uniqueId === sshConnection.config.uniqueId;
    }).length > 0;
}

function register(sshConnection: SSHConnection, sshTunnel: SSH2Promise, isLast: boolean) {
    var events = [SSHConstants.CHANNEL.SSH, SSHConstants.CHANNEL.TUNNEL];
    sshConnection.__sshTunnels = sshConnection.__sshTunnels || [];
    sshConnection.__sshTunnels.push(sshTunnel);

    var cbs = events.map((event) => {
        var cb = (function () {
            this.emit.apply(this, arguments);
        }).bind(sshTunnel, event);
        sshConnection.on(event, cb);
        return cb;
    });


    var disconnectEvent = `${SSHConstants.CHANNEL.SSH}:${SSHConstants.STATUS.DISCONNECT}`;
    var disconnectCb = () => {
        var del;
        for (var i = 0; i < sshTunnel.config.length; i++) {
            if (sshTunnel.config[i].uniqueId === sshConnection.config.uniqueId) {
                del = true;
            }
            if (del && SSH2Promise.__cache[sshTunnel.config[i].uniqueId]) {
                SSH2Promise.__cache[sshTunnel.config[i].uniqueId].close();
                delete SSH2Promise.__cache[sshTunnel.config[i].uniqueId];
            }
        }
    };
    events.push(disconnectEvent);
    cbs.push(disconnectCb);
    sshConnection.on(disconnectEvent, disconnectCb);

    if (isLast) {
        var continueEvent = `${SSHConstants.CHANNEL.SSH}:${SSHConstants.STATUS.CONTINUE}`;
        var continueCb = () => {
            sshTunnel.emit.apply(sshTunnel, arguments);
        };
        events.push(continueEvent);
        cbs.push(continueCb);
        sshConnection.on(continueEvent, continueCb);
    }

    return {
        sshConnection: sshConnection,
        events: events,
        close: function () {
            var idx = sshConnection.__sshTunnels.indexOf(sshTunnel);
            sshConnection.__sshTunnels.splice(idx, 1);
            if (sshConnection.__sshTunnels.length > 0) {
                events.forEach((event, idx) => {
                    sshConnection.removeListener(event, cbs[idx]);
                });
                Promise.resolve();
            } else {
                if(sshConnection.config.sock){
                    sshConnection.config.sock.kill();
                }
                return sshConnection.close().then(() => {
                    events.forEach((event, idx) => {
                        sshConnection.removeListener(event, cbs[idx]);
                    });
                });
            }
        }
    }
}

var methods = ['exec', 'spawn', {'rawSFTP':'sftp'}, 'shell', 'subsys', 'x11', 'getSocksPort', 'getTunnel', 'addTunnel', 'closeTunnel']

var defaultOptions = {
    reconnect: true,
    port: 22,
    reconnectTries: 10,
    reconnectDelay: 5000
};


class SSH2Promise extends BaseSSH2Promise {

    /**
 * For caching SSH Connection
 */
    static __cache: any = {};
    static SSH = SSHConnection;
    static Utils = SSHUtils;
    static SFTP = SFTP;
    static Constants = SSHConstants;

    rawSFTP: () => Promise<any>;
    config: any;
    deregister: Array<any>;
    disableCache: boolean;

    constructor(options: any, disableCache?: boolean) {
        super();
        options = Array.isArray(options) ? options : [options];
        this.config = options.map((o: any) => {
            o = Object.assign({}, defaultOptions, o);
            o.uniqueId = o.uniqueId || `${o.username}@${o.host}:${o.port}`;
            return o;
        });
        this.deregister = [];
        this.disableCache = disableCache || false;
        methods.forEach((m: any) => {
            var k = typeof m == "string"?m:Object.keys(m)[0];
            (this as any)[k] = function () {
                var params = arguments;
                return this.connect().then((sshConnection: SSHConnection) => {
                    return sshConnection[typeof m == "string"?m:m[k]].apply(sshConnection, params);
                });
            }.bind(this);
        });
    }

    /**
     * Get SFTP session, with promise and async/await
     */
    sftp(): SFTP {
        return new SFTP(this);
    }

    emit(event: string | symbol, ...args: any[]): boolean {
        var config = SSHUtils.peek(this.config);
        if (config.debug) {
            config.debug(arguments);
        }
        return super.emit.apply(this, arguments);
    }

    /**
     * Get SSH if existing from cache otherwise create new one
     * @param {*} sshConfig 
     */
    getSSHConnection(sshConfig: any, isLast: boolean) {
        var ret;
        if (this.disableCache) {
            ret = new SSHConnection(sshConfig);
        } else {
            if (sshConfig && !SSH2Promise.__cache[sshConfig.uniqueId]) {
                ret = SSH2Promise.__cache[sshConfig.uniqueId] = new SSHConnection(sshConfig);
            }
            ret = SSH2Promise.__cache[sshConfig.uniqueId];
        }
        if (!isRegistered(ret, this)) {
            this.deregister.push(register(ret, this, isLast));
        }
        return ret.connect().then((ssh: SSHConnection) => {
            ssh.emit(SSHConstants.CHANNEL.SSH, SSHConstants.STATUS.CONNECT);
            return ssh;
        });
    }

    /**
     * Connect SSH connection, via single or multiple hopping connection
     * @param {*} Single/Array of sshConfigs 
     */
    connect() {
        var lastSSH;
        for (var i = 0; i < this.config.length; i++) {
            ((sshConfig, isLast) => {
                if (!lastSSH) {
                    lastSSH = this.getSSHConnection(sshConfig, isLast);
                } else {
                    lastSSH = lastSSH.then((ssh: SSHConnection) => {
                        return ssh.spawn(`nc ${sshConfig.host} ${sshConfig.port}`);
                    }).then((stream: any) => {
                        sshConfig.sock = stream;
                        return this.getSSHConnection(sshConfig, isLast);
                    });
                }
            })(this.config[i], i == this.config.length - 1);
        }
        return lastSSH;
    }

    /**
     * Close SSH Connection
     */
    close() {
        return Promise.all(this.deregister.map(f => f.close()));
    }

}

export = SSH2Promise;
