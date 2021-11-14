// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Middleware... Remove this comment to see the full error message
const Middleware = require('../middleware')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getMethods... Remove this comment to see the full error message
const getMethods = (object: any) => Object.getOwnPropertyNames(object).filter(
    (item) => typeof object[item] === 'function'
)
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'eventName'... Remove this comment to see the full error message
const eventName = (string: any, strip = 'when.') =>
    string
        .replace(/([\da-z]|(?=[A-Z]))([A-Z])/g, '$1.$2')
        .replace(strip, '')
        .replace(/^\.|\.$/g, '')
        .toLowerCase()

module.exports = class EventBusMIddlewere extends Middleware {
    constructor(logger: any, emitter: any) {
        super()
        this.emitter = emitter
        this.logger = logger
    }

    registerHandlers(listeners: any) {
        Object.values(listeners).forEach((listener) => {
            getMethods(listener).forEach((handler) => {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                this.emitter.on(eventName(handler), listener[handler])
            })
        })
    }

    execute(context: any, next: any) {
        const { command: message } = context
        const { event } = message

        if (!event) {
            return next(message)
        }

        this.logger.log('[event]', event)
        this.logger.log('[event lis]', this.emitter.listenerCount(event.name))

        if (this.emitter.listenerCount(event.name)) {
            return this.emitter.emit(event.name, message)
        }
        return next(message)
    }
}
