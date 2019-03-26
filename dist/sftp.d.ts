import SSH2Promise = require('./index');
import BaseSFTP from './BaseSFTP';
import { ReadStreamOptions, WriteStreamOptions } from 'ssh2-streams';
export default class SFTP extends BaseSFTP {
    ssh: SSH2Promise;
    constructor(ssh: SSH2Promise);
    createReadStream(path: string, options?: ReadStreamOptions): Promise<any>;
    createWriteStream(path: string, options?: WriteStreamOptions): Promise<any>;
}
