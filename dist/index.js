"use strict";
const sshConnection_1 = require("./sshConnection");
const sshConstants_1 = require("./sshConstants");
const sshUtils_1 = require("./sshUtils");
const sftp_1 = require("./sftp");
const BaseSSH2Promise_1 = require("./BaseSSH2Promise");
function isRegistered(sshConnection, sshTunnel) {
    return sshTunnel.deregister.filter((i) => {
        return i.sshConnection.config.uniqueId === sshConnection.config.uniqueId;
    }).length > 0;
}
function register(sshConnection, sshTunnel, isLast) {
    var events = [sshConstants_1.default.CHANNEL.SSH, sshConstants_1.default.CHANNEL.TUNNEL];
    sshConnection.__sshTunnels = sshConnection.__sshTunnels || [];
    sshConnection.__sshTunnels.push(sshTunnel);
    var cbs = events.map((event) => {
        var cb = (function () {
            this.emit.apply(this, arguments);
        }).bind(sshTunnel, event);
        sshConnection.on(event, cb);
        return cb;
    });
    var disconnectEvent = `${sshConstants_1.default.CHANNEL.SSH}:${sshConstants_1.default.STATUS.DISCONNECT}`;
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
        var continueEvent = `${sshConstants_1.default.CHANNEL.SSH}:${sshConstants_1.default.STATUS.CONTINUE}`;
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
            }
            else {
                if (sshConnection.config.sock) {
                    sshConnection.config.sock.kill();
                }
                return sshConnection.close().then(() => {
                    events.forEach((event, idx) => {
                        sshConnection.removeListener(event, cbs[idx]);
                    });
                });
            }
        }
    };
}
var methods = ['exec', 'spawn', { 'rawSFTP': 'sftp' }, 'shell', 'subsys', 'x11', 'getSocksPort', 'getTunnel', 'addTunnel', 'closeTunnel'];
var defaultOptions = {
    reconnect: true,
    port: 22,
    reconnectTries: 10,
    reconnectDelay: 5000
};
class SSH2Promise extends BaseSSH2Promise_1.default {
    constructor(options, disableCache) {
        super();
        options = Array.isArray(options) ? options : [options];
        this.config = options.map((o) => {
            o = Object.assign({}, defaultOptions, o);
            o.uniqueId = o.uniqueId || `${o.username}@${o.host}:${o.port}`;
            return o;
        });
        this.deregister = [];
        this.disableCache = disableCache || false;
        methods.forEach((m) => {
            var k = typeof m == "string" ? m : Object.keys(m)[0];
            this[k] = function () {
                var params = arguments;
                return this.connect().then((sshConnection) => {
                    return sshConnection[typeof m == "string" ? m : m[k]].apply(sshConnection, params);
                });
            }.bind(this);
        });
    }
    /**
     * Get SFTP session, with promise and async/await
     */
    sftp() {
        return new sftp_1.default(this);
    }
    emit(event, ...args) {
        var config = sshUtils_1.default.peek(this.config);
        if (config.debug) {
            config.debug(arguments);
        }
        return super.emit.apply(this, arguments);
    }
    /**
     * Get SSH if existing from cache otherwise create new one
     * @param {*} sshConfig
     */
    getSSHConnection(sshConfig, isLast) {
        var ret;
        if (this.disableCache) {
            ret = new sshConnection_1.default(sshConfig);
        }
        else {
            if (sshConfig && !SSH2Promise.__cache[sshConfig.uniqueId]) {
                ret = SSH2Promise.__cache[sshConfig.uniqueId] = new sshConnection_1.default(sshConfig);
            }
            ret = SSH2Promise.__cache[sshConfig.uniqueId];
        }
        if (!isRegistered(ret, this)) {
            this.deregister.push(register(ret, this, isLast));
        }
        return ret.connect().then((ssh) => {
            ssh.emit(sshConstants_1.default.CHANNEL.SSH, sshConstants_1.default.STATUS.CONNECT);
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
                }
                else {
                    lastSSH = lastSSH.then((ssh) => {
                        return ssh.spawn(`nc ${sshConfig.host} ${sshConfig.port}`);
                    }).then((stream) => {
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
/**
* For caching SSH Connection
*/
SSH2Promise.__cache = {};
SSH2Promise.SSH = sshConnection_1.default;
SSH2Promise.Utils = sshUtils_1.default;
SSH2Promise.SFTP = sftp_1.default;
SSH2Promise.Constants = sshConstants_1.default;
module.exports = SSH2Promise;
