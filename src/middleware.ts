/**
 * Abstract class for a middleware
 */
module.exports = class Middleware {
    execute(command: any, next: any) {
        throw new Error('execute method must be implemented')
    }
}
