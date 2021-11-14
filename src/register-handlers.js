const collect = require('collect.js')
const { asClass, Lifetime } = require('awilix')

module.exports = (container) => {
    // Load our modules!
    container.loadModules(['app/modules/**/handlers/**/*.js'], {
        formatName: (name) =>
            name
                .replace(/^\w|[A-Z]|\b\w/g, (word) => word.toUpperCase())
                .replace(/-/g, '')
                .replace(/\s+/g, '') + 'Handler',
        resolverOptions: {
            lifetime: Lifetime.SCOPED,
            register: asClass,
        },
    })

    let storage = container.resolve('storage')
    let projector = container.resolve('projector')

    return async (context, next) => {
        let scope = container.createScope()
        let workspace = scope.resolve('workspace')

        if (context.message.is('command')) {
            const handlerName =
                context.message.name
                    .replace(/^\w|[A-Z]|\b\w/g, (word) => word.toUpperCase())
                    .replace(/\./g, '')
                    .replace(/\s+/g, '') + 'Handler'

            if (!scope.has(handlerName)) {
                console.log('no handler for', context.message.name)
                return await next()
            }

            workspace.record(context.message)

            const handler = scope.resolve(handlerName)
            context.body = await handler.handle.call(handler, context.message)
        }

        await next()

        if (context.message.is('command')) {
            let workload = await workspace.commit()

            let toCommit = workload.map((message) => {
                if (message.type === 'event') {
                    message.metadata.correlationId = context.correlationId
                    message.metadata.causationId = context.causationId
                    message.addInitiator(context.initiator)
                }

                return message
            })

            let events = await storage.save(toCommit)
            await projector.handle(events)
            await Promise.all(events.map((event) => context.publish(event)))
        }

        if (context.message.metadata.external) {
            await storage.save(collect([context.message]))
            await projector.handle([context.message])
        }
    }
}
