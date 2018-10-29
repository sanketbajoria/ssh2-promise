import { EventEmitter } from 'events';
import { TunnelConfig } from './TunnelConfig';

export default abstract class BaseSSH2Promise extends EventEmitter {


    /**
     * Execute a cmd
     * @param cmd 
     * @param params 
     * @param options 
     */
    exec(cmd:string, params?:Array<string>, options?:any): Promise<any> {
        return Promise.reject();
    }
    
    /**
     * Spawn a cmd
     * @param cmd 
     * @param params 
     * @param options 
     */
    spawn(cmd:string, params?:Array<string>, options?:any): Promise<any> {
        return Promise.reject();
    }

    /**
     * Get shell socket
     */
    shell(options?:any): Promise<any> {
        return Promise.reject();
    }

     /**
     * Get a subsys
     */
    subsys(cmd:string): Promise<any> {
        return Promise.reject();
    }

    /**
     * Get a X11 port
     */
    x11(cmd:string): Promise<any> {
        return Promise.reject();
    }

    /**
     * Get a Socks Port
     */
    getSocksPort(localPort:number): Promise<number> {
        return Promise.reject();
    }

    /**
     * Get existing tunnel by name
     */
    getTunnel(name:string):any {

    }

      /**
     * Add new tunnel if not exist
     */
    addTunnel(tunnelConfig: TunnelConfig): Promise<any> {
        return Promise.reject();
    }

    /**
     * Close the tunnel
     */
    closeTunnel(name?:string): Promise<any> {
        return Promise.reject();
    }

}