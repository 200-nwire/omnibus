// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Middleware... Remove this comment to see the full error message
const Middleware = require('./middleware')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'InvalidMid... Remove this comment to see the full error message
const InvalidMiddlewareException = require('./exceptions/InvalidMiddlewareException')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'InvalidCom... Remove this comment to see the full error message
const InvalidCommandException = require('./exceptions/InvalidCommandException')
const collect = require('collect.js')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'uuid'.
const { uuid } = require('uuidv4')

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

// Intend to define private property
const stack = Symbol('stack')

/**
 * Bus that run and handle commands through middlewares
 */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'CommandBus... Remove this comment to see the full error message
class CommandBus {
    container: any;
    context: any;
    emitter: any;
    projector: any;
    storage: any;
    // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'middlewares' implicitly has an 'any[]' ... Remove this comment to see the full error message
    constructor(middlewares = [], context = {}, emitter: any, storage: any, projector: any) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        this[stack] = middlewares
        this.context = context
        this.emitter = emitter
        this.projector = projector
        this.storage = storage
    }

    getMiddlewareStack() {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        return this[stack]
    }

    onMessage(job: any) {
        // console.log(
        //     '[RECEIVED_' + job.data.type.toUpperCase() + ']',
        //     job.data.name
        // )
        const message = job.data
        if (message.metadata.correlationId) {
            this.context.correlationId = message.metadata.correlationId
        }
        if (message.metadata.causationId) {
            this.context.causationId = message.metadata.causationId
        }
        if (message.initiator) {
            this.context.initiator = message.initiator
        }
        message.addInitiator = function ({
            id,
            type = 'anonymous'
        }: any) {
            this.initiator = {
                type,
            }

            if (id) {
                this.initiator.id = id
            }
        }

        return message.type === 'command'
            ? this.handle(message)
            : this.emit(message)
    }

    withContext({
        correlationId,
        causationId,
        initiator
    }: any) {
        const context = {
            correlationId: correlationId || uuid(),
            causationId: causationId,
            initiator: initiator || this.context.initiator,
        }
        return new CommandBus(
            this.getMiddlewareStack(),
            context,
            this.emitter,
            this.storage,
            this.projector
        ).setContainer(this.container)
    }

    setContainer(container: any) {
        this.container = container
        return this
    }

    get queue() {
        const queue = this.container.resolve('queue')
        if (queue.queue.handlers['omnibus']) {
            delete queue.queue.handlers['omnibus']
        }
        queue.queue.process('omnibus', this.onMessage.bind(this))
        return queue
    }

    async send(command: any) {
        if (this.queue) {
            command.metadata.causationId =
                this.context.causationId || command.id
            command.metadata.correlationId = this.context.correlationId
            if (this.context.initiator) {
                command.addInitiator(this.context.initiator)
            }
            await this.queue.add('omnibus', command, {
                attempts: 3,
                backoff: {
                    type: 'jitter',
                },
            })
            return {
                code: 202,
                message: 'Accepted',
                command: command.name,
            }
        }
        return this.handle(command)
    }

    dispatch(command: any) {
        return this.handle(command)
    }

    registerHandlers(listeners: any) {
        Object.values(listeners).forEach((listener) => {
            getMethods(listener).forEach((handler) => {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                this.emitter.on(eventName(handler), listener[handler])
            })
        })
    }

    persist(messages: any) {
        return this.storage.save(messages)
    }

    project(events: any) {
        return this.projector.handle(events)
    }

    async raise(events: any) {
        const messages = collect(events).map((event: any) => {
            if (event.type === 'event') {
                event.metadata.correlationId = this.context.correlationId
                event.metadata.causationId = this.context.causationId
                event.addInitiator(this.context.initiator)
            }

            return event
        })
        const toPublish = await this.persist(messages)
        await this.project(toPublish)
        await this.publish(toPublish)
    }

    publish(events: any) {
        if (this.queue) {
            return Promise.all(
                events.map((event: any) => {
                    return this.queue.add('omnibus', event, {
                        attempts: 3,
                        backoff: {
                            type: 'jitter',
                        },
                    })
                })
            );
        }
        return process.nextTick(() => events.map(this.emit.bind(this)))
    }

    async emit(event: any) {
        const context = this.withContext({
            causationId: event.id,
            correlationId: event.metadata.correlationId,
        })

        if (context.emitter.listenerCount(event.name)) {
            await context.emitter.emit(event.name, { event, context })
        }

        console.log(`[${event.metadata.correlationId}]`, '[event]', event.name)

        return {
            event: event.name,
            listeners: context.emitter.listenerCount(event.name),
        }
    }

    async handle(command: any) {
        // let command = this.envelope(message)

        await this.container.dispose()
        this.setContainer(this.container.createScope())
        const workspace = this.container.resolve('workspace')

        command.metadata.causationId = this.context.causationId || command.id
        command.metadata.correlationId = this.context.correlationId
        if (this.context.initiator && !command.initiator) {
            command.addInitiator(this.context.initiator)
        }

        workspace.record(command)

        // if (command instanceof Command === false) {
        //     InvalidCommandException.forCommand(command)
        // }

        const result = await this.pipeline({
            command,
            container: this.container,
        })()

        this.context.causationId = command.id

        const workload = await workspace.commit()
        const toCommit = workload.map((message: any) => {
            if (message.type === 'event') {
                message.metadata.correlationId = this.context.correlationId
                message.metadata.causationId = this.context.causationId
                message.addInitiator(this.context.initiator)
            }

            return message
        })

        const events = await this.persist(toCommit)
        await this.project(events)
        await this.publish(events)

        return result
    }

    pipeline(context: any) {
        return this.getMiddlewareStack().reduceRight(
            (next: any, middleware: any) => {
                if (middleware instanceof Middleware === false) {
                    InvalidMiddlewareException.forMiddleware(middleware)
                }

                return middleware.execute.bind(middleware, context, next)
            },
            // @ts-expect-error ts-migrate(7011) FIXME: Function expression, which lacks return-type annot... Remove this comment to see the full error message
            () => null
        );
    }
}

module.exports = CommandBus
