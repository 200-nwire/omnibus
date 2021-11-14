// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'isFunction... Remove this comment to see the full error message
const { isFunction } = require('lodash')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'CommandNam... Remove this comment to see the full error message
const CommandNameExtractor = require('./CommandNameExtractor/CommandNameExtractor')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'MethodName... Remove this comment to see the full error message
const MethodNameInflector = require('./MethodNameInflector/MethodNameInflector')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'HandlerLoc... Remove this comment to see the full error message
const HandlerLocator = require('./Locator/HandlerLocator')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Middleware... Remove this comment to see the full error message
const Middleware = require('../middleware')

// Intend to define private property
const _commandNameExtractor = Symbol('commandNameExtractor')
const _handlerLocator = Symbol('handlerLocator')
const _methodNameInflector = Symbol('methodNameInflector')

module.exports = class CommandHandlerMiddleware extends Middleware {
    constructor(commandNameExtractor: any, handlerLocator: any, methodNameInflector: any) {
        super()
        // @ts-expect-error ts-migrate(2538) FIXME: Type 'unique symbol' cannot be used as an index ty... Remove this comment to see the full error message
        this[_commandNameExtractor] = commandNameExtractor
        // @ts-expect-error ts-migrate(2538) FIXME: Type 'unique symbol' cannot be used as an index ty... Remove this comment to see the full error message
        this[_handlerLocator] = handlerLocator
        // @ts-expect-error ts-migrate(2538) FIXME: Type 'unique symbol' cannot be used as an index ty... Remove this comment to see the full error message
        this[_methodNameInflector] = methodNameInflector
    }

    set commandNameExtractor(commandNameExtractor: any) {
        // @ts-expect-error ts-migrate(2538) FIXME: Type 'unique symbol' cannot be used as an index ty... Remove this comment to see the full error message
        this[_commandNameExtractor] = commandNameExtractor
    }

    set handlerLocator(handlerLocator: any) {
        // @ts-expect-error ts-migrate(2538) FIXME: Type 'unique symbol' cannot be used as an index ty... Remove this comment to see the full error message
        this[_handlerLocator] = handlerLocator
    }

    set methodNameInflector(methodNameInflector: any) {
        // @ts-expect-error ts-migrate(2538) FIXME: Type 'unique symbol' cannot be used as an index ty... Remove this comment to see the full error message
        this[_methodNameInflector] = methodNameInflector
    }

    execute(context: any, next: any) {
        const { command, container } = context
        let commandName = null
        let handler = null
        let methodName = null
        let result = null

        // @ts-expect-error ts-migrate(2538) FIXME: Type 'unique symbol' cannot be used as an index ty... Remove this comment to see the full error message
        if (this[_commandNameExtractor] instanceof CommandNameExtractor) {
            // @ts-expect-error ts-migrate(2538) FIXME: Type 'unique symbol' cannot be used as an index ty... Remove this comment to see the full error message
            commandName = this[_commandNameExtractor].extractName(command)
        }

        // @ts-expect-error ts-migrate(2538) FIXME: Type 'unique symbol' cannot be used as an index ty... Remove this comment to see the full error message
        if (commandName && this[_handlerLocator] instanceof HandlerLocator) {
            // @ts-expect-error ts-migrate(2538) FIXME: Type 'unique symbol' cannot be used as an index ty... Remove this comment to see the full error message
            handler = this[_handlerLocator].getHandlerForCommand(
                commandName,
                container
            )
        }

        if (
            commandName &&
            handler &&
            // @ts-expect-error ts-migrate(2538) FIXME: Type 'unique symbol' cannot be used as an index ty... Remove this comment to see the full error message
            this[_methodNameInflector] instanceof MethodNameInflector
        ) {
            // @ts-expect-error ts-migrate(2538) FIXME: Type 'unique symbol' cannot be used as an index ty... Remove this comment to see the full error message
            methodName = this[_methodNameInflector].inflect(
                commandName,
                handler
            )
        }

        if (handler && isFunction(handler[methodName])) {
            result = handler[methodName].call(handler, command)
            return result || null
        }

        return next(context)
    }
}
