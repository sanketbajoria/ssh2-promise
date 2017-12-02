ssh2-promise
===========

[ssh2-promise](https://github.com/sanketbajoria/ssh2-promise) is a promise wrapper around [ssh2](https://www.npmjs.com/package/ssh2) client. It supports all the ssh2 client operation such as connection hopping, exec, spawn, shell, sftp, open tunnel, open socks connection etc.. in promisify way. It also help in caching the sshconnection, to reduce time, during hopping connection. It also have reconnect logic, so that, once disconnected, it can retry the sshconnection.

Installation
===============

```javascript
npm install ssh2-promise;
```


Usage
===============

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
ssh.connect().then(() => {
  console.log("Connection established") 
});

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
  identity: '/here/is/my/key2'
}

//It will establish connection to sshconfig2 via sshconfig1
//by default it will cache connection, 
//to disable caching, pass second parameter as true
//new SSH2Promise([sshconfig1, sshconfig2], true)
var ssh = new SSH2Promise([sshconfig1, sshconfig2]);
ssh.connect().then(() => {
  console.log("Connection established") 
});

```

#### exec, spawn cmd

```javascript
var ssh = new SSH2Promise(sshconfig);
//use exec, if output of command is limited
ssh.exec("whoami").then((data) => {
  console.log(data); //ubuntu
})
//use spawn, if you want to stream on output of command
ssh.spawn("tail -f /var/log.txt").then((socket) => {
  socket.on('data', () => {
    //file content will be available here
  })
})
```

#### sftp, shell cmd

```javascript
var ssh = new SSH2Promise(sshconfig);
//use exec, if output of command is limited
ssh.sftp().then((sftp) => {
  sftp.readdir("/", (err, data) => {
    console.log(data); //file listing
  })
  
})
//use spawn, if you want to stream on output of command
ssh.shell().then((socket) => {
  socket.on('data', () => {
    //shell content will be available here
  })
  //Can write to socket 
  socket.write("")
})
```

#### Tunnel and socks server

```javascript
var ssh = new SSH2Promise(sshconfig);
//It will establish the socks connection, one per ssh connection, and return the port
//It is mainly used for reverse tunneling
ssh.getSocksPort().then((port) => {
  console.log(port); //Socks port
});

//Establish a forward tunneling to any resource over above server
ssh.addTunnel({remoteAddr: "www.google.com", remotePort: "80"}).then((tunnel) => {
  console.log(tunnel.localPort); //Local port 
});
```

API
===============

#### Events
* **ssh**(< _string_ >status, < _object_ >sshconnection, < _object_ >payload) - Event get generated, when sshconnection status get changed. Various status can be "beforeconnect", "connect", "beforedisconnect", "disconnect"
* **ssh:<status>**(< _object_ >sshconnection, < _object_ >payload) - Event get generated, when sshconnection status at particular status. Various status can be "beforeconnect", "connect", "beforedisconnect", "disconnect"
* **tunnel**(< _string_ >status, < _object_ >sshconnection, < _object_ >payload) - Event get generated, when tunnel status get changed. Various status can be "beforeconnect", "connect", "beforedisconnect", "disconnect"
* **tunnel:<status>**(< _object_ >sshconnection, < _object_ >payload) - Event get generated, when tunnel status at particular status. Various status can be "beforeconnect", "connect", "beforedisconnect", "disconnect"


#### Methods
* **(constructor)**(< _array_ >|< _object_ >sshConfig, < _boolean_ >disableCache) - Creates and returns a new SSH2Promise instance. Single or multiple sshconfigs can be passed. sshConfig passed to SSH2Promise is aligned to [ssh2](https://www.npmjs.com/package/ssh2) library. It has few extra option other than ssh2 configuration.
  * **identity** - to directly pass the path of private key file.
  * **reconnect** - to reconnect automatically, once disconnected. Default is true.
  * **reconnectTries** - Number of reconnect tries. Default is 10.
  * **reconnectDelay** - Delay after which reconnect should be done. Default is 5000ms. 
* **connect**() - Try to establish a connection. No need to explicitly call connect method. It get called automatically, while doing operation.
* **exec**(< _string_ >cmd, < _array_ >params, < _objects_ >options) - Execute a cmd, return a result. Options get passed directly to ssh2 exec command.
* **spawn**(< _string_ >cmd, < _array_ >params, < _objects_ >options) - Spawn a cmd, return a stream. Options get passed directly to ssh2 exec command.
* **sftp**() - Get a sftp session.
* **shell**() - Get a shell session.
* **close**() - Close the sshconnection and associated tunnels.
* **addTunnel**(< _object_ >tunnelConfig) - Establish a forward tunnel over ssh machine. TunnelConfig has following properties.
  * **name** - Unique name. Default to ${remoteAddr}@${remotePort}
  * **remoteAddr** - Remote Address to connect.
  * **remotePort** - Remote Port to connect.
  * **localPort** - Local port to bind to. By default, it will bind to a random port, if not passed. 
* **getTunnel**(< _string_ >name) - Get a tunnel by name.
* **closeTunnel**([< _string_ >name]) - Close a tunnel, if name is passed. Otherwise, will close all the tunnels.
* **getSocksPort**() - Start a socks server. And, return a socks port, for reverse tunneling purpose.

LICENSE
===============
MIT