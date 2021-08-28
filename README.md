# SSH2-Promise ![](https://app.travis-ci.com/sanketbajoria/ssh2-promise.svg?branch=master)

[ssh2-promise](https://github.com/sanketbajoria/ssh2-promise) is a powerful promise wrapper around [ssh2](https://www.npmjs.com/package/ssh2) client. It supports all the ssh2 client operation such as connection hopping, exec, spawn, shell, sftp, open tunnel, open socks connection etc... in promisify and async-await way. It helps in caching the sshconnection, to reduce time, during connection hopping. It have reconnect logic, so that, once disconnected, it can retry the sshconnection, automatically.  
It has promise wrapper around [sftp](https://github.com/mscdex/ssh2-streams/blob/master/SFTPStream.md) operations too.
This module is written in `Typescript`. It can be used in `Javascript` or in `Typescript` with full type support.

<p style="color:"><b><i>We have upgraded to ssh2 v1.1.0. It means minimum Node requirement v10.16.0, if you need support for older version please use ssh2-promise v0.2.0</i></b></p>

<p style="color:red"><b><i>Change in sftp api, now ssh.sftp() provide wrapped SFTP session instead of raw sftp session.</i></b></p>

# Installation

```javascript
//(Require Node v10.16.0 or newer)
npm install ssh2-promise;

//for older version (Supports for any version of Node)
npm install ssh2-promise@0.2.0
```

# Local Testing
#### Prerequisite to be installed
- docker
- docker-compose

```bash
cd pretest
docker-compose up -d
cd ..
yarn test
```

# Usage
All examples are shown in promisify and async-await manner.

#### Require

```javascript
//in javascript manner
var SSH2Promise = require('ssh2-promise');

//or in typescript manner
import SSH2Promise = require('ssh2-promise');

//or in typescript manner (with esModuleInterop enabled)
import SSH2Promise from 'ssh2-promise';


//To import SFTP, SSHConfig, TunnelConfig Type definition, SSHConstants in typescript

//without esModuleInterop
import SFTP = require('ssh2-promise/lib/sftp')
import SSHConfig = require('ssh2-promise/lib/sshConfig');
import TunnelConfig = require('ssh2-promise/lib/tunnelConfig');
import SSHConstants = require('ssh2-promise/lib/sshConstants');

//with esModuleInterop
import SFTP from 'ssh2-promise/lib/sftp'
import SSHConfig from 'ssh2-promise/lib/sshConfig';
import TunnelConfig from 'ssh2-promise/lib/tunnelConfig';
import SSHConstants from 'ssh2-promise/lib/sshConstants';
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

//Close the ssh connection 
//very important otherwise event leaks can happen
ssh.close(); 


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
//Get a sftp session
//see: https://github.com/mscdex/ssh2-streams/blob/master/SFTPStream.md

//in typescript import sftp type definition
//import SFTP = require('ssh2-promise/lib/sftp')

var sftp/*:SFTP*/ = ssh.sftp()
sftp.readdir("/").then((data) => {
  console.log(data); //file listing
}).catch((err) => {
  console.log(err);
})


//Get a shell session
ssh.shell().then((socket) => {
  socket.on('data', () => {
    //shell content will be available here
  })
  //Can write to socket 
  socket.write("")
});


//Async Await
//Get a sftp session
//see: https://github.com/mscdex/ssh2-streams/blob/master/SFTPStream.md
(async function(){
    var sftp = ssh.sftp();
    var data = await sftp.readdir("/")
    console.log(data); //file listing
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
//in typescript import sftp type definition
//import SFTP = require('ssh2-promise/lib/sftp')
var ssh = new SSH2Promise(sshconfig);
var sftp/*:SFTP*/ = ssh.sftp(); //or new SSH2Promise.SFTP(ssh);

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
//Get stat
sftp.getStat("/test.sh").then((stat) => {
  console.log(stat); //Stat object 
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
//Get stat
(async function(){
    var st = await sftp.getStat("/test.sh");
    console.log(stat); //Stat object 
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

#### x11

```javascript
sshconfig.x11 = {srcIP: 'localhost', srcPort: 6000}
//sshconfig.x11 = '/tmp/.X11-unix/X0' //connect to unix socket
var ssh = new SSH2Promise(sshconfig);

//It will establish the x11 forwarding, if
//x server running locally, 
//x forwarding enabled on remote server 
//xeyes command is installed on remote server

//Promise
ssh.x11('xeyes').then(() => {
  console.log("success"); //if x server running locally, (x forwarding enabled & xeyes command is installed) on remote server
}, () => {
  console.log("error"); //if any success condition is not met
});

//Async Await
(async function(){
  try{
    await ssh.x11('xeyes');
    console.log("success"); //if x server running locally, (x forwarding enabled & xeyes command is installed) on remote server
  }catch(err){
    console.log("error"); //if any success condition is not met
  }
})();
```

#### subsys

```javascript
var ssh = new SSH2Promise(sshconfig);

//It will start subsystem

//Promise
ssh.subsys('sftp').then((stream) => {
  console.log("success"); //sftp system started successfully
});

//Async Await
(async function(){
  var stream = await ssh.subsys('sftp');
  console.log("success"); //sftp system started successfully
})();
```

# API
`require('ssh2-promise')`
`require('ssh2-promise\lib\sftp')` 

## SSH2

#### Events
* **ssh**(< _string_ >status, < _object_ >sshconnection, < _object_ >payload) - Event get generated, when sshconnection status get changed. Various status can be "beforeconnect", "connect", "beforedisconnect", "disconnect"

* **ssh:< _status_ >**(< _object_ >sshconnection, < _object_ >payload) - Event get generated, when sshconnection status is at particular status. Various status can be "beforeconnect", "connect", "beforedisconnect", "disconnect"

* **tunnel**(< _string_ >status, < _object_ >sshconnection, < _object_ >payload) - Event get generated, when tunnel status get changed. Various status can be "beforeconnect", "connect", "beforedisconnect", "disconnect"

* **tunnel:< _status_ >**(< _object_ >sshconnection, < _object_ >payload) - Event get generated, when tunnel status is at particular status. Various status can be "beforeconnect", "connect", "beforedisconnect", "disconnect"

#### Methods
* **(constructor)**(< _array_ >|< _object_ >sshConfig, < _(Promise)_ >disableCache) - Creates and returns a new SSH2Promise instance. Single or multiple sshconfigs can be passed. sshConfig passed to SSH2Promise is aligned to [ssh2](https://www.npmjs.com/package/ssh2) library. It has few extra options other than ssh2 configuration. 
  * **host** - _string_ - Hostname or IP address of the server. **Default:** `'localhost'`

  * **port** - _integer_ - Port number of the server. **Default:** `22`

  * **forceIPv4** - _(Promise)_ - Only connect via resolved IPv4 address for `host`. **Default:** `false`

  * **forceIPv6** - _(Promise)_ - Only connect via resolved IPv6 address for `host`. **Default:** `false`

  * **hostHash** - _string_ - 'md5' or 'sha1'. The host's key is hashed using this method and passed to the **hostVerifier** function. **Default:** (none)

  * **hostVerifier** - _function_ - Function with parameters `(hashedKey[, callback])` where `hashedKey` is a string hex hash of the host's key for verification purposes. Return `true` to continue with the handshake or `false` to reject and disconnect, or call `callback()` with `true` or `false` if you need to perform asynchronous verification. **Default:** (auto-accept if `hostVerifier` is not set)

  * **username** - _string_ - Username for authentication. **Default:** (none)

  * **password** - _string_ - Password for password-based user authentication. **Default:** (none)

  * **agent** - _string_ - Path to ssh-agent's UNIX socket for ssh-agent-based user authentication. **Windows users: set to 'pageant' for authenticating with Pageant or (actual) path to a cygwin "UNIX socket."** **Default:** (none)

  * **agentForward** - _(Promise)_ - Set to `true` to use OpenSSH agent forwarding (`auth-agent@openssh.com`) for the life of the connection. `agent` must also be set to use this feature. **Default:** `false`

  * **privateKey** - _mixed_ - _Buffer_ or _string_ that contains a private key for either key-based or hostbased user authentication (OpenSSH format). **Default:** (none)

  * **passphrase** - _string_ - For an encrypted private key, this is the passphrase used to decrypt it. **Default:** (none)

  * **localHostname** - _string_ - Along with **localUsername** and **privateKey**, set this to a non-empty string for hostbased user authentication. **Default:** (none)

  * **localUsername** - _string_ - Along with **localHostname** and **privateKey**, set this to a non-empty string for hostbased user authentication. **Default:** (none)

  * **tryKeyboard** - _(Promise)_ - Try keyboard-interactive user authentication if primary user authentication method fails. If you set this to `true`, you need to handle the `keyboard-interactive` event. **Default:** `false`

  * **keepaliveInterval** - _integer_ - How often (in milliseconds) to send SSH-level keepalive packets to the server (in a similar way as OpenSSH's ServerAliveInterval config option). Set to 0 to disable. **Default:** `0`

  * **keepaliveCountMax** - _integer_ - How many consecutive, unanswered SSH-level keepalive packets that can be sent to the server before disconnection (similar to OpenSSH's ServerAliveCountMax config option). **Default:** `3`

  * **readyTimeout** - _integer_ - How long (in milliseconds) to wait for the SSH handshake to complete. **Default:** `20000`

  * **sock** - _ReadableStream_ - A _ReadableStream_ to use for communicating with the server instead of creating and using a new TCP connection (useful for connection hopping).

  * **strictVendor** - _(Promise)_ - Performs a strict server vendor check before sending vendor-specific requests, etc. (e.g. check for OpenSSH server when using `openssh_noMoreSessions()`) **Default:** `true`

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

  * **hoppingTool** - To hop connection using this tool. **Default:** `'nc'`. Supported Tools are `'nc'`, `'socat'`, `'native'`

  * **x11** - Connect to x11 server in different manner. **Default:** `'localhost:6000'`. Supported Options are {srcIP: 'localhost', srcPort: 6005} or custom unix socket for eg: '/tmp/.X11-unix/X0'
  

* **connect**() - _(Promise)_ - Try to establish a connection. No need to explicitly call connect method. It get called automatically, while doing operation.

* **exec**(< _string_ >cmd, < _array_ >params, < _objects_ >options) - _(Promise)_ - Execute a cmd, return a result. Options are passed directly to ssh2 exec command.

* **spawn**(< _string_ >cmd, < _array_ >params, < _objects_ >options) - _(Promise)_ - Spawn a cmd, return a stream. Options are passed directly to ssh2 exec command.

* **sftp**() - _(SFTP)_ - Get a new sftp session. 

* **subsys**(< _string_ >subsystem) - _(Promise)_ - Invoke a subsystem.

* **x11**(< _string_ >cmd) - _(Promise)_ - Start a x11 forwarding, by invoking 'cmd' on remote server. It handles error scenario, such as if x11 command not installed on remote server, x11 forwarding not enabled on remote server, & x11 server not running locally, by rejecting it gracefully.   

* **shell**() - _(Promise)_ - Get a shell session.

* **close**() - _(Promise)_ - Close the sshconnection and associated tunnels.

* **addTunnel**(< _object_ >tunnelConfig) - _(Promise)_ - Establish a forward tunnel over ssh machine. TunnelConfig has following properties.
  * **name** - Unique name. **Default:** `'${remoteAddr}@${remotePort}'`
  
  * **remoteAddr** - Remote Address to connect.
  
  * **remotePort** - Remote Port to connect.
  
  * **localPort** - Local port to bind to. By default, it will bind to a random port, if not passed. 

* **getTunnel**(< _string_ >name) - Get a tunnel by name.

* **closeTunnel**([< _string_ >name]) - _(Promise)_ - Close a tunnel, if name is passed. Otherwise, will close all the tunnels.

* **getSocksPort**([< _number_ >localPort]) - _(Promise)_ - Start a socks server. And, return a socks port, for reverse tunneling purpose.  localPort is optional. By default, it will bind to a random port, if not passed.

## SFTP
It supports all the [sftp](https://github.com/mscdex/ssh2-streams/blob/master/SFTPStream.md) client operations, in promisify way. For detailed explanation of all the operation, please visit [sftp](https://github.com/mscdex/ssh2-streams/blob/master/SFTPStream.md). It has few extra methods `getStat`, `setStat`, `changeTimestamp`, `readFileData`, `writeFileData`, `changeMode`, `changeOwner`.

#### Methods
* **(constructor)**(< _object_ > ssh2) - Creates and returns a new SFTP instance, which can perform all sftp client operation such readdir, mkdir etc... in promisify way.

* **fastGet**(< _string_ >remotePath, < _string_ >localPath[, < _object_ >options]) - _(Promise)_ - Downloads a file at `remotePath` to `localPath` using parallel reads for faster throughput. `options` can have the following properties:

    * **concurrency** - _integer_ - Number of concurrent reads **Default:** `64`

    * **chunkSize** - _integer_ - Size of each read in bytes **Default:** `32768`

    * **step** - _function_(< _integer_ >total_transferred, < _integer_ >chunk, < _integer_ >total) - Called every time a part of a file was transferred

* **fastPut**(< _string_ >localPath, < _string_ >remotePath[, < _object_ >options])  - _(Promise)_ - Uploads a file from `localPath` to `remotePath` using parallel reads for faster throughput. `options` can have the following properties:

    * **concurrency** - _integer_ - Number of concurrent reads **Default:** `64`

    * **chunkSize** - _integer_ - Size of each read in bytes **Default:** `32768`

    * **step** - _function_(< _integer_ >total_transferred, < _integer_ >chunk, < _integer_ >total) - Called every time a part of a file was transferred

    * **mode** - _mixed_ - Integer or string representing the file mode to set for the uploaded file.

* **createReadStream**(< _string_ >path[, < _object_ >options]) - _(Promise)_ - if resolved successfully, returns a new readable stream for `path`. `options` has the following defaults:

    ```javascript
    { flags: 'r',
      encoding: null,
      handle: null,
      mode: 0o666,
      autoClose: true
    }
    ```

    `options` can include `start` and `end` values to read a range of bytes from the file instead of the entire file. Both `start` and `end` are inclusive and start at 0. The `encoding` can be `'utf8'`, `'ascii'`, or `'base64'`.

    If `autoClose` is false, then the file handle won't be closed, even if there's an error. It is your responsiblity to close it and make sure there's no file handle leak. If `autoClose` is set to true (default behavior), on `error` or `end` the file handle will be closed automatically.

    An example to read the last 10 bytes of a file which is 100 bytes long:

    ```javascript
    sftp.createReadStream('sample.txt', {start: 90, end: 99});
    ```

* **createWriteStream**(< _string_ >path[, < _object_ >options]) - _(Promise)_ - if resolved successfully, returns a new writable stream for `path`. `options` has the following defaults:

    ```javascript
    {
      flags: 'w',
      encoding: null,
      mode: 0o666,
      autoClose: true
    }
    ```

    `options` may also include a `start` option to allow writing data at some position past the beginning of the file. Modifying a file rather than replacing it may require a flags mode of 'r+' rather than the default mode 'w'.

    If 'autoClose' is set to false and you pipe to this stream, this stream will not automatically close after there is no more data upstream -- allowing future pipes and/or manual writes.

* **open**(< _string_ >filename, < _string_ >flags, [< _mixed_ >attrs_mode]) - _(Promise)_ - Opens a file `filename` with `flags` with optional _ATTRS_ object or file mode `attrs_mode`. `flags` is any of the flags supported by `fs.open` (except sync flag). If promise resolved successfully, then return < _Buffer_ >handle, otherwise < _Error_ >err.

* **close**(< _Buffer_ >handle) - _(Promise)_ - Closes the resource associated with `handle` given by open() or opendir(). If promise is rejected, then return < _Error_ >err.

* **readFile**(< _string_ >path, [< _string_|_object_ >encoding]) - _(Promise)_ - Reads file content at given `path`. Default `encoding` is `null`. If promise resolved successfully, then (if encoding is defined, then return < _string_ >content otherwise return < _buffer_ >content), otherwise < _Error_ >err.

* **writeFile**(< _string_ >path, < _string_ >data, [< _object_ >options]) - _(Promise)_ - Writes `data` at given `path`. `options` can have two properties `encoding` and `flag`, Default encoding is `utf8`, and flag is `w`. If promise is rejected, then return < _Error_ >err.

* **readFileData**(< _string_ >filename, < _Buffer_ >buffer, < _integer_ >offset, < _integer_ >length, < _integer_ >position) - _(Promise)_ - Reads `length` bytes from the resource associated with `file` starting at `position` and stores the bytes in `buffer` starting at `offset`. If promise resolved successfully, then return Array [< _integer_ >bytesRead, < _Buffer_ >buffer (offset adjusted), < _integer_ >position], otherwise < _Error_ >err.

* **writeFileData**(< _string_ >filename, < _integer_ >offset, < _integer_ >length, < _integer_ >position) - _(Promise)_ - Writes `length` bytes from `buffer` starting at `offset` to the resource associated with `file` starting at `position`. If promise is rejected, then return < _Error_ >err.

* **getStat**(< _string_ >filename) - _(Promise)_ - Retrieves attributes for the resource associated with `file`. If promise resolved successfully, then return < _Stats_ >stats, otherwise < _Error_ >err.

* **setStat**(< _string_ >filename, < _ATTRS_ >attributes) - _(Promise)_ - Sets the attributes defined in `attributes` for the resource associated with `file`. If promise is rejected, then return < _Error_ >err.

* **changeTimestamp**(< _string_ >filename, < _mixed_ >atime, < _mixed_ >mtime) - _(Promise)_ - Sets the access time and modified time for the resource associated with `file`. `atime` and `mtime` can be Date instances or UNIX timestamps. If promise is rejected, then return < _Error_ >err.

* **changeOwner**(< _string_ >filename, < _integer_ >uid, < _integer_ >gid) - _(Promise)_ - Sets the owner for the resource associated with `file`. If promise is rejected, then return < _Error_ >err.

* **changeMode**(< _string_ >filename, < _mixed_ >mode) - _(Promise)_ - Sets the mode for the resource associated with `file`. `mode` can be an integer or a string containing an octal number. If promise is rejected, then return < _Error_ >err.

* **opendir**(< _string_ >path) - _(Promise)_ - Opens a directory `path`. If promise resolved successfully, then return < _Buffer_ >handle, otherwise < _Error_ >err.

* **readdir**(< _mixed_ >location) - _(Promise)_ - Retrieves a directory listing. `location` can either be a _Buffer_ containing a valid directory handle from opendir() or a _string_ containing the path to a directory. If promise resolved successfully, then return < _mixed_ >list, otherwise < _Error_ >err. `list` is an _Array_ of `{ filename: 'foo', longname: '....', attrs: {...} }` style objects (attrs is of type _ATTR_). If `location` is a directory handle, this function may need to be called multiple times until `list` is boolean false, which indicates that no more directory entries are available for that directory handle.

* **unlink**(< _string_ >path) - _(Promise)_ - Removes the file/symlink at `path`. If promise is rejected, then return < _Error_ >err.

* **rename**(< _string_ >srcPath, < _string_ >destPath) - _(Promise)_ - Renames/moves `srcPath` to `destPath`. If promise is rejected, then return < _Error_ >err.

* **mkdir**(< _string_ >path, [< _ATTRS_ >attributes, ]) - _(Promise)_ - Creates a new directory `path`. If promise is rejected, then return < _Error_ >err.

* **rmdir**(< _string_ >path) - _(Promise)_ - Removes the directory at `path`. If promise is rejected, then return < _Error_ >err.

* **stat**(< _string_ >path) - _(Promise)_ - Retrieves attributes for `path`. If promise resolved successfully, then return < _Stats_ >stats, otherwise < _Error_ >err.

* **lstat**(< _string_ >path) - _(Promise)_ - Retrieves attributes for `path`. If `path` is a symlink, the link itself is stat'ed instead of the resource it refers to. If promise resolved successfully, then return < _Stats_ >stats, otherwise < _Error_ >err.

* **setstat**(< _string_ >path, < _ATTRS_ >attributes) - _(Promise)_ - Sets the attributes defined in `attributes` for `path`. If promise is rejected, then return < _Error_ >err.

* **utimes**(< _string_ >path, < _mixed_ >atime, < _mixed_ >mtime) - _(Promise)_ - Sets the access time and modified time for `path`. `atime` and `mtime` can be Date instances or UNIX timestamps. If promise is rejected, then return < _Error_ >err.

* **chown**(< _string_ >path, < _integer_ >uid, < _integer_ >gid) - _(Promise)_ - Sets the owner for `path`. If promise is rejected, then return < _Error_ >err.

* **chmod**(< _string_ >path, < _mixed_ >mode) - _(Promise)_ - Sets the mode for `path`. `mode` can be an integer or a string containing an octal number. If promise is rejected, then return < _Error_ >err.

* **readlink**(< _string_ >path) - _(Promise)_ - Retrieves the target for a symlink at `path`. If promise resolved successfully, then return < _string_ >target, otherwise < _Error_ >err.

* **symlink**(< _string_ >targetPath, < _string_ >linkPath) - _(Promise)_ - Creates a symlink at `linkPath` to `targetPath`. If promise is rejected, then return < _Error_ >err.

* **realpath**(< _string_ >path) - _(Promise)_ - Resolves `path` to an absolute path. If promise resolved successfully, then return < _string_ >absPath, otherwise < _Error_ >err.

* **ext_openssh_rename**(< _string_ >srcPath, < _string_ >destPath) - _(Promise)_ - **OpenSSH extension** Performs POSIX rename(3) from `srcPath` to `destPath`. If promise is rejected, then return < _Error_ >err.

* **ext_openssh_statvfs**(< _string_ >path) - _(Promise)_ - **OpenSSH extension** Performs POSIX statvfs(2) on `path`. If promise resolved successfully, then return < _object_ >fsInfo, otherwise < _Error_ >err. `fsInfo` contains the information as found in the [statvfs struct](http://linux.die.net/man/2/statvfs).

* **ext_openssh_fstatvfs**(< _Buffer_ >handle) - _(Promise)_ - **OpenSSH extension** Performs POSIX fstatvfs(2) on open handle `handle`. If promise resolved successfully, then return < _object_ >fsInfo, otherwise < _Error_ >err. `fsInfo` contains the information as found in the [statvfs struct](http://linux.die.net/man/2/statvfs).

* **ext_openssh_hardlink**(< _string_ >targetPath, < _string_ >linkPath) - _(Promise)_ - **OpenSSH extension** Performs POSIX link(2) to create a hard link to `targetPath` at `linkPath`. If promise is rejected, then return < _Error_ >err.

* **ext_openssh_fsync**(< _Buffer_ >handle) - _(Promise)_ - **OpenSSH extension** Performs POSIX fsync(3) on the open handle `handle`. If promise is rejected, then return < _Error_ >err.

#### ATTRS

An object with the following valid properties:

* **mode** - _integer_ - Mode/permissions for the resource.

* **uid** - _integer_ - User ID of the resource.

* **gid** - _integer_ - Group ID of the resource.

* **size** - _integer_ - Resource size in bytes.

* **atime** - _integer_ - UNIX timestamp of the access time of the resource.

* **mtime** - _integer_ - UNIX timestamp of the modified time of the resource.

When supplying an ATTRS object to one of the SFTP methods:

* `atime` and `mtime` can be either a Date instance or a UNIX timestamp.

* `mode` can either be an integer or a string containing an octal number.


#### Stats

An object with the same attributes as an ATTRS object with the addition of the following methods:

* `stats.isDirectory()`

* `stats.isFile()`

* `stats.isBlockDevice()`

* `stats.isCharacterDevice()`

* `stats.isSymbolicLink()`

* `stats.isFIFO()`

* `stats.isSocket()`


# LICENSE

MIT

