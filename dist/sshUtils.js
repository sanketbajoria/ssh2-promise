"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var readline = require('readline');
var Writable = require('stream').Writable;
var mutableStdout = new Writable({
    write: function (chunk, encoding, callback) {
        if (!this.muted)
            process.stdout.write(chunk, encoding);
        callback();
    }
});
mutableStdout.muted = false;
exports.default = {
    /**
     * Peek the array
     */
    peek: function (arr) {
        return arr[arr.length - 1];
    },
    /**
     * End pty socket session by sending kill signal
     * @param {*} socket
     */
    endSocket: function (socket) {
        if (socket) {
            if (socket.writable) {
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
    prompt: function (question, cb) {
        var rl = readline.createInterface({
            input: process.stdin,
            output: mutableStdout,
            terminal: true
        });
        rl.question(question, function (password) {
            cb(password);
            rl.close();
        });
        mutableStdout.muted = true;
    },
    /**
     * Create a Deferred promise
     */
    createDeferredPromise: function () {
        var __resolve, __reject;
        var __promise = new Promise((resolve, reject) => {
            __resolve = resolve;
            __reject = reject;
        });
        return {
            promise: __promise,
            resolve: __resolve,
            reject: __reject
        };
    }
};
