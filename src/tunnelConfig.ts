interface TunnelConfig {
    /** Remote Address to connect */
    remoteAddr?: string;
    /** Local port to bind to. By default, it will bind to a random port, if not passed */
    localPort?: number;
    /** Remote Port to connect */
    remotePort?: number;
    socks?: boolean;
    /**  Unique name */
    name?: string;
}
export = TunnelConfig