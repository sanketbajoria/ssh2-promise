
import {ConnectConfig, X11Details} from 'ssh2';
import { PathLike } from 'fs';
interface SSHConfig extends ConnectConfig {
    /** Optional Unique ID attached to ssh connection. */
    uniqueId?: string;
    /** Automatic retry to connect, after disconnect. Default true */
    reconnect?: boolean;
    /** Number of reconnect retry, after disconnect. Default 10 */
    reconnectTries?: number;
    /** Delay after which reconnect should be done. Default 5000ms */
    reconnectDelay?: number;
    /** Path to private key */
    identity?: PathLike;
    /** To hop multiple connection using this tool. Default nc. Supported Value are nc, socat, native */
    hoppingTool?: string;

    /** x11 details can srcIP or srcPort, or unix socket string */
    x11?: string | X11Details
    
}
export = SSHConfig