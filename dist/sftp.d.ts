import SSH2Promise = require('./index');
import BaseSFTP from './BaseSFTP';
export default class SFTP extends BaseSFTP {
    ssh: SSH2Promise;
    constructor(ssh: SSH2Promise);
    createReadStream(): Promise<any>;
    createWriteStream(): Promise<any>;
}
