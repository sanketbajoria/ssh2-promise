"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class BaseSSH2Promise extends events_1.EventEmitter {
    /**
     * Execute a cmd
     * @param cmd
     * @param params
     * @param options
     */
    exec(cmd, params, options) {
        return Promise.reject();
    }
    /**
     * Spawn a cmd
     * @param cmd
     * @param params
     * @param options
     */
    spawn(cmd, params, options) {
        return Promise.reject();
    }
    /**
     * Get a raw sftp session
     * @param createNew
     */
    /* sftp(): Promise<any> {
        return Promise.reject();
    } */
    /**
     * Get shell socket
     */
    shell(options) {
        return Promise.reject();
    }
    /**
    * Get a subsys
    */
    subsys(cmd) {
        return Promise.reject();
    }
    /**
     * Get a X11 port
     */
    x11(cmd) {
        return Promise.reject();
    }
    /**
     * Get a Socks Port
     */
    getSocksPort(localPort) {
        return Promise.reject();
    }
    /**
     * Get existing tunnel by name
     */
    getTunnel(name) {
    }
    /**
   * Add new tunnel if not exist
   */
    addTunnel(tunnelConfig) {
        return Promise.reject();
    }
    /**
     * Close the tunnel
     */
    closeTunnel(name) {
        return Promise.reject();
    }
}
exports.default = BaseSSH2Promise;
