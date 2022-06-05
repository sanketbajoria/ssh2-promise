import { ReadStreamOptions, WriteStreamOptions } from 'ssh2-streams';
import BaseSFTP from './BaseSFTP';
import SSH2Promise from './index';

var stringFlagMap = ['r', 'r+', 'w', 'wx', 'xw', 'w+', 'wx+', 'xw+', 'a', 'ax', 'xa', 'a+', 'ax+', 'xa+'];

var methods = ["fastGet", "fastPut", "open", "close", "readFile", "writeFile", "read", "write", "fstat", "fsetstat", "futimes", "fchown", "fchmod", "opendir", "readdir", "unlink", "rename", "mkdir", "rmdir", "stat", "lstat", "setstat", "utimes", "chown", "chmod", "readlink", "symlink", "realpath", "ext_openssh_rename", "ext_openssh_statvfs", "ext_openssh_fstatvfs", "ext_openssh_hardlink", "ext_openssh_fsync"];

var enhanceMethods: any = {"readFileData": "read", "writeFileData": "write", "getStat": "fstat", "setStat": "fsetstat", "changeTimestamp": "futimes", "changeOwner": "fchown", "changeMode": "fchmod"};

class SFTP extends BaseSFTP {

    ssh:SSH2Promise;

    constructor(ssh:SSH2Promise) {
        super();
        this.ssh = ssh;
        methods.forEach((m:string) => {
            (this as any)[m] = function () {
                var params = [...arguments];
                return new Promise((resolve, reject) => {
                    params.push(function (err:Error, ...results:any) {
                        if (err)
                            return reject(err);
                        return (results && results.length==1)?resolve(results[0]):resolve(results);
                    });
                    this.ssh.rawSFTP().then((sftp:any) => {
                        sftp[m].apply(sftp, params);
                    }).catch((err:any) => reject(err));
                });
            }.bind(this);
        });

        Object.keys(enhanceMethods).forEach((m) => {
            (this as any)[m] = function () {
                var params = [...arguments];
                var path = params[0];
                var flag = "r+";
                if(params[1] && stringFlagMap.indexOf(params[1]) >= 0){
                    flag = params[1];
                    params = params.slice(2);
                }else{
                    params = params.slice(1);
                }
                return this.open(path, flag).then((handle:any) => {
                    return this[enhanceMethods[m]].apply(this, [handle].concat(params)).then((data:any) => {
                        this.close(handle);
                        return data;
                    }, (err:any) => {
                        this.close(handle);
                        return Promise.reject(err);
                    })
                });
            }
        });
    }

    createReadStream(path: string, options?: ReadStreamOptions) {
        var params = [...arguments];
        return this.ssh.rawSFTP().then((sftp:any) => {
            return sftp.createReadStream.apply(sftp, params);
        });
    }

    createWriteStream(path: string, options?: WriteStreamOptions) {
        var params = [...arguments];
        return this.ssh.rawSFTP().then((sftp:any) => {
            return sftp.createWriteStream.apply(sftp, params);
        });
    }
}

export = SFTP
