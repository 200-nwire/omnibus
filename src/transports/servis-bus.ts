// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Emitter'.
const Emitter = require('emittery')

const { ServiceBusClient } = require('@azure/service-bus')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'ServiceBus... Remove this comment to see the full error message
class ServiceBusTransport extends Emitter {
    constructor(options: any) {
        super(options)

        if (!options.url) {
            throw new Error('No URL provided.')
        }

        this.client = new ServiceBusClient(options.url)
        this.sender = this.client.createSender(options.queue)
        this.receiver = this.client.createReceiver(options.queue)
    }
    listen() {
        this.receiver.subscribe({
            processMessage: async (message: any) => {
                this.emit('message', message.body)
            },
            processError: async (args: any) => {
                console.log(
                    `Error occurred with ${args.entityPath} within ${args.fullyQualifiedNamespace}:`,
                    args.error
                )
            },
        })
    }

    send(message: any) {
        return this.sender.sendMessages({ body: message })
    }
}

module.exports = ServiceBusTransport
