# Description

[ssh2-promise](https://github.com/sanketbajoria/ssh2-promise) is a powerful promise wrapper around [ssh2](https://www.npmjs.com/package/ssh2) client. It supports all the ssh2 client operation such as connection hopping, exec, spawn, shell, sftp, open tunnel, open socks connection etc... in promisify way. It helps in caching the sshconnection, to reduce time, during connection hopping. It have reconnect logic, so that, once disconnected, it can retry the sshconnection, automatically.  
It has promise wrapper around [sftp](https://github.com/mscdex/ssh2-streams/blob/master/SFTPStream.md) operations too. It can handle 'continue' event automatically, While doing any sftp operation.

# Installation

```javascript
npm install ssh2-promise;
```

# Usage
All examples are shown in promisify and async-await manner.

#### Require

```javascript
var SSH2Promise = require('ssh2-promise');
```

#### Connect to SSH Server

Configuration passed to SSH2Promise is aligned to [ssh2](https://www.npmjs.com/package/ssh2) library. For debugging, pass a debug function in configuration, similary how we do for SSH2

```javascript
// The config passed to the Client constructor should match the config required by ssh2.
// Extra identity option is provided to directly pass the path of private key file
var sshconfig = {
  host: '192.168.1.2',
  username: 'ubuntu',
  identity: '/here/is/my/key'
}

var ssh = new SSH2Promise(sshconfig);

//Promise
ssh.connect().then(() => {
  console.log("Connection established") 
});


//Async Await
(async function(){
    await ssh.connect();
    console.log("Connection established");
})();


```
#### Connect to SSH Server via hopping

```javascript
//SSH server detail used for hopping
var sshconfig1 = {
  host: '192.168.1.2',
  username: 'ubuntu',
  identity: '/here/is/my/key1'
}

//SSH server detail to be connected
var sshconfig2 = {
  host: '192.168.1.3',
  username: 'ubuntu',
  password: 'mysecret2'
}

//It will establish connection to sshconfig2 via sshconfig1
//by default it will cache connection, 
//to disable caching, pass second parameter as true
//new SSH2Promise([sshconfig1, sshconfig2], true)
var ssh = new SSH2Promise([sshconfig1, sshconfig2]);

//Promise
ssh.connect().then(() => {
  console.log("Connection established") 
});


//Async Await
(async function(){
    await ssh.connect();
    console.log("Connection established");
})();

```

#### exec, spawn cmd

```javascript
var ssh = new SSH2Promise(sshconfig);

//Promise
//use exec, if output of command is limited
ssh.exec("whoami").then((data) => {
  console.log(data); //ubuntu
});
//use spawn, if you want to stream on output of command
ssh.spawn("tail -f /var/log.txt").then((socket) => {
  socket.on('data', () => {
    //file content will be available here
  })
});


//Async Await
//use exec, if output of command is limited
(async function(){
    var data = await ssh.exec("whoami");
    console.log(data); //ubuntu
})();

//use spawn, if you want to stream on output of command
(async function(){
    var socket = await ssh.spawn("tail -f /var/log.txt");
    socket.on('data', () => {
      //file content will be available here
    })
})();

```

#### sftp, shell cmd

```javascript
var ssh = new SSH2Promise(sshconfig);

//Promise
//Get a raw sftp session, please don't use raw sftp session, instead use SFTP Promise wrapper defined below example.
//see: https://github.com/mscdex/ssh2-streams/blob/master/SFTPStream.md
ssh.sftp().then((sftp) => {
  sftp.readdir("/", (err, data) => {
    console.log(data); //file listing
  })
});

//Get a shell session
ssh.shell().then((socket) => {
  socket.on('data', () => {
    //shell content will be available here
  })
  //Can write to socket 
  socket.write("")
});


//Async Await
//Get a raw sftp session, please don't use raw sftp session, instead use SFTP Promise wrapper defined below example.
//see: https://github.com/mscdex/ssh2-streams/blob/master/SFTPStream.md
(async function(){
    var sftp = await ssh.sftp();
    sftp.readdir("/", (err, data) => {
      console.log(data); //file listing
    });
})();

//Get a shell session
(async function(){
    var socket = await ssh.shell();
    socket.on('data', () => {
      //shell content will be available here
    })
    //Can write to socket 
    socket.write("")
})();
```

#### sftp operation in promise & async await manner

```javascript
var ssh = new SSH2Promise(sshconfig);
var sftp = new SSH2Promise.SFTP(ssh);

//We can do all sftp client operation listed in "https://github.com/mscdex/ssh2-streams/blob/master/SFTPStream.md" in promisify or async await manner.

//Promise
//Read dir
sftp.readdir("/").then((list) => {
  console.log(list); //list of files in directory '/'
});
//Create ReadStream
sftp.createReadStream("/test.sh").then((stream) => {
  console.log(stream); //Readable stream, which support data, close events etc.. 
});


//Async Await
//Read dir
(async function(){
    var list = await sftp.readdir("/");
    console.log(list); //list of files in directory '/'
})();
//Create ReadStream
(async function(){
    var stream = await sftp.createReadStream("/test.sh");
    console.log(stream); //Readable stream, which support data, close events etc.. 
})();
```

#### tunnel and socks server

```javascript
var ssh = new SSH2Promise(sshconfig);

//Promise
//It will establish the socks connection, one per ssh connection, and return the port
//It is mainly used for reverse tunneling
ssh.getSocksPort().then((port) => {
  console.log(port); //Socks port
});

//Establish a forward tunneling to any resource over above server
ssh.addTunnel({remoteAddr: "www.google.com", remotePort: "80"}).then((tunnel) => {
  console.log(tunnel.localPort); //Local port 
});


//Async Await
//It will establish the socks connection, one per ssh connection, and return the port
//It is mainly used for reverse tunneling
(async function(){
    var port = await ssh.getSocksPort();
    console.log(port); //Socks port
})();

//Establish a forward tunneling to any resource over above server
(async function(){
    var tunnel = await ssh.addTunnel({remoteAddr: "www.google.com", remotePort: "80"});
    console.log(tunnel.localPort); //Local port
})();
```


# API
`require('ssh2-promise')` or `require('ssh2-promise').SSH2` returns a **SSH2** constructor.

`require('ssh2-promise').SFTP` returns a **SFTP** constructor.

## SSH2

#### Events
* **ssh**(< _string_ >status, < _object_ >sshconnection, < _object_ >payload) - Event get generated, when sshconnection status get changed. Various status can be "beforeconnect", "connect", "beforedisconnect", "disconnect"

* **ssh:<status>**(< _object_ >sshconnection, < _object_ >payload) - Event get generated, when sshconnection status at particular status. Various status can be "beforeconnect", "connect", "beforedisconnect", "disconnect"

* **tunnel**(< _string_ >status, < _object_ >sshconnection, < _object_ >payload) - Event get generated, when tunnel status get changed. Various status can be "beforeconnect", "connect", "beforedisconnect", "disconnect"

* **tunnel:<status>**(< _object_ >sshconnection, < _object_ >payload) - Event get generated, when tunnel status at particular status. Various status can be "beforeconnect", "connect", "beforedisconnect", "disconnect"

#### Methods
* **(constructor)**(< _array_ >|< _object_ >sshConfig, < _boolean_ >disableCache) - Creates and returns a new SSH2Promise instance. Single or multiple sshconfigs can be passed. sshConfig passed to SSH2Promise is aligned to [ssh2](https://www.npmjs.com/package/ssh2) library. It has few extra options other than ssh2 configuration. 
  * **host** - _string_ - Hostname or IP address of the server. **Default:** `'localhost'`

  * **port** - _integer_ - Port number of the server. **Default:** `22`

  * **forceIPv4** - _boolean_ - Only connect via resolved IPv4 address for `host`. **Default:** `false`

  * **forceIPv6** - _boolean_ - Only connect via resolved IPv6 address for `host`. **Default:** `false`

  * **hostHash** - _string_ - 'md5' or 'sha1'. The host's key is hashed using this method and passed to the **hostVerifier** function. **Default:** (none)

  * **hostVerifier** - _function_ - Function with parameters `(hashedKey[, callback])` where `hashedKey` is a string hex hash of the host's key for verification purposes. Return `true` to continue with the handshake or `false` to reject and disconnect, or call `callback()` with `true` or `false` if you need to perform asynchronous verification. **Default:** (auto-accept if `hostVerifier` is not set)

  * **username** - _string_ - Username for authentication. **Default:** (none)

  * **password** - _string_ - Password for password-based user authentication. **Default:** (none)

  * **agent** - _string_ - Path to ssh-agent's UNIX socket for ssh-agent-based user authentication. **Windows users: set to 'pageant' for authenticating with Pageant or (actual) path to a cygwin "UNIX socket."** **Default:** (none)

  * **agentForward** - _boolean_ - Set to `true` to use OpenSSH agent forwarding (`auth-agent@openssh.com`) for the life of the connection. `agent` must also be set to use this feature. **Default:** `false`

  * **privateKey** - _mixed_ - _Buffer_ or _string_ that contains a private key for either key-based or hostbased user authentication (OpenSSH format). **Default:** (none)

  * **passphrase** - _string_ - For an encrypted private key, this is the passphrase used to decrypt it. **Default:** (none)

  * **localHostname** - _string_ - Along with **localUsername** and **privateKey**, set this to a non-empty string for hostbased user authentication. **Default:** (none)

  * **localUsername** - _string_ - Along with **localHostname** and **privateKey**, set this to a non-empty string for hostbased user authentication. **Default:** (none)

  * **tryKeyboard** - _boolean_ - Try keyboard-interactive user authentication if primary user authentication method fails. If you set this to `true`, you need to handle the `keyboard-interactive` event. **Default:** `false`

  * **keepaliveInterval** - _integer_ - How often (in milliseconds) to send SSH-level keepalive packets to the server (in a similar way as OpenSSH's ServerAliveInterval config option). Set to 0 to disable. **Default:** `0`

  * **keepaliveCountMax** - _integer_ - How many consecutive, unanswered SSH-level keepalive packets that can be sent to the server before disconnection (similar to OpenSSH's ServerAliveCountMax config option). **Default:** `3`

  * **readyTimeout** - _integer_ - How long (in milliseconds) to wait for the SSH handshake to complete. **Default:** `20000`

  * **sock** - _ReadableStream_ - A _ReadableStream_ to use for communicating with the server instead of creating and using a new TCP connection (useful for connection hopping).

  * **strictVendor** - _boolean_ - Performs a strict server vendor check before sending vendor-specific requests, etc. (e.g. check for OpenSSH server when using `openssh_noMoreSessions()`) **Default:** `true`

  * **algorithms** - _object_ - This option allows you to explicitly override the default transport layer algorithms used for the connection. Each value must be an array of valid algorithms for that category. The order of the algorithms in the arrays are important, with the most favorable being first. For a list of valid and default algorithm names, please review the documentation for the version of `ssh2-streams` used by this module. Valid keys:

      * **kex** - _array_ - Key exchange algorithms.

      * **cipher** - _array_ - Ciphers.

      * **serverHostKey** - _array_ - Server host key formats.

      * **hmac** - _array_ - (H)MAC algorithms.

      * **compress** - _array_ - Compression algorithms.

  * **compress** - _mixed_ - Set to `true` to enable compression if server supports it, `'force'` to force compression (disconnecting if server does not support it), or `false` to explicitly opt out of compression all of the time. Note: this setting is overridden when explicitly setting a compression algorithm in the `algorithms` configuration option. **Default:** (only use compression if that is only what the server supports)

  * **debug** - _function_ - Set this to a function that receives a single string argument to get detailed (local) debug information. 

  * **identity** - to directly pass the path of private key file.

  * **reconnect** - to reconnect automatically, once disconnected. **Default:** `'true'`.

  * **reconnectTries** - Number of reconnect tries. **Default:** `'10'`.

  * **reconnectDelay** - Delay after which reconnect should be done. **Default:** `'5000'`. 

* **connect**() - Try to establish a connection. No need to explicitly call connect method. It get called automatically, while doing operation.

* **exec**(< _string_ >cmd, < _array_ >params, < _objects_ >options) - Execute a cmd, return a result. Options are passed directly to ssh2 exec command.

* **spawn**(< _string_ >cmd, < _array_ >params, < _objects_ >options) - Spawn a cmd, return a stream. Options are passed directly to ssh2 exec command.

* **sftp**() - Get a sftp session.

* **shell**() - Get a shell session.

* **close**() - Close the sshconnection and associated tunnels.

* **addTunnel**(< _object_ >tunnelConfig) - Establish a forward tunnel over ssh machine. TunnelConfig has following properties.
  * **name** - Unique name. **Default:** `'${remoteAddr}@${remotePort}'`
  
  * **remoteAddr** - Remote Address to connect.
  
  * **remotePort** - Remote Port to connect.
  
  * **localPort** - Local port to bind to. By default, it will bind to a random port, if not passed. 

* **getTunnel**(< _string_ >name) - Get a tunnel by name.

* **closeTunnel**([< _string_ >name]) - Close a tunnel, if name is passed. Otherwise, will close all the tunnels.

* **getSocksPort**() - Start a socks server. And, return a socks port, for reverse tunneling purpose.

## SFTP
It supports all the [sftp](https://github.com/mscdex/ssh2-streams/blob/master/SFTPStream.md) client operations, in promisify way. For detailed explanation of all the operation, please visit [sftp](https://github.com/mscdex/ssh2-streams/blob/master/SFTPStream.md).

#### Methods
* **(constructor)**(< _object_ > ssh2) - Creates and returns a new SFTP instance, which can perform all sftp client operation such readdir, mkdir etc... in promisify way.

# LICENSE

MIT

