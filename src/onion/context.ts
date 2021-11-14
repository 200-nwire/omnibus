'use strict'

/**
 * Module dependencies.
 */

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'util'.
const util = require('util')

/**
 * Context prototype.
 */

const proto = (module.exports = {
    // @ts-expect-error ts-migrate(7018) FIXME: Object literal's property 'correlationId' implicit... Remove this comment to see the full error message
    correlationId: null,
    // @ts-expect-error ts-migrate(7018) FIXME: Object literal's property 'causationId' implicitly... Remove this comment to see the full error message
    causationId: null,
    // @ts-expect-error ts-migrate(7018) FIXME: Object literal's property 'initiator' implicitly h... Remove this comment to see the full error message
    initiator: null,

    correlate(correlationId: any) {
        this.correlationId = correlationId
    },

    causedBy(causationId: any) {
        this.causationId = causationId
    },

    setInitiator({
        type,
        id
    }: any) {
        if (!this.initiator) {
            this.initiator = {}
        }

        if (type) {
            this.initiator.type = type
        }

        if (id) {
            this.initiator.id = id
        }
    },

    /**
     * util.inspect() implementation, which
     * just returns the JSON output.
     *
     * @return {Object}
     * @api public
     */

    inspect() {
        if (this === proto) return this
        return this.toJSON()
    },

    /**
     * Return JSON representation.
     *
     * Here we explicitly invoke .toJSON() on each
     * object, as iteration will otherwise fail due
     * to the getters and cause utilities such as
     * clone() to fail.
     *
     * @return {Object}
     * @api public
     */

    toJSON() {
        return {
            app: this.app.toJSON(),
        }
    },

    /**
     * Default error handling.
     *
     * @param {Error} err
     * @api private
     */

    onerror(error: any) {
        // don't do anything if there is no error.
        // this allows you to pass `this.onerror`
        // to node-style callbacks.
        if (null == error) return

        // When dealing with cross-globals a normal `instanceof` check doesn't work properly.
        // See https://github.com/koajs/koa/issues/1466
        // We can probably remove it once jest fixes https://github.com/facebook/jest/issues/2549.
        const isNativeError =
            Object.prototype.toString.call(error) === '[object Error]' ||
            error instanceof Error
        if (!isNativeError)
            error = new Error(util.format('non-error thrown: %j', error))

        // delegate
        this.app.emit('error', error, this)

        throw error
    },
})

/**
 * Custom inspection implementation for newer Node.js versions.
 *
 * @return {Object}
 * @api public
 */

/* istanbul ignore else */
if (util.inspect.custom) {
    module.exports[util.inspect.custom] = module.exports.inspect
}
