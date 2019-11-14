import { EventEmitter } from 'events';
import * as net from 'net';
import * as fs from 'fs';
import SSHConstants from './sshConstants';
import SSHUtils from './sshUtils';
import SSH2Promise = require('./index');
import { Stream } from 'stream';
import { TunnelConfig } from './TunnelConfig';

const SSH2 = require('ssh2'),
    socks = require('@heroku/socksv5');


var defaultOptions = {
    reconnect: true,
    port: 22,
    reconnectTries: 10,
    reconnectDelay: 5000
};

export default class SSHConnection extends EventEmitter {

    __sshTunnels: Array<SSH2Promise>;

    config: any;

    [index:string] : any;

    private activeTunnels:{[index:string]: any} = {};

    private __$connectPromise:Promise<any> = null;

    private __retries:number = 0;

    private __err:any = null;

    private __sftp:any = null;

    private __x11:any = null;

    private sshConnection:any = null;

    constructor(options:any) {
        super();
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
    emit(channel:string, status:string, payload?:any):boolean {
        super.emit(channel, status, this, payload);
        return super.emit(`${channel}:${status}`, this, payload);
    }


    /**
     * Get shell socket
     */
    shell(options?:any): Promise<any> {
        options = options || {};
        return this.connect().then(() => {
            return new Promise((resolve, reject) => {
                this.sshConnection.shell(options, (err:any, stream:any) => {
                    if (err)
                        return reject(err);
                    resolve(stream);
                });
            });
        })
    }

    /**
     * Get a sftp session
     */
    sftp(createNew: boolean): Promise<any> {
        return this.connect().then(() => {
            if (createNew || !this.__sftp) {
                this.__sftp = new Promise((resolve, reject) => {
                    this.sshConnection.sftp((err:any, sftp:any) => {
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
    subsys(cmd:string): Promise<any> {
        return this.connect().then(() => {
            return new Promise((resolve, reject) => {
                this.sshConnection.subsys(cmd, (err:any, stream:any) => {
                    if (err)
                        return reject(err);
                    resolve(stream);
                });
            });
        })
    }

    /**
     * Spawn a command
     */
    spawn(cmd:string, params?:Array<string>, options?:any): Promise<any> {
        options = options || {};
        cmd += (Array.isArray(params) ? (" " + params.join(" ")) : "");
        return this.connect().then(() => {
            return new Promise((resolve, reject) => {
                this.sshConnection.exec(cmd, options, (err:any, stream:any) => {
                    if (err)
                        return reject(err);
                    stream.on('close', function () {
                        //console.log(`Closed stream - ${cmd}`);
                    }).on('finish', function () {
                        //console.log(`Closed stream - ${cmd}`);
                    });
                    stream.kill = function () {
                        SSHUtils.endSocket(stream);
                    }
                    resolve(stream);
                })
            })
        })
    }

    /**
     * Exec a command
     */
    exec(cmd:string, params?:Array<string>, options?:any): Promise<any> {
        options = options || {};
        cmd += (Array.isArray(params) ? (" " + params.join(" ")) : "");
        return this.connect().then(() => {
            return new Promise((resolve, reject) => {
                this.sshConnection.exec(cmd, options, (err:any, stream:any) => {
                    if (err)
                        return reject(err);
                    var buffer = "";
                    stream.on('close', function () {
                        resolve(buffer);
                    }).on('data', function (data:any) {
                        buffer += data;
                    }).stderr.on('data', function (data:any) {
                        reject(data);
                    });
                })
            })
        })
    }

    /**
     * Get a Socks Port
     */
    getSocksPort(localPort:number): Promise<number> {
        return this.addTunnel({ name: "__socksServer", socks: true, localPort: localPort }).then((tunnel) => {
            return tunnel.localPort;
        });
    }

    /**
     * Get a X11 port
     */
    x11(cmd:string): Promise<any> {
        return this.spawn(cmd, null, { x11: true }).then((stream) => {
            this.__x11 = SSHUtils.createDeferredPromise();
            var code = 0;
            stream.on('finish', (err?:any) => {
                if (code !== 0) {
                    this.__x11.reject("X11 forwading not enabled on server");
                    this.emit(SSHConstants.CHANNEL.X11, SSHConstants.STATUS.DISCONNECT, {err: err, msg: "X11 forwading not enabled on server"});
                }
            }).on('exit', (exitcode:number) => {
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
    close(): Promise<any> {
        this.emit(SSHConstants.CHANNEL.SSH, SSHConstants.STATUS.BEFOREDISCONNECT);
        return this.closeTunnel().then(() => {
            if (this.sshConnection){
                this.sshConnection.end();
                this.emit(SSHConstants.CHANNEL.SSH, SSHConstants.STATUS.DISCONNECT);
            }
        });
    }

    /**
     * Connect the SSH Connection
     */
    connect(c?:any): Promise<any> {
        this.config = Object.assign(this.config, c);
        ++this.__retries;

        if (this.__$connectPromise != null)
            return this.__$connectPromise;

        this.__$connectPromise = new Promise((resolve, reject) => {
            this.emit(SSHConstants.CHANNEL.SSH, SSHConstants.STATUS.BEFORECONNECT);
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
            this.sshConnection.on('keyboard-interactive', (name:any, instructions:any, lang:any, prompts:Array<any>, finish:Function) => {
                prompts.forEach((prompt) => {
                    SSHUtils.prompt(prompt.prompt, (password:string) => {
                        finish([password]);
                    })
                });
            }).on('ready', (err:any) => {
                if (err) {
                    this.emit(SSHConstants.CHANNEL.SSH, SSHConstants.STATUS.DISCONNECT, { err: err });
                    this.__$connectPromise = null;
                    return reject(err);
                }
                this.emit(SSHConstants.CHANNEL.SSH, SSHConstants.STATUS.CONNECT);
                this.__retries = 0;
                this.__err = null;
                resolve(this);
            }).on('x11', (info:any, accept:Function, reject:Function) => {
                var xserversock = new net.Socket();
                xserversock.on('connect', () => {
                  var xclientsock = accept();
                  xclientsock.pipe(xserversock).pipe(xclientsock);
                  this.__x11.resolve();
                  this.emit(SSHConstants.CHANNEL.X11, SSHConstants.STATUS.CONNECT);
                }).on('error', (err) => {
                    this.__x11.reject("X Server not running locally.");
                    this.emit(SSHConstants.CHANNEL.X11, SSHConstants.STATUS.DISCONNECT, {err: err, msg: "X Server not running locally."})
                });
                // connects to localhost:0.0 
                xserversock.connect(6000, 'localhost');
            }).on('error', (err:any) => {
                this.emit(SSHConstants.CHANNEL.SSH, SSHConstants.STATUS.DISCONNECT, {err: err});
                this.__err = err;
                //reject(err);
                //this.__$connectPromise = null;
            }).on('continue', () => {
               this.emit(SSHConstants.CHANNEL.SSH, SSHConstants.STATUS.CONTINUE); 
            }).on('close', () => {
                this.emit(SSHConstants.CHANNEL.SSH, SSHConstants.STATUS.DISCONNECT, {err: this.__err});
                if (this.config.reconnect && this.__retries <= this.config.reconnectTries && this.__err != null && this.__err.level != "client-authentication" && this.__err.code != 'ENOTFOUND') {
                    setTimeout(() => {
                        this.__$connectPromise = null;
                        resolve(this.connect());
                    }, this.config.reconnectDelay);
                }else{
                    reject(this.__err);
                }
            }).connect(this.config);
        });
        return this.__$connectPromise;
    }

    /**
     * Get existing tunnel by name
     */
    getTunnel(name:string) {
        return this.activeTunnels[name];
    }

    /**
     * Add new tunnel if not exist
     */
    addTunnel(tunnelConfig: TunnelConfig): Promise<any> {
        tunnelConfig.name = tunnelConfig.name || `${tunnelConfig.remoteAddr}@${tunnelConfig.remotePort}`;
        this.emit(SSHConstants.CHANNEL.TUNNEL, SSHConstants.STATUS.BEFORECONNECT, {tunnelConfig: tunnelConfig});
        if (this.getTunnel(tunnelConfig.name)) {
            this.emit(SSHConstants.CHANNEL.TUNNEL, SSHConstants.STATUS.CONNECT, {tunnelConfig: tunnelConfig});
            return Promise.resolve(this.getTunnel(tunnelConfig.name))
        } else {
            return new Promise((resolve, reject) => {
                var server:any;
                if (tunnelConfig.socks) {
                    server = socks.createServer((info:any, accept:Function, deny:Function) => {
                        this.connect().then(() => {
                            this.sshConnection.forwardOut(info.srcAddr,
                                info.srcPort,
                                info.dstAddr,
                                info.dstPort,
                                (err:any, stream:any) => {
                                    if (err) {
                                        this.emit(SSHConstants.CHANNEL.TUNNEL, SSHConstants.STATUS.DISCONNECT, {tunnelConfig: tunnelConfig, err: err});
                                        return deny();
                                    }
                                    var clientSocket;
                                    if (clientSocket = accept(true)) {
                                        stream.pipe(clientSocket).pipe(stream).on('close', () => {
                                            stream.end();
                                        });
                                    } else if (stream) {
                                        stream.end();
                                    }
                                });
                        });
                    }).useAuth(socks.auth.None());
                } else {
                    server = net.createServer()
                        .on('connection', (socket) => {
                            this.connect().then(() => {
                                this.sshConnection.forwardOut('', 0, tunnelConfig.remoteAddr, tunnelConfig.remotePort, (err:any, stream:any) => {
                                    if (err) {
                                        this.emit(SSHConstants.CHANNEL.TUNNEL, SSHConstants.STATUS.DISCONNECT, {tunnelConfig: tunnelConfig, err: err});
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
                    this.emit(SSHConstants.CHANNEL.TUNNEL, SSHConstants.STATUS.CONNECT, {tunnelConfig: tunnelConfig});
                    resolve(this.activeTunnels[tunnelConfig.name]);
                }).on('error', (err:any) => {
                    this.emit(SSHConstants.CHANNEL.TUNNEL, SSHConstants.STATUS.DISCONNECT, {tunnelConfig: tunnelConfig, err: err});
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
    closeTunnel(name?:string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (name && this.activeTunnels[name]) {
                var tunnel = this.activeTunnels[name];
                this.emit(SSHConstants.CHANNEL.TUNNEL, SSHConstants.STATUS.BEFOREDISCONNECT, {tunnelConfig: tunnel});
                tunnel.server.close(() => {
                    this.emit(SSHConstants.CHANNEL.TUNNEL, SSHConstants.STATUS.DISCONNECT, {tunnelConfig: this.activeTunnels[name]});
                    delete this.activeTunnels[name];
                    resolve();
                });
            } else if (!name) {
                var tunnels = Object.keys(this.activeTunnels).map((key) => this.closeTunnel(key));
                resolve(Promise.all(tunnels));
            }
        });
    }

}
