// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'createExce... Remove this comment to see the full error message
const createException = require('./createException')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'InvalidHan... Remove this comment to see the full error message
const InvalidHandlerMethodException = createException(
    'InvalidHandlerMethodException',
    {
        message: 'Invalid handler method.',
    }
)

InvalidHandlerMethodException.forMethod = (method: any) => {
    throw new InvalidHandlerMethodException(`Invalid handler method ${method}.`)
}

module.exports = InvalidHandlerMethodException
