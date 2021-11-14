// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'isObject'.
const { isObject } = require('lodash')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'createExce... Remove this comment to see the full error message
const createException = require('./createException')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'InvalidCom... Remove this comment to see the full error message
const InvalidCommandException = createException('InvalidCommandException', {
    message: 'Invalid Command',
})

InvalidCommandException.forCommand = (command: any) => {
    let message = null

    if (isObject(command)) {
        message = `Command ${command.constructor.name} is invalid. It must extend = require( Command.`
    }

    throw new InvalidCommandException(message)
}

module.exports = InvalidCommandException
