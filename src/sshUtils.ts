var readline = require('readline');
var Writable = require('stream').Writable;

var mutableStdout = new Writable({
  write: function(chunk:any, encoding:any, callback:Function) {
    if (!this.muted)
      process.stdout.write(chunk, encoding);
    callback();
  }
});
mutableStdout.muted = false;

export interface Deferred<T> {
    resolve: Function;
    reject: Function;
    promise: Promise<T>;
}

export default {
    /**
     * Peek the array
     */
    peek: function(arr: Array<any>) {
        return arr[arr.length - 1]
    },
    /**
     * End pty socket session by sending kill signal
     * @param {*} socket
     */
    endSocket: function(socket: any) {
        if(socket){
            if(socket.writable){
                socket.end('\x03');
                socket.signal('INT');
                socket.signal('KILL');
            }
            socket.close();
        }
    },
    /**
     * Prompt for asking anything
     */
    prompt: function(question: string, cb: (password: string) => void) {
        var rl = readline.createInterface({
            input: process.stdin,
            output: mutableStdout,
            terminal: true
        });
        rl.question(question, function(password: string) {
            cb(password);
            rl.close();
        });
        mutableStdout.muted = true;
    },

    /**
     * Create a Deferred promise
     */
    createDeferredPromise: function() {
        var __resolve, __reject;
        var __promise = new Promise((resolve, reject) => {
            __resolve = resolve;
            __reject = reject;
        })
        return {
            promise: __promise,
            resolve: __resolve,
            reject: __reject
        } as Deferred<any>;
    },
    getRandomPort(){
        return this.randomNumber(49152, 60999);
    },
    randomNumber(min:number, max:number) { 
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    async checkStreamError(stream: any, timeout?: number) {
        stream = await stream;
        return new Promise((resolve, reject) => {
            stream.stderr.on('data', function (data: any) {
                reject(data.toString());
            });
            setTimeout(() => { resolve(stream) }, timeout || 500);    
        })
    }
}
