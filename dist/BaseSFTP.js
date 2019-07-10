"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class BaseSFTP extends events_1.EventEmitter {
    /**
     * (Client-only)
     * Downloads a file at `remotePath` to `localPath` using parallel reads for faster throughput.
     *
     * Returns `Promise<void>`
     */
    fastGet(remotePath, localPath, options) {
        return Promise.reject(false);
    }
    /**
     * (Client-only)
     * Uploads a file from `localPath` to `remotePath` using parallel reads for faster throughput.
     *
     * Returns `Promise<void>`
     */
    fastPut(localPath, remotePath, options) {
        return Promise.reject(false);
    }
    /**
    * (Client-only)
    * Opens a file `filename` for `mode` with optional `attributes`.
    *
    * Returns `Promise<Buffer>`
    */
    open(filename, mode, attributes) {
        return Promise.reject(false);
    }
    /**
    * (Client-only)
    * Closes the resource associated with `handle` given by `open()` or `opendir()`.
    *
    * Returns `Promise<void>`
    */
    close(handle) {
        return Promise.reject(false);
    }
    /**
     * (Client-only)
     * Reads `length` bytes from the resource associated with `handle` starting at `position`
     * and stores the bytes in `buffer` starting at `offset`.
     *
     * Returns `Promise<Array<any>>`
     */
    read(handle, buffer, offset, length, position) {
        return Promise.reject(false);
    }
    /**
     * (Client-only)
     * Reads length bytes from the resource associated with file starting at position and stores the bytes in buffer starting at
     * offset. If promise resolved successfully, then return Array [< integer >bytesRead, < Buffer >buffer
     * (offset adjusted), < integer >position], otherwise < Error >err.
     *
     * Returns `Promise<Array<any>>`
     */
    readFileData(filename, buffer, offset, length, position) {
        return Promise.reject(false);
    }
    /**
     * (Client-only)
     *  Reads file content at given path. Default encoding is null.
     *
     * Returns `Promise<string>`
     */
    readFile(filename, encoding) {
        return Promise.reject(false);
    }
    /**
    * (Client-only)
    * Writes length bytes from buffer starting at offset to the resource associated with file starting at position.
    *
    * Returns `Promise<void>`
    */
    write(handle, buffer, offset, length, position) {
        return Promise.reject(false);
    }
    /**
    * (Client-only)
    * Writes length bytes from buffer starting at offset to the resource associated with file starting at position.
    *
    * Returns `Promise<void>`
    */
    writeFileData(filename, buffer, offset, length, position) {
        return Promise.reject(false);
    }
    /**
     *  Writes data at given path. options can have two properties encoding and flag, Default encoding is utf8, and flag is w.
     *
     * Returns `Promise<void>`
     */
    writeFile(filename, data, options) {
        return Promise.reject(false);
    }
    /**
     * (Client-only)
     * Retrieves attributes for the resource associated with `handle`.
     *
     * Returns `Promise<Stats>`
     */
    fstat(handle) {
        return Promise.reject(false);
    }
    /**
     * (Client-only)
     * Retrieves attributes for the resource associated with `file`. If promise resolved successfully, then return < Stats >stats, * otherwise < Error >err.
     *
     * Returns `Promise<Stats>`
     */
    getStat(filename) {
        return Promise.reject(false);
    }
    /**
     * (Client-only)
     * Sets the attributes defined in `attributes` for the resource associated with `handle`.
     *
     * Returns `Promise<void>`
     */
    fsetstat(handle, attributes) {
        return Promise.reject(false);
    }
    /**
     * (Client-only)
     * Sets the attributes defined in `attributes` for the resource associated with `file`.
     *
     * Returns `Promise<void>`
     */
    setStat(filename, attributes) {
        return Promise.reject(false);
    }
    /**
     * (Client-only)
     * Sets the access time and modified time for the resource associated with `handle`.
     *
     * Returns `Promise<void>`
     */
    futimes(handle, atime, mtime) {
        return Promise.reject(false);
    }
    /**
     * (Client-only)
     * Sets the access time and modified time for the resource associated with `file`.
     *
     * Returns `Promise<void>`
     */
    changeTimestamp(filename, atime, mtime) {
        return Promise.reject(false);
    }
    /**
     * (Client-only)
     * Sets the owner for the resource associated with `handle`.
     *
     * Returns `Promise<void>`
     */
    fchown(handle, uid, gid) {
        return Promise.reject(false);
    }
    /**
     * (Client-only)
     * Sets the owner for the resource associated with `file`.
     *
     * Returns `Promise<void>`
     */
    changeOwner(filename, uid, gid) {
        return Promise.reject(false);
    }
    /**
     * (Client-only)
     * Sets the mode for the resource associated with `handle`.
     *
     * Returns `Promise<void>`
     */
    fchmod(handle, mode) {
        return Promise.reject(false);
    }
    /**
     * (Client-only)
     * Sets the mode for the resource associated with `file`.
     *
     * Returns `Promise<void>`
     */
    changeMode(filename, mode) {
        return Promise.reject(false);
    }
    /**
     * (Client-only)
     * Opens a directory `path`.
     *
     * Returns `Promise<Buffer>`
     */
    opendir(path) {
        return Promise.reject(false);
    }
    /**
     * (Client-only)
     * Retrieves a directory listing.
     *
     * Returns `Promise<any>`
     */
    readdir(location) {
        return Promise.reject(false);
    }
    /**
     * (Client-only)
     * Removes the file/symlink at `path`.
     *
     * Returns `Promise<void>`
     */
    unlink(path) {
        return Promise.reject(false);
    }
    /**
     * (Client-only)
     * Renames/moves `srcPath` to `destPath`.
     *
     * Returns `Promise<void>`
     */
    rename(srcPath, destPath) {
        return Promise.reject(false);
    }
    /**
     * (Client-only)
     * Creates a new directory `path`.
     *
     * Returns `Promise<void>`
     */
    mkdir(path, attributes) {
        return Promise.reject(false);
    }
    /**
     * (Client-only)
     * Removes the directory at `path`.
     *
     * Returns `Promise<void>`
     */
    rmdir(path) {
        return Promise.reject(false);
    }
    /**
     * (Client-only)
     * Retrieves attributes for `path`.
     *
     * Returns `Promise<Stats>`
     */
    stat(path) {
        return Promise.reject(false);
    }
    /**
     * (Client-only)
     * Retrieves attributes for `path`. If `path` is a symlink, the link itself is stat'ed
     * instead of the resource it refers to.
     *
     * Returns `Promise<Stats>`
     */
    lstat(path) {
        return Promise.reject(false);
    }
    /**
     * (Client-only)
     * Sets the attributes defined in `attributes` for `path`.
     *
     * Returns `Promise<void>`
     */
    setstat(path, attributes) {
        return Promise.reject(false);
    }
    /**
     * (Client-only)
     * Sets the access time and modified time for `path`.
     *
     * Returns `Promise<void>`
     */
    utimes(path, atime, mtime) {
        return Promise.reject(false);
    }
    /**
     * (Client-only)
     * Sets the owner for `path`.
     *
     * Returns `Promise<void>`
     */
    chown(path, uid, gid) {
        return Promise.reject(false);
    }
    /**
     * (Client-only)
     * Sets the mode for `path`.
     *
     * Returns `Promise<void>`
     */
    chmod(path, mode) {
        return Promise.reject(false);
    }
    /**
    * (Client-only)
    * Retrieves the target for a symlink at `path`.
    *
    * Returns `Promise<string>`
    */
    readlink(path) {
        return Promise.reject(false);
    }
    /**
     * (Client-only)
     * Creates a symlink at `linkPath` to `targetPath`.
     *
     * Returns `Promise<void>`
     */
    symlink(targetPath, linkPath) {
        return Promise.reject(false);
    }
    /**
     * (Client-only)
     * Resolves `path` to an absolute path.
     *
     * Returns `Promise<string>`
     */
    realpath(path) {
        return Promise.reject(false);
    }
    /**
     * (Client-only, OpenSSH extension)
     * Performs POSIX rename(3) from `srcPath` to `destPath`.
     *
     * Returns `Promise<void>`
     */
    ext_openssh_rename(srcPath, destPath) {
        return Promise.reject(false);
    }
    /**
    * (Client-only, OpenSSH extension)
    * Performs POSIX statvfs(2) on `path`.
    *
    * Returns `Promise<any>`
    */
    ext_openssh_statvfs(path) {
        return Promise.reject(false);
    }
    /**
     * (Client-only, OpenSSH extension)
     * Performs POSIX fstatvfs(2) on open handle `handle`.
     *
     * Returns `Promise<any>`
     */
    ext_openssh_fstatvfs(handle) {
        return Promise.reject(false);
    }
    /**
     * (Client-only, OpenSSH extension)
     * Performs POSIX link(2) to create a hard link to `targetPath` at `linkPath`.
     *
     * Returns `Promise<void>`
     */
    ext_openssh_hardlink(targetPath, linkPath) {
        return Promise.reject(false);
    }
    /**
     * (Client-only, OpenSSH extension)
     * Performs POSIX fsync(3) on the open handle `handle`.
     *
     * Returns `Promise<void>`
     */
    ext_openssh_fsync(handle) {
        return Promise.reject(false);
    }
}
exports.default = BaseSFTP;
