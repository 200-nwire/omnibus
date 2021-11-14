// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'isFunction... Remove this comment to see the full error message
const { isFunction } = require('lodash')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'MethodName... Remove this comment to see the full error message
const MethodNameInflector = require('./MethodNameInflector')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'InvalidHan... Remove this comment to see the full error message
const InvalidHandlerMethodException = require('../../exceptions/InvalidHandlerMethodException')

module.exports = class HandleInflector extends MethodNameInflector {
    constructor(methodName: any) {
        super()
        this.methodName = methodName || 'handle'
    }

    inflect(commandName: any, handler: any) {
        if (isFunction(handler[this.methodName]) === false) {
            InvalidHandlerMethodException.forMethod(this.methodName)
        }

        return this.methodName
    }
}
