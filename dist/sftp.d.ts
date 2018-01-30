/// <reference types="node" />
import { EventEmitter } from 'events';
import SSH2Promise = require('./index');
export default class SFTP extends EventEmitter {
    ssh: SSH2Promise;
    constructor(ssh: SSH2Promise);
    createReadStream(): Promise<any>;
    createWriteStream(): Promise<any>;
}
