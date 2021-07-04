interface TunnelConfig {
    remoteAddr?: string;
    localPort?: number;
    remotePort?: number;
    socks?: boolean;
    name?: string;
}

export = TunnelConfig