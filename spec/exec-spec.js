var SSHTunnel = require("../src/index");
jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
Promise.prototype.finally = function(cb) {
    const res = () => this;
    const fin = () => Promise.resolve(cb()).then(res);
    return this.then(fin, fin);
};
describe("exec n spawn cmd", function () {
  var sshTunnel;
  beforeAll(() => {
    var sshConfig = {
        username: "demo",
        host: "test.rebex.net",
        password: "password"
    }
    sshTunnel = new SSHTunnel(sshConfig);
  })
  
  it("exec a command", function (done) {
    sshTunnel.exec("whoami").then((username) => {
        expect(username.trim()).toEqual("Relay-DEV-Tunnel-Service");
    }, (error) => {
        expect(error).toBeUndefined();
    }).finally(() => {
        done();
    });
  });

  it("open sftp session", function (done) {
    sshTunnel.sftp().then((sftp) => {
        expect(sftp).toBeDefined();
    }, (error) => {
        expect(error).toBeUndefined();
    }).finally(() => {
        done();
    });
  });

  it("open shell session", function (done) {
    sshTunnel.shell().then((socket) => {
        expect(socket).toBeDefined();
    }, (error) => {
        expect(error).toBeUndefined();
    }).finally(() => {
        done();
    });
  });

  it("open socks server", function (done) {
    sshTunnel.getSocksPort().then((port) => {
        expect(port).toBeDefined();
    }, (error) => {
        expect(error).toBeUndefined();
    }).finally(() => {
        done();
    });
  });

  it("open forward tunnel connection", function (done) {
    sshTunnel.addTunnel({remoteAddr: "couchdbnew.relayhub.pitneycloud.com", remotePort: "80"}).then((tunnel) => {
        expect(tunnel.localPort).toBeDefined();
    }, (error) => {
        expect(error).toBeUndefined();
    }).finally(() => {
        done();
    });
  });


  afterAll(() => {
      sshTunnel.close()
  })

  
  


});   