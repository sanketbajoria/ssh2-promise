import * as stream from "stream";
import { EventEmitter } from 'events';
import { InputAttributes, Stats, ReadStreamOptions, WriteStreamOptions, TransferOptions } from 'ssh2-streams';

export default abstract class BaseSFTP extends EventEmitter {

    /**
     * (Client-only)
     * Returns a new readable stream for `path`.
     * 
     * Returns `Promise<Readable>`
     */
    abstract createReadStream(path: string, options?: ReadStreamOptions): Promise<stream.Readable>;

    /**
     * (Client-only)
     * Returns a new writable stream for `path`.
     * 
     * Returns `Promise<Writable>`
     */
    abstract createWriteStream(path: string, options?: WriteStreamOptions): Promise<stream.Writable>;

    /**
     * (Client-only)
     * Downloads a file at `remotePath` to `localPath` using parallel reads for faster throughput.
     * 
     * Returns `Promise<void>`
     */
    fastGet(remotePath: string, localPath: string, options?: TransferOptions): Promise<void> {
        return Promise.reject(false);
    }

    /**
     * (Client-only)
     * Uploads a file from `localPath` to `remotePath` using parallel reads for faster throughput.
     * 
     * Returns `Promise<void>`
     */
    fastPut(localPath: string, remotePath: string, options?: TransferOptions): Promise<void> {
        return Promise.reject(false);
    }

    /**
    * (Client-only)
    * Opens a file `filename` for `mode` with optional `attributes`.
    *
    * Returns `Promise<Buffer>`
    */
    open(filename: string, mode: string, attributes?: InputAttributes): Promise<Buffer> {
        return Promise.reject(false);
    }

    /**
    * (Client-only)
    * Closes the resource associated with `handle` given by `open()` or `opendir()`.
    *
    * Returns `Promise<void>`
    */
    close(handle: Buffer): Promise<void> {
        return Promise.reject(false);
    }

