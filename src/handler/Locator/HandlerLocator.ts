module.exports = class HandlerLocator {
    getHandlerForCommand(command: any) {
        throw new Error('getHandlerForCommand method must be implemented')
    }
}
