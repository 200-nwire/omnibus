// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Emitter'.
const Emitter = require('emittery')
const Bull = require('bull')
const { parseISO, isValid } = require('date-fns')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'OmnibusBul... Remove this comment to see the full error message
class OmnibusBullTransport extends Emitter {
    constructor(options: any) {
        super()
        this.queue = new Bull(`omnibus:${process.env.NODE_ENV}`, options)

        this.queue.on('global:completed', async (jobId: any) => {
            const job = await this.queue.getJob(jobId)
            if (!job) return
            job.remove()
        })

        this.queue.on('global:failed', async (jobId: any, error: any) => {
            const job = await this.queue.getJob(jobId)

            if (!job) return

            await this.emit('error', { job, error })
            console.log(`[${job.data.name}] failed with error:`, error)
        })
    }

    listen() {
        this.queue.process((job: any) => {
            const { data: message } = job
            Object.keys(message.data).forEach((key) => {
                if (
                    [
                        'createdOn',
                        'modifiedOn',
                        'dueDate',
                        'pickedOn',
                        'chargedOn',
                        'expiresOn',
                        'expiration',
                    ].includes(key)
                ) {
                    const date = parseISO(message.data[key])
                    if (isValid(date)) {
                        message.data[key] = date
                    }
                }
                if (key === 'period') {
                    message.data[key] = {
                        start: parseISO(message.data[key].start),
                        end: parseISO(message.data[key].end),
                    }
                }
            })
            return this.emit('message', message)
        })
    }

    send(message: any) {
        return this.queue.add(message, {
            attempts: 3,
            backoff: {
                type: 'jitter',
            },
        })
    }
}

module.exports = OmnibusBullTransport
