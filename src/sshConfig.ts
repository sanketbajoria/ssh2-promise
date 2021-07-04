
import {ConnectConfig} from 'ssh2';
import { PathLike } from 'fs';
interface SSHConfig extends ConnectConfig {
    uniqueId?: string;
    reconnect?: boolean;
    reconnectTries?: number;
    reconnectDelay?: number;
    identity?: PathLike;
    hoppingTool?: string;
    
}
export = SSHConfig