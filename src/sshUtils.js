var readline = require('readline');
var Writable = require('stream').Writable;

var mutableStdout = new Writable({
  write: function(chunk, encoding, callback) {
    if (!this.muted)
      process.stdout.write(chunk, encoding);
    callback();
  }
});
mutableStdout.muted = false;

module.exports = {
    /**
     * Peek the array
     */
    peek: function(arr) {
        return arr[arr.length - 1]
    },
    /**
     * End pty socket session by sending kill signal
     * @param {*} socket 
     */
    endSocket: function(socket) {
        if(socket && socket.writable){
            socket.end('\x03');
            socket.signal('INT');
            socket.signal('KILL');
        }
    },
    /**
     * Prompt for asking anything
     */
    prompt: function(question, cb) {
        var rl = readline.createInterface({
            input: process.stdin,
            output: mutableStdout,
            terminal: true
        });
        rl.question('Password: ', function(password) {
            cb(password);
            rl.close();
        });
        mutableStdout.muted = true;
    }
}