// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'isObject'.
const { isObject } = require('lodash')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'createExce... Remove this comment to see the full error message
const createException = require('./createException')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'InvalidMid... Remove this comment to see the full error message
const InvalidMiddlewareException = createException(
    'InvalidMiddlewareException',
    {
        message: 'Invalid Middleware',
    }
)

InvalidMiddlewareException.forMiddleware = (middleware: any) => {
    let message = null

    if (isObject(middleware)) {
        message = `Middleware ${middleware.constructor.name} is invalid. It must extend = require( Middleware`
    }

    throw new InvalidMiddlewareException(message)
}

module.exports = InvalidMiddlewareException
