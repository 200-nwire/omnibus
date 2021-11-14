// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'isString'.
const { isString, isFunction, isDirectory, walkSync } = require('../../utils')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'HandlerLoc... Remove this comment to see the full error message
const HandlerLocator = require('./HandlerLocator')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'MissingHan... Remove this comment to see the full error message
const MissingHandlerException = require('../../exceptions/MissingHandlerException')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'InvalidCom... Remove this comment to see the full error message
const InvalidCommandException = require('../../exceptions/InvalidCommandException')

module.exports = class NamespaceHandlerLocator extends HandlerLocator {
    constructor(handlersPath: any) {
        super()

        if (!handlersPath || !isDirectory(handlersPath)) {
            throw new Error('Invalid commands path.')
        }

        this.handlers = walkSync(handlersPath)
    }

    getHandlerForCommand(commandName: any) {
        if (isString(commandName) === false) {
            throw new InvalidCommandException()
        }

        const handlerName = `${commandName.replace('Command', 'Handler')}.js`
        const foundHandler = this.handlers.find((handler: any) => handler.endsWith(handlerName)
        )

        if (!foundHandler) {
            MissingHandlerException.forCommand(commandName)
        }

        const Handler = require(foundHandler)

        if (isFunction(Handler) === false) {
            MissingHandlerException.forCommand(commandName)
        }

        return new Handler()
    }
}
