const EventEmitter = require('events');

var methods = ["fastGet", "fastPut", "open", "close", "readData", "writeData", "fstat", "fsetstat", "futimes", "fchown", "fchmod", "opendir", "readdir", "unlink", "rename", "mkdir", "rmdir", "stat", "lstat", "setstat", "utimes", "chown", "chmod", "readlink", "symlink", "realpath", "ext_openssh_rename", "ext_openssh_statvfs", "ext_openssh_fstatvfs", "ext_openssh_hardlink", "ext_openssh_fsync"];

class SFTP extends EventEmitter{
    constructor(ssh){
        super();
        this.ssh = ssh;
        methods.forEach((m) => {
            this[m] = function(){
                var params = [...arguments];
                return new Promise((resolve, reject) => {
                    params.push(function(err, data){
                        if(err)
                            reject(err);
                        resolve(data);
                    });
                    this.ssh.sftp().then((sftp) => {
                        sftp[m].apply(sftp, params)
                    }, (err) => {
                        reject(err);   
                    });
                });
                
            }.bind(this);
        });
    }

    createReadStream(){
        var params = [...arguments];
        return this.ssh.sftp().then((sftp) => {
            return sftp.createReadStream.apply(sftp, params);
        });
    }

    createWriteStream(){
        var params = [...arguments];
        return this.ssh.sftp().then((sftp) => {
            return sftp.createWriteStream.apply(sftp, params);
        });
    }
}

module.exports = SFTP;