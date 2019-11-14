declare const _default: {
    /**
     * Peek the array
     */
    peek: (arr: any[]) => any;
    /**
     * End pty socket session by sending kill signal
     * @param {*} socket
     */
    endSocket: (socket: any) => void;
    /**
     * Prompt for asking anything
     */
    prompt: (question: string, cb: Function) => void;
    /**
     * Create a Deferred promise
     */
    createDeferredPromise: () => {
        promise: Promise<{}>;
        resolve: undefined;
        reject: undefined;
    };
};
export default _default;
