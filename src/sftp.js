const EventEmitter = require('events'),
    SSHConstants = require('./sshConstants');

var stringFlagMap = ['r', 'r+', 'w', 'wx', 'xw', 'w+', 'wx+', 'xw+', 'a', 'ax', 'xa', 'a+', 'ax+', 'xa+'];

var methods = ["fastGet", "fastPut", "open", "close", "readData", "writeData", "fstat", "fsetstat", "futimes", "fchown", "fchmod", "opendir", "readdir", "unlink", "rename", "mkdir", "rmdir", "stat", "lstat", "setstat", "utimes", "chown", "chmod", "readlink", "symlink", "realpath", "ext_openssh_rename", "ext_openssh_statvfs", "ext_openssh_fstatvfs", "ext_openssh_hardlink", "ext_openssh_fsync"];

var enhanceMethods = {"readFile": "readData", "writeFile": "writeData", "getStat": "fstat", "setStat": "fsetstat", "changeTimestamp": "futimes", "changeOwner": "fchown", "changeMode": "fchmod"};

class SFTP extends EventEmitter {
    constructor(ssh) {
        super();
        this.ssh = ssh;
        var __resolve = null;
        var $ready = Promise.resolve();
        this.ssh.on(`${SSHConstants.CHANNEL.SSH}:${SSHConstants.STATUS.CONTINUE}`, () => {
            if(__resolve){
                __resolve();
            }
        });
        methods.forEach((m) => {
            this[m] = function () {
                var params = [...arguments];
                return new Promise((resolve, reject) => {
                    params.push(function () {
                        if (arguments[0])
                            reject(arguments[0]);
                        var params = [...arguments].slice(1);
                        params.length==1?resolve(params[0]):resolve(params);
                    });
                    var recur = () => {
                        $ready.then(() => {
                            return this.ssh.sftp();    
                        }).then((sftp) => {
                            var executed = sftp[m].apply(sftp, params);
                            if (!executed) {
                                $ready = new Promise((resolve, reject) => {
                                    __resolve = resolve;
                                    recur();
                                });
                            }
                        }, (err) => {
                            reject(err);
                        });
                    }
                    recur();
                });
            }.bind(this);
        });

        Object.keys(enhanceMethods).forEach((m) => {
            this[m] = function () {
                var params = [...arguments];
                var path = params[0];
                var flag = "r+";
                if(params[1] && stringFlagMap.indexOf(params[1]) >= 0){
                    flag = params[1];
                    params = params.slice(2);
                }else{
                    params = params.slice(1);
                }
                return this.open(path, flag).then((handle) => {
                    return this[enhanceMethods[m]].apply(this, [handle].concat(params)).then((data) => {
                        this.close(handle);
                        return data;
                    }, (err) => {
                        this.close(handle);
                        return Promise.reject(err);
                    })
                });
            }
        });
    }

    createReadStream() {
        var params = [...arguments];
        return this.ssh.sftp().then((sftp) => {
            return sftp.createReadStream.apply(sftp, params);
        });
    }

    createWriteStream() {
        var params = [...arguments];
        return this.ssh.sftp().then((sftp) => {
            return sftp.createWriteStream.apply(sftp, params);
        });
    }
}

module.exports = SFTP;