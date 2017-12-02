var SSHTunnel = require("../src/index");
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
Promise.prototype.finally = function(cb) {
    const res = () => this;
    const fin = () => Promise.resolve(cb()).then(res);
    return this.then(fin, fin);
};
describe("connect to dummy server", function () {
  var sshConfig = {
      username: "demo",
      host: "test.rebex.net",
      password: "password",
      /* debug: function(str){
        console.log(str);
      } */
  }
  it("should connect directly to server", function (done) {
    var sshTunnel = new SSHTunnel(sshConfig);
    sshTunnel.connect().then((ssh) => {
        expect(ssh).toBeDefined();
    }, (error) => {
        expect(error).toBeUndefined();
    }).finally(() => {
        sshTunnel.close();
        done();
    });
  });

  it("should connect with password prompt directly to server", function (done) {
    var sshTunnel = new SSHTunnel({username: "demo", host: "test.rebex.net", tryKeyboard: true});
    sshTunnel.connect().then((ssh) => {
        expect(ssh).toBeDefined();
    }, (error) => {
        expect(error).toBeUndefined();
    }).finally(() => {
        sshTunnel.close();
        done();
    });
  });

  it("should not connect directly to server, with no password/pem", function (done) {
    var sshTunnel = new SSHTunnel({username: "demo", host: "test.rebex.net"});
    sshTunnel.connect().then((ssh) => {
        expect(ssh).toBeUndefined();
    }, (error) => {
        expect(error).toBeDefined();
    }).finally(() => {
        sshTunnel.close();
        done();
    });
  });

  it("should not connect directly to server, with wrong password", function (done) {
    var sshTunnel = new SSHTunnel({username: "demo", host: "test.rebex.net", password: "password1"});
    sshTunnel.connect().then((ssh) => {
        expect(ssh).toBeUndefined();
    }, (error) => {
        expect(error).toBeDefined();
    }).finally(() => {
        sshTunnel.close();
        done();
    });
  });

  


});   