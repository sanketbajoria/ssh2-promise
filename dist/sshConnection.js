"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const net = require("net");
const fs = require("fs");
const sshConstants_1 = require("./sshConstants");
const sshUtils_1 = require("./sshUtils");
const SSH2 = require('ssh2'), socks = require('@heroku/socksv5');
var defaultOptions = {
    reconnect: true,
    port: 22,
    reconnectTries: 10,
    reconnectDelay: 5000
};
class SSHConnection extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.activeTunnels = {};
        this.__$connectPromise = null;
        this.__retries = 0;
        this.__err = null;
        this.__sftp = null;
        this.__x11 = null;
        this.sshConnection = null;
        this.config = Object.assign({}, defaultOptions, options);
        this.config.uniqueId = this.config.uniqueId || `${this.config.username}@${this.config.host}`;
    }
    /**
      * Emit message on this channel
      * @param {*} channel
      * @param {*} status
      * @param {*} ssh
      * @param {*} payload
      */
    emit(channel, status, payload) {
        super.emit(channel, status, this, payload);
        return super.emit(`${channel}:${status}`, this, payload);
    }
    /**
     * Get shell socket
     */
    shell(options) {
        options = options || {};
        return this.connect().then(() => {
            return new Promise((resolve, reject) => {
                this.sshConnection.shell(options, (err, stream) => {
                    if (err)
                        return reject(err);
                    resolve(stream);
                });
            });
        });
    }
    /**
     * Get a sftp session
     */
    sftp(createNew) {
        return this.connect().then(() => {
            if (createNew || !this.__sftp) {
                this.__sftp = new Promise((resolve, reject) => {
                    this.sshConnection.sftp((err, sftp) => {
                        if (err)
                            reject(err);
                        resolve(sftp);
                    });
                });
            }
            return this.__sftp;
        });
    }
    /**
     * Get a subsys
     */
    subsys(cmd) {
        return this.connect().then(() => {
            return new Promise((resolve, reject) => {
                this.sshConnection.subsys(cmd, (err, stream) => {
                    if (err)
                        return reject(err);
                    resolve(stream);
                });
            });
        });
    }
    /**
     * Spawn a command
     */
    spawn(cmd, params, options) {
        options = options || {};
        cmd += (Array.isArray(params) ? (" " + params.join(" ")) : "");
        return this.connect().then(() => {
            return new Promise((resolve, reject) => {
                this.sshConnection.exec(cmd, options, (err, stream) => {
                    if (err)
                        return reject(err);
                    stream.on('close', function () {
                        //console.log(`Closed stream - ${cmd}`);
                    }).on('finish', function () {
                        //console.log(`Closed stream - ${cmd}`);
                    });
                    stream.kill = function () {
                        sshUtils_1.default.endSocket(stream);
                    };
                    resolve(stream);
                });
            });
        });
    }
    /**
     * Exec a command
     */
    exec(cmd, params, options) {
        options = options || {};
        cmd += (Array.isArray(params) ? (" " + params.join(" ")) : "");
        return this.connect().then(() => {
            return new Promise((resolve, reject) => {
                this.sshConnection.exec(cmd, options, (err, stream) => {
                    if (err)
                        return reject(err);
                    var buffer = "";
                    stream.on('close', function () {
                        resolve(buffer);
                    }).on('data', function (data) {
                        buffer += data;
                    }).stderr.on('data', function (data) {
                        reject(data);
                    });
                });
            });
        });
    }
    /**
     * Get a Socks Port
     */
    getSocksPort(localPort) {
        return this.addTunnel({ name: "__socksServer", socks: true, localPort: localPort }).then((tunnel) => {
            return tunnel.localPort;
        });
    }
    /**
     * Get a X11 port
     */
    x11(cmd) {
        return this.spawn(cmd, null, { x11: true }).then((stream) => {
            this.__x11 = sshUtils_1.default.createDeferredPromise();
            var code = 0;
            stream.on('finish', (err) => {
                if (code !== 0) {
                    this.__x11.reject("X11 forwading not enabled on server");
                    this.emit(sshConstants_1.default.CHANNEL.X11, sshConstants_1.default.STATUS.DISCONNECT, { err: err, msg: "X11 forwading not enabled on server" });
                }
            }).on('exit', (exitcode) => {
                code = exitcode;
            });
            this.__x11.promise.catch(() => {
                stream.close();
            });
            return this.__x11.promise;
        });
    }
    /**
     * Close SSH Connection
     */
    close() {
        this.emit(sshConstants_1.default.CHANNEL.SSH, sshConstants_1.default.STATUS.BEFOREDISCONNECT);
        return this.closeTunnel().then(() => {
            if (this.sshConnection) {
                this.sshConnection.end();
                this.emit(sshConstants_1.default.CHANNEL.SSH, sshConstants_1.default.STATUS.DISCONNECT);
            }
        });
    }
    /**
     * Connect the SSH Connection
     */
    connect(c) {
        this.config = Object.assign(this.config, c);
        ++this.__retries;
        if (this.__$connectPromise != null)
            return this.__$connectPromise;
        this.__$connectPromise = new Promise((resolve, reject) => {
            this.emit(sshConstants_1.default.CHANNEL.SSH, sshConstants_1.default.STATUS.BEFORECONNECT);
            if (!this.config || typeof this.config === 'function' || !(this.config.host || this.config.sock) || !this.config.username) {
                reject("Invalid SSH connection configuration host/username can't be empty");
                this.__$connectPromise = null;
                return;
            }
            if (this.config.tryKeyboard && !this.config.password && typeof this.config !== 'undefined') {
                delete this.config.password;
            }
            if (this.config.identity) {
                if (fs.existsSync(this.config.identity)) {
                    this.config.privateKey = fs.readFileSync(this.config.identity);
                }
                delete this.config.identity;
            }
            //Start ssh server connection
            this.sshConnection = new SSH2();
            this.sshConnection.on('keyboard-interactive', (name, instructions, lang, prompts, finish) => {
                prompts.forEach((prompt) => {
                    sshUtils_1.default.prompt(prompt.prompt, (password) => {
                        finish([password]);
                    });
                });
            }).on('ready', (err) => {
                if (err) {
                    this.emit(sshConstants_1.default.CHANNEL.SSH, sshConstants_1.default.STATUS.DISCONNECT, { err: err });
                    this.__$connectPromise = null;
                    return reject(err);
                }
                this.emit(sshConstants_1.default.CHANNEL.SSH, sshConstants_1.default.STATUS.CONNECT);
                this.__retries = 0;
                this.__err = null;
                resolve(this);
            }).on('x11', (info, accept, reject) => {
                var xserversock = new net.Socket();
                xserversock.on('connect', () => {
                    var xclientsock = accept();
                    xclientsock.pipe(xserversock).pipe(xclientsock);
                    this.__x11.resolve();
                    this.emit(sshConstants_1.default.CHANNEL.X11, sshConstants_1.default.STATUS.CONNECT);
                }).on('error', (err) => {
                    this.__x11.reject("X Server not running locally.");
                    this.emit(sshConstants_1.default.CHANNEL.X11, sshConstants_1.default.STATUS.DISCONNECT, { err: err, msg: "X Server not running locally." });
                });
                // connects to localhost:0.0 
                xserversock.connect(6000, 'localhost');
            }).on('error', (err) => {
                this.emit(sshConstants_1.default.CHANNEL.SSH, sshConstants_1.default.STATUS.DISCONNECT, { err: err });
                this.__err = err;
                //reject(err);
                //this.__$connectPromise = null;
            }).on('continue', () => {
                this.emit(sshConstants_1.default.CHANNEL.SSH, sshConstants_1.default.STATUS.CONTINUE);
            }).on('close', () => {
                this.emit(sshConstants_1.default.CHANNEL.SSH, sshConstants_1.default.STATUS.DISCONNECT, { err: this.__err });
                if (this.config.reconnect && this.__retries <= this.config.reconnectTries && this.__err != null && this.__err.level != "client-authentication" && this.__err.code != 'ENOTFOUND') {
                    setTimeout(() => {
                        this.__$connectPromise = null;
                        resolve(this.connect());
                    }, this.config.reconnectDelay);
                }
                else {
                    reject(this.__err);
                }
            }).connect(this.config);
        });
        return this.__$connectPromise;
    }
    /**
     * Get existing tunnel by name
     */
    getTunnel(name) {
        return this.activeTunnels[name];
    }
    /**
     * Add new tunnel if not exist
     */
    addTunnel(tunnelConfig) {
        tunnelConfig.name = tunnelConfig.name || `${tunnelConfig.remoteAddr}@${tunnelConfig.remotePort}`;
        this.emit(sshConstants_1.default.CHANNEL.TUNNEL, sshConstants_1.default.STATUS.BEFORECONNECT, { tunnelConfig: tunnelConfig });
        if (this.getTunnel(tunnelConfig.name)) {
            this.emit(sshConstants_1.default.CHANNEL.TUNNEL, sshConstants_1.default.STATUS.CONNECT, { tunnelConfig: tunnelConfig });
            return Promise.resolve(this.getTunnel(tunnelConfig.name));
        }
        else {
            return new Promise((resolve, reject) => {
                var server;
                if (tunnelConfig.socks) {
                    server = socks.createServer((info, accept, deny) => {
                        this.connect().then(() => {
                            this.sshConnection.forwardOut(info.srcAddr, info.srcPort, info.dstAddr, info.dstPort, (err, stream) => {
                                if (err) {
                                    this.emit(sshConstants_1.default.CHANNEL.TUNNEL, sshConstants_1.default.STATUS.DISCONNECT, { tunnelConfig: tunnelConfig, err: err });
                                    return deny();
                                }
                                var clientSocket;
                                if (clientSocket = accept(true)) {
                                    stream.pipe(clientSocket).pipe(stream).on('close', () => {
                                        stream.end();
                                    });
                                }
                                else if (stream) {
                                    stream.end();
                                }
                            });
                        });
                    }).useAuth(socks.auth.None());
                }
                else {
                    server = net.createServer()
                        .on('connection', (socket) => {
                        this.connect().then(() => {
                            this.sshConnection.forwardOut('', 0, tunnelConfig.remoteAddr, tunnelConfig.remotePort, (err, stream) => {
                                if (err) {
                                    this.emit(sshConstants_1.default.CHANNEL.TUNNEL, sshConstants_1.default.STATUS.DISCONNECT, { tunnelConfig: tunnelConfig, err: err });
                                    return err;
                                }
                                stream.pipe(socket).pipe(stream).on('close', () => {
                                    stream.end();
                                });
                            });
                        });
                    });
                }
                tunnelConfig.localPort = tunnelConfig.localPort || 0;
                server.on('listening', () => {
                    tunnelConfig.localPort = server.address().port;
                    this.activeTunnels[tunnelConfig.name] = Object.assign({}, { server: server }, tunnelConfig);
                    this.emit(sshConstants_1.default.CHANNEL.TUNNEL, sshConstants_1.default.STATUS.CONNECT, { tunnelConfig: tunnelConfig });
                    resolve(this.activeTunnels[tunnelConfig.name]);
                }).on('error', (err) => {
                    this.emit(sshConstants_1.default.CHANNEL.TUNNEL, sshConstants_1.default.STATUS.DISCONNECT, { tunnelConfig: tunnelConfig, err: err });
                    server.close();
                    reject(err);
                    delete this.activeTunnels[tunnelConfig.name];
                }).listen(tunnelConfig.localPort);
            });
        }
    }
    /**
     * Close the tunnel
     */
    closeTunnel(name) {
        return new Promise((resolve, reject) => {
            if (name && this.activeTunnels[name]) {
                var tunnel = this.activeTunnels[name];
                this.emit(sshConstants_1.default.CHANNEL.TUNNEL, sshConstants_1.default.STATUS.BEFOREDISCONNECT, { tunnelConfig: tunnel });
                tunnel.server.close(() => {
                    this.emit(sshConstants_1.default.CHANNEL.TUNNEL, sshConstants_1.default.STATUS.DISCONNECT, { tunnelConfig: this.activeTunnels[name] });
                    delete this.activeTunnels[name];
                    resolve();
                });
            }
            else if (!name) {
                var tunnels = Object.keys(this.activeTunnels).map((key) => this.closeTunnel(key));
                resolve(Promise.all(tunnels));
            }
        });
    }
}
exports.default = SSHConnection;
