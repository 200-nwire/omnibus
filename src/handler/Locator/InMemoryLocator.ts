// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'has'.
const { reduce, has, isString, isFunction, isObject } = require('lodash')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'HandlerLoc... Remove this comment to see the full error message
const HandlerLocator = require('./HandlerLocator')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'MissingHan... Remove this comment to see the full error message
const MissingHandlerException = require('../../exceptions/MissingHandlerException')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'InvalidCom... Remove this comment to see the full error message
const InvalidCommandException = require('../../exceptions/InvalidCommandException')

module.exports = class InMemoryLocator extends HandlerLocator {
    constructor(handlers = {}) {
        super()
        this.handlers = {}
        if (isObject(handlers)) {
            this.handlers = reduce(
                handlers,
                (carry: any, Handler: any, key: any) => {
				carry[key] = isFunction(Handler) ? new Handler() : Handler; // eslint-disable-line
                    return carry
                },
                {}
            )
        }
    }

    // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'commandName' implicitly has an 'any' ty... Remove this comment to see the full error message
    getHandlerForCommand(commandName) {
        if (isString(commandName) === false) {
            throw new InvalidCommandException()
        }

        const handlerName = commandName.replace('Command', 'Handler')

        if (has(this.handlers, handlerName) === false) {
            MissingHandlerException.forCommand(commandName)
        }

        return this.handlers[handlerName]
    }
}
