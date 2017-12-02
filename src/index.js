const EventEmitter = require('events'),
    SSHConnection = require('./sshConnection'),
    SSHConstants = require('./sshConstants'),
    SSHUtils = require('./sshUtils');

function register(sshConnection, sshTunnel) {
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
    sshConnection.on(`${SSHConstants.CHANNEL.SSH}:${SSHConstants.STATUS.DISCONNECT}`, () => {
        var del;
        for(var i=0; i<sshTunnel.config.length; i++){
            if(sshTunnel.config[i].uniqueId === sshConnection.uniqueId){
                del = true;
            }
            if(del){
                SSH2Promise.__cache[sshTunnel.config[i].uniqueId].close();
                delete SSH2Promise.__cache[sshTunnel.config[i].uniqueId];
            }
        }
    });
    return {
        sshConnection: sshConnection,
        events: events,
        close: function () {
            var idx = sshConnection.__sshTunnels.indexOf(sshTunnel);
            sshConnection.__sshTunnels.splice(idx, 1);
            if(sshConnection.__sshTunnels.length>0){
                events.forEach((event, idx) => {
                    sshConnection.removeListener(event, cbs[idx]);
                });
            }else{
                sshConnection.close().then(() => {
                    events.forEach((event, idx) => {
                        sshConnection.removeListener(event, cbs[idx]);
                    });
                });    
            }
        }
    }
}

var methods = ['exec', 'spawn', 'sftp', 'shell', 'getSocksPort', 'getTunnel', 'addTunnel', 'closeTunnel']

class SSH2Promise extends EventEmitter {

    constructor(options, disableCache) {
        super();
        options = Array.isArray(options) ? options : [options];
        this.config = options.map(o => {
            o.uniqueId = o.uniqueId || `${o.username}@${o.host}`;
            return o;
        });
        this.deregister = [];
        this.disableCache = disableCache;
        this.__sshConnection = null;
        methods.forEach((m) => {
            this[m] = function(){
                var params = arguments;
                return this.connect().then((sshConnection) => {
                    return sshConnection[m].apply(sshConnection, params);
                });
            }.bind(this);
        });
    }

    emit(){
        super.emit.apply(this, arguments);
        var config = SSHUtils.peek(this.config);
        if(config.debug){
            config.debug(arguments);
        }
    }

    /**
     * Get SSH if existing from cache otherwise create new one
     * @param {*} sshConfig 
     */
    getSSHConnection(sshConfig) {
        var ret;
        if (this.disableCache) {
            ret = new SSHConnection(sshConfig);
        } else {
            if (sshConfig && !SSH2Promise.__cache[sshConfig.uniqueId]) {
                ret = SSH2Promise.__cache[sshConfig.uniqueId] = new SSHConnection(sshConfig);
            }
            ret = SSH2Promise.__cache[sshConfig.uniqueId];
        }
        this.deregister.push(register(ret, this));
        return ret.connect().then((ssh) => {
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
            ((sshConfig) => {
                if (!lastSSH) {
                    lastSSH = this.getSSHConnection(sshConfig);
                } else {
                    lastSSH = lastSSH.then((ssh) => {
                        return ssh.spawnCmd(`nc ${sshConfig.host} ${sshConfig.port}`);
                    }).then((stream) => {
                        sshConfig.sock = stream;
                        return this.getSSHConnection(sshConfig);
                    });
                }
            })(this.config[i]);
        }
        return lastSSH;
    }

    /**
     * Close SSH Connection
     */
    close() {
        this.deregister.forEach(f => f.close());
    }

}

/**
 * For caching SSH Connection
 */
SSH2Promise.__cache = {};

module.exports = SSH2Promise;
