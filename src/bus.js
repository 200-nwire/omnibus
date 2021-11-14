const {
    Omnibus,
    OmnibusBullTransport,
    MemoryTransport,
    ServiceBusTransport,
} = require('omnibus')
const Sentry = require('../app/services/sentry')

const { config } = require('../config')

const { Manager } = require('@poppinss/manager')

class TransportManager extends Manager {
    getDefaultMappingName() {
        return this.application.default
    }

    getMappingConfig(mappingName) {
        return this.application.transports[mappingName]
    }

    getMappingDriver(mappingName) {
        return this.application.transports[mappingName].driver
    }

    createMemory() {
        return new MemoryTransport()
    }

    createBull(mappingName, config) {
        return new OmnibusBullTransport(config.connection)
    }

    createBus(mappingName, config) {
        return new ServiceBusTransport(config.connection)
    }
}

let transport = new TransportManager(config.get('omnibus')).use()

transport.on('error', ({ job, error }) => {
    Sentry.configureScope((scope) => {
        scope.setTag('source', 'omnibus_queue')
        scope.setTag('message_type', job.data.type)
        scope.setTag('message', job.data.name)
        scope.setTag('job_id', job.id)
        scope.setTag('correlationId', job.data.metadata.correlationId)
    })
    Sentry.captureException(error)
})

let bus = new Omnibus({ transport })

bus.use(async (context, next) => {
    console.log(
        `[${context.message.metadata.correlationId}]`,
        `[${context.message.type}]`,
        context.message.name
    )

    await next()
})

module.exports = bus
