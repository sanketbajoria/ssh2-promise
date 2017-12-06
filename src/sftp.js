const EventEmitter = require('events'),
    SSHConstants = require('./sshConstants');

var methods = ["fastGet", "fastPut", "open", "close", "readData", "writeData", "fstat", "fsetstat", "futimes", "fchown", "fchmod", "opendir", "readdir", "unlink", "rename", "mkdir", "rmdir", "stat", "lstat", "setstat", "utimes", "chown", "chmod", "readlink", "symlink", "realpath", "ext_openssh_rename", "ext_openssh_statvfs", "ext_openssh_fstatvfs", "ext_openssh_hardlink", "ext_openssh_fsync"];

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
                    params.push(function (err, data) {
                        if (err)
                            reject(err);
                        resolve(data);
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