    /**
     * (Client-only)
     * Reads `length` bytes from the resource associated with `handle` starting at `position`
     * and stores the bytes in `buffer` starting at `offset`.
     *
     * Returns `Promise<Array<any>>`
     */
    read(handle: Buffer, buffer: Buffer, offset: number, length: number, position: number): Promise<Array<any>> {
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
    readFileData(filename: string, buffer: Buffer, offset: number, length: number, position: number): Promise<Array<any>> {
        return Promise.reject(false);
    }

    /**
     * (Client-only)
     *  Reads file content at given path. Default encoding is null.
     *
     * Returns `Promise<string>`
     */
    readFile(filename: string, encoding?: string|any): Promise<string> {
        return Promise.reject(false);
    }

    /**
    * (Client-only)
    * Writes length bytes from buffer starting at offset to the resource associated with file starting at position.
    * 
    * Returns `Promise<void>`
    */
    write(handle: Buffer, buffer: Buffer, offset: number, length: number, position: number): Promise<void> {
        return Promise.reject(false);
    }

    /**
    * (Client-only)
    * Writes length bytes from buffer starting at offset to the resource associated with file starting at position.
    * 
    * Returns `Promise<void>`
    */
    writeFileData(filename: string, buffer: Buffer, offset: number, length: number, position: number): Promise<void> {
        return Promise.reject(false);
    }

    /**
     *  Writes data at given path. options can have two properties encoding and flag, Default encoding is utf8, and flag is w.
     * 
     * Returns `Promise<void>`
     */
    writeFile(filename: string, data: string, options: any): Promise<void> {
        return Promise.reject(false);
    }

    /**
     * (Client-only)
     * Retrieves attributes for the resource associated with `handle`.
     *
     * Returns `Promise<Stats>`
     */
    fstat(handle: Buffer): Promise<Stats> {
        return Promise.reject(false);
    }

    /**
     * (Client-only)
     * Retrieves attributes for the resource associated with `file`. If promise resolved successfully, then return < Stats >stats, * otherwise < Error >err.
     *
     * Returns `Promise<Stats>`
     */
    getStat(filename: string): Promise<Stats> {
        return Promise.reject(false);
    }

    /**
     * (Client-only)
     * Sets the attributes defined in `attributes` for the resource associated with `handle`.
     *
     * Returns `Promise<void>`
     */
    fsetstat(handle: Buffer, attributes: InputAttributes): Promise<void> {
        return Promise.reject(false);
    }

    /**
     * (Client-only)
     * Sets the attributes defined in `attributes` for the resource associated with `file`.
     *
     * Returns `Promise<void>`
     */
    setStat(filename: string, attributes: InputAttributes): Promise<void> {
        return Promise.reject(false);
    }

    /**
     * (Client-only)
     * Sets the access time and modified time for the resource associated with `handle`.
     *
     * Returns `Promise<void>`
     */
    futimes(handle: Buffer, atime: number | Date, mtime: number | Date): Promise<void> {
        return Promise.reject(false);
    }

    /**
     * (Client-only)
     * Sets the access time and modified time for the resource associated with `file`.
     *
     * Returns `Promise<void>`
     */
    changeTimestamp(filename: string, atime: number | Date, mtime: number | Date): Promise<void> {
        return Promise.reject(false);
    }

    /**
     * (Client-only)
     * Sets the owner for the resource associated with `handle`.
     *
     * Returns `Promise<void>`
     */
    fchown(handle: Buffer, uid: number, gid: number): Promise<void> {
        return Promise.reject(false);
    }

    /**
     * (Client-only)
     * Sets the owner for the resource associated with `file`.
     *
     * Returns `Promise<void>`
     */
    changeOwner(filename: string, uid: number, gid: number): Promise<void> {
        return Promise.reject(false);
    }

    /**
     * (Client-only)
     * Sets the mode for the resource associated with `handle`.
     *
     * Returns `Promise<void>`
     */
    fchmod(handle: Buffer, mode: number | string): Promise<void> {
        return Promise.reject(false);
    }

    /**
     * (Client-only)
     * Sets the mode for the resource associated with `file`.
     *
     * Returns `Promise<void>`
     */
    changeMode(filename: string,  mode: number | string): Promise<void> {
        return Promise.reject(false);
    }

    /**
     * (Client-only)
     * Opens a directory `path`.
     *
     * Returns `Promise<Buffer>`
     */
    opendir(path: string): Promise<Buffer> {
        return Promise.reject(false);
    }

    /**
     * (Client-only)
     * Retrieves a directory listing.
     *
     * Returns `Promise<any>`
     */
    readdir(location: string | Buffer): Promise<any> {
        return Promise.reject(false);
    }

    /**
     * (Client-only)
     * Removes the file/symlink at `path`.
     *
     * Returns `Promise<void>`
     */
    unlink(path: string): Promise<void> {
        return Promise.reject(false);
    }

    /**
     * (Client-only)
     * Renames/moves `srcPath` to `destPath`.
     *
     * Returns `Promise<void>`
     */
    rename(srcPath: string, destPath: string): Promise<void> {
        return Promise.reject(false);
    }

    /**
     * (Client-only)
     * Creates a new directory `path`.
     *
     * Returns `Promise<void>`
     */
    mkdir(path: string, attributes?: InputAttributes): Promise<void> {
        return Promise.reject(false);
    }

    /**
     * (Client-only)
     * Removes the directory at `path`.
     *
     * Returns `Promise<void>`
     */
    rmdir(path: string): Promise<void> {
        return Promise.reject(false);
    }

    /**
     * (Client-only)
     * Retrieves attributes for `path`.
     *
     * Returns `Promise<Stats>`
     */
    stat(path: string): Promise<Stats> {
        return Promise.reject(false);
    }

    /**
     * (Client-only)
     * Retrieves attributes for `path`. If `path` is a symlink, the link itself is stat'ed
     * instead of the resource it refers to.
     *
     * Returns `Promise<Stats>`
     */
    lstat(path: string): Promise<Stats> {
        return Promise.reject(false);
    }
    /**
     * (Client-only)
     * Sets the attributes defined in `attributes` for `path`.
     *
     * Returns `Promise<void>`
     */
    setstat(path: string, attributes: InputAttributes): Promise<void> {
        return Promise.reject(false);
    }

    /**
     * (Client-only)
     * Sets the access time and modified time for `path`.
     *
     * Returns `Promise<void>`
     */
    utimes(path: string, atime: number | Date, mtime: number | Date): Promise<void> {
        return Promise.reject(false);
    }

    /**
     * (Client-only)
     * Sets the owner for `path`.
     *
     * Returns `Promise<void>`
     */
    chown(path: string, uid: number, gid: number): Promise<void> {
        return Promise.reject(false);
    }

    /**
     * (Client-only)
     * Sets the mode for `path`.
     *
     * Returns `Promise<void>`
     */
    chmod(path: string, mode: number | string): Promise<void> {
        return Promise.reject(false);
    }

    /**
    * (Client-only)
    * Retrieves the target for a symlink at `path`.
    *
    * Returns `Promise<string>`
    */
    readlink(path: string): Promise<string> {
        return Promise.reject(false);
    }
    /**
     * (Client-only)
     * Creates a symlink at `linkPath` to `targetPath`.
     *
     * Returns `Promise<void>`
     */
    symlink(targetPath: string, linkPath: string): Promise<void> {
        return Promise.reject(false);
    }

    /**
     * (Client-only)
     * Resolves `path` to an absolute path.
     *
     * Returns `Promise<string>`
     */
    realpath(path: string): Promise<string> {
        return Promise.reject(false);
    }

    /**
     * (Client-only, OpenSSH extension)
     * Performs POSIX rename(3) from `srcPath` to `destPath`.
     *
     * Returns `Promise<void>`
     */
    ext_openssh_rename(srcPath: string, destPath: string): Promise<void> {
        return Promise.reject(false);
    }

    /**
    * (Client-only, OpenSSH extension)
    * Performs POSIX statvfs(2) on `path`.
    *
    * Returns `Promise<any>`
    */
    ext_openssh_statvfs(path: string): Promise<any> {
        return Promise.reject(false);
    }

    /**
     * (Client-only, OpenSSH extension)
     * Performs POSIX fstatvfs(2) on open handle `handle`.
     *
     * Returns `Promise<any>`
     */
    ext_openssh_fstatvfs(handle: Buffer): Promise<any> {
        return Promise.reject(false);
    }
    /**
     * (Client-only, OpenSSH extension)
     * Performs POSIX link(2) to create a hard link to `targetPath` at `linkPath`.
     *
     * Returns `Promise<void>`
     */
    ext_openssh_hardlink(targetPath: string, linkPath: string): Promise<void> {
        return Promise.reject(false);
    }
    /**
     * (Client-only, OpenSSH extension)
     * Performs POSIX fsync(3) on the open handle `handle`.
     *
     * Returns `Promise<void>`
     */
    ext_openssh_fsync(handle: Buffer): Promise<void> {
        return Promise.reject(false);
    }

}