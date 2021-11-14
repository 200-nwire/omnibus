// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'isString'.
const { isString } = require('lodash')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'createExce... Remove this comment to see the full error message
const createException = require('./createException')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'MissingHan... Remove this comment to see the full error message
const MissingHandlerException = createException('MissingHandlerException', {
    message: 'Invalid Command',
})

MissingHandlerException.forCommand = (commandName: any) => {
    let message = null

    if (isString(commandName)) {
        message = `There is no a handler for "${commandName}" Command.`
    }

    throw new MissingHandlerException(message)
}

module.exports = MissingHandlerException
