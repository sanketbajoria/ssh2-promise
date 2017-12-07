var SSHTunnel = require("../src/index");
jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
Promise.prototype.finally = function(cb) {
    const res = () => this;
    const fin = () => Promise.resolve(cb()).then(res);
    return this.then(fin, fin);
};
var fs = require("fs");
var sshConfigs = JSON.parse(fs.readFileSync("./spec/fixture.json"));

describe("exec n spawn cmd", function () {
  var sshTunnel;
  beforeAll(() => {
    sshTunnel = new SSHTunnel(sshConfigs.singleWithKey);
  })
  
  it("exec a command", function (done) {
    sshTunnel.exec("whoami").then((username) => {
        expect(username.trim()).toEqual("ubuntu");
    }, (error) => {
        expect(error).toBeUndefined();
    }).finally(() => {
        done();
    });
  });

  it("open sftp session", function (done) {
    sshTunnel.sftp().then((sftp) => {
        expect(sftp).toBeDefined();
        expect(sftp.readdir).toBeDefined();
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
    sshTunnel.addTunnel({remoteAddr: "www.google.com", remotePort: "443"}).then((tunnel) => {
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