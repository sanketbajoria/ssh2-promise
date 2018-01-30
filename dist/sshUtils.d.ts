declare const _default: {
    peek: (arr: any[]) => any;
    endSocket: (socket: any) => void;
    prompt: (question: string, cb: Function) => void;
    createDeferredPromise: () => {
        promise: Promise<{}>;
        resolve: undefined;
        reject: undefined;
    };
};
export default _default;
