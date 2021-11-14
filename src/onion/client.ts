class Container {}

class Projector {
    options: any;
    constructor(options: any) {
        this.options = options
    }
}

class Projectionist {
    projector: any;
    constructor(projector: any) {
        this.projector = projector
    }

    project(event: any) {
        this.projector.handle(event)
    }
}

const projector = new Projector({
    delimiter: '.',
})

// @ts-expect-error ts-migrate(2339) FIXME: Property 'register' does not exist on type 'Projec... Remove this comment to see the full error message
projector.register((when: any) => {
    when('wallet.js.was.created', async (event: any) => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'Account'.
        Account.save(event.data)
    })
})

// projector.handle([new AccountWasCreated({id: 123})])

const projectionist = new Projectionist({
    projector,
})

// @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'EventStore'.
const storage = new EventStore({
    prefix: 'ecw',
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'MongoStore'.
    driver: new MongoStore({ connection: 'mongodb://localhost' }),
})

class Workspace {
    collectWorkload: any;
    emit: any;
    options: any;
    repositories: any;
    stack: any;
    storage: any;
    constructor(storage: any, options: any) {
        this.storage = storage
        this.options = options
        this.repositories = []
    }

    get(key: any) {
        const Repo = this.repositories[key]
        const instance = new Repo(this.storage)
        this.stack.push(instance)
        return instance
    }

    async commit() {
        const events = this.collectWorkload()
        await this.storage.save(events)
        this.emit('commit', events)
    }
}

class AccountsRepository {}
class SubscriptionsRepository {}

const workspace = new Workspace(storage, {
    concurrency: 10,
    transaction: true,
    consistency: 'eventual',
})

// @ts-expect-error ts-migrate(2339) FIXME: Property 'add' does not exist on type 'Workspace'.
workspace.add('wallets.js', AccountsRepository)
// @ts-expect-error ts-migrate(2339) FIXME: Property 'add' does not exist on type 'Workspace'.
workspace.add('subscriptions', SubscriptionsRepository, {
    concurrency: 'strong',
})

// @ts-expect-error ts-migrate(2339) FIXME: Property 'on' does not exist on type 'Workspace'.
workspace.on('commit', (events: any) => projectionist.project(events))

// let john = workspace.get('accounts').load(ID)
// john.stopSmoking()

// workspace.commit()

// let container = awilix.createContainer()
// container.register('../**/handlers')
// container.register(workspace)

// @ts-expect-error ts-migrate(2300) FIXME: Duplicate identifier 'Omnibus'.
class Omnibus {
    context: any;
    correlationId: any;
    emit: any;
    executeHandler: any;
    listenerCount: any;
    middleware: any;
    on: any;
    onerror: any;
    transport: any;
    constructor({
        name,
        transport,
        container
    }: any) {
        this.transport = transport
    }
    listen() {
        this.transport.on('message', this.callback())
        this.transport.listen()
    }

    async send(command: any) {
        // const context_ = this.createContext(command)
        // await this.transport.send(context_.toMessage())

        // 1. Add metadata, wrap message
        command.metadata.causationId = this.context.causationId || command.id
        command.metadata.correlationId = this.context.correlationId
        command.addInitiator(this.context.initiator)

        // 2. Send
        await this.transport.send(command)

        // 3. Respond - to middleware!
        return {
            code: 202,
            message: 'Accepted',
            command: command.name,
        }
    }

    publish(event: any) {
        // const context_ = this.createContext(event)
        // await this.transport.publish(context_.toMessage())

        event.metadata.correlationId = this.context.correlationId
        event.metadata.causationId = this.context.causationId
        event.addInitiator(this.context.initiator)

        this.transport.publish(event)
    }

    /**
     * Return a request handler callback
     * for node's native http server.
     *
     * @return {Function}
     * @api public
     */

    callback() {
        const fn = compose(this.middleware)

        if (!this.listenerCount('error')) this.on('error', this.onerror)

        return (message: any) => {
            const context_ = this.createContext(message)
            return this.handleMessage(context_, fn)
        };
    }

    /**
     * Handle request in callback.
     *
     * @api private
     */

    handleMessage(context_: any, fnMiddleware: any) {
        const onerror = (error: any) => context_.onerror(error)
        const handleResponse = () => this.handle(context_)
        return fnMiddleware(context_).then(handleResponse).catch(onerror)
    }

    async handle(context_: any) {
        // Scope for workspace
        // await this.container.dispose()
        // this.setContainer(this.container.createScope())
        // let workspace = this.container.resolve('workspace')

        // Metadata
        // command.metadata.causationId = this.context.causationId || command.id
        // command.metadata.correlationId = this.context.correlationId
        // command.addInitiator(this.context.initiator)

        // Dispatch Event
        if (context_.message.is('event')) {
            return this.emit(context_.message.name, context_)
        }

        return this.executeHandler(context_)

        // Digest
        // this.context.causationId = command.id
        // workspace.record(command)
        //
        // // Run middleware
        // let result = await this.pipeline({
        //     command,
        //     container: this.container,
        // })()
        //
        // // Commit, persist, project, publish
        // let workload = await workspace.commit()
        // await this.raise(workload)
        //
        // // return result
        // return result
    }

    createContext(message: any) {
        const context = {
            // @ts-expect-error ts-migrate(7018) FIXME: Object literal's property 'correlationId' implicit... Remove this comment to see the full error message
            correlationId: null,
            // @ts-expect-error ts-migrate(7018) FIXME: Object literal's property 'causationId' implicitly... Remove this comment to see the full error message
            causationId: null,
            // @ts-expect-error ts-migrate(7018) FIXME: Object literal's property 'initiator' implicitly h... Remove this comment to see the full error message
            initiator: null,
        }

        if (message.metadata.correlationId) {
            context.correlationId = message.metadata.correlationId
        }
        if (message.metadata.causationId) {
            context.causationId = message.metadata.causationId
        }
        if (message.initiator) {
            context.initiator = message.initiator
        }

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'message' does not exist on type '{ corre... Remove this comment to see the full error message
        context.message = message

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'send' does not exist on type '{ correlat... Remove this comment to see the full error message
        context.send = this.send
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'publish' does not exist on type '{ corre... Remove this comment to see the full error message
        context.publish = this.publish

        return context
    }

    correlate(correlationId: any) {
        this.correlationId = correlationId
    }
}

const endpoint = new Omnibus({
    name: 'wallets.js',
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'RedisBull'.
    transport: new RedisBull(),
    // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'container'. Did you mean 'Contai... Remove this comment to see the full error message
    container,
})

// @ts-expect-error ts-migrate(2339) FIXME: Property 'use' does not exist on type 'Omnibus'.
endpoint.use(async (context: any, next: any) => {
    // Scope for workspace
    // await this.container.dispose()
    // this.setContainer(this.container.createScope())
    // let workspace = this.container.resolve('workspace')
    context.workspace = workspace
    await next()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'Datastore'.
    const session = await Datastore.startSession()
    await session.withTransaction(async () => {
        const events = await context.workspace.commit()
        await context.publish(events)
    })
    session.endSession()
})


endpoint.listen()

// @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'ChargeCommand'.
endpoint.send(new ChargeCommand())
// @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'ChargeCommand'.
endpoint.handle(new ChargeCommand())
// @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'CreatedEvent'.
endpoint.publish(new CreatedEvent())

// @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'ctx'.
ctx.reply({ message: 'done' })
