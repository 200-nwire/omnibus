// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Emitter'.
const Emitter = require('emittery')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'MemoryTran... Remove this comment to see the full error message
class MemoryTransport extends Emitter {

    listen() {}

    send(message: any) {
        this.emit('message', message)
    }
}

module.exports = MemoryTransport
