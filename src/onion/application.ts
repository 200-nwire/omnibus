'use strict'

/**
 * Module dependencies.
 */

const debug = require('debug')('omnibus:application')
const compose = require('koa-compose')
const context = require('./context')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Command'.
const Command = require('./command')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Event'.
const Event = require('./event')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Emitter'.
const Emitter = require('emittery')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'util'.
const util = require('util')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'assert'.
const assert = require('assert')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'uuid'.
const { uuid } = require('uuidv4')
const { Types } = require('mongoose')

/**
 * Expose `Application` class.
 * Inherits from `Emitter.prototype`.
 */

// @ts-expect-error ts-migrate(2300) FIXME: Duplicate identifier 'Omnibus'.
class Omnibus extends Emitter {
    /**
     * Initialize a new `Application`.
     *
     * @api public
     */

    /**
     *
     * @param {object} [options] Application options
     * @param {string} [options.env='development'] Environment
     * @param {string[]} [options.keys] Signed cookie keys
     * @param {boolean} [options.proxy] Trust proxy headers
     * @param {object} [options.transport] Subdomain offset
     * @param {boolean} [options.proxyIpHeader] proxy ip header, default to X-Forwarded-For
     * @param {boolean} [options.maxIpsCount] max ips read from proxy ip header, default to 0 (means infinity)
     *
     */

    constructor(options: any) {
        super()
        options = options || {}
        this.env = options.env || process.env.NODE_ENV || 'development'
        this.middleware = []

        this.transport = options.transport

        this.context = Object.create(context)
        // this.request = Object.create(request)
        // this.response = Object.create(response)
        // // util.inspect.custom support for node 6+
        // /* istanbul ignore else */
        // if (util.inspect.custom) {
        //     this[util.inspect.custom] = this.inspect
        // }

        assert(this.transport, 'Transport is not provided')
    }

    /**
     * Shorthand for:
     *
     *    http.createServer(app.callback()).listen(...)
     *
     * @param {Mixed} ...
     * @return {Server}
     * @api public
     */

    listen() {
        debug('listen')
        this.transport.on('message', this.callback())
        this.transport.on('error', this.onerror)
        this.transport.listen()
    }

    /**
     * Return JSON representation.
     * We only bother showing settings.
     *
     * @return {Object}
     * @api public
     */

    toJSON() {
        return {}
    }

    /**
     * Inspect implementation.
     *
     * @return {Object}
     * @api public
     */

    inspect() {
        return this.toJSON()
    }

    /**
     * Use the given middleware `fn`.
     *
     * Old-style middleware will be converted.
     *
     * @param {Function} fn
     * @return {Omnibus} self
     * @api public
     */

    use(fn: any) {
        if (typeof fn !== 'function')
            throw new TypeError('middleware must be a function!')

        debug('use %s', fn._name || fn.name || '-')
        this.middleware.push(fn)
        return this
    }

    /**
     * Return a request handler callback
     * for node's native http server.
     *
     * @return {Function}
     * @api public
     */

    callback() {
        const fn = compose(this.middleware)

        if (!this.listenerCount('error')) this.on('error', this.onerror)

        return (incoming: any) => {
            const message =
                incoming.type === 'event'
                    ? Event.deserialize(incoming)
                    : Command.deserialize(incoming)

            if (incoming._id) {
                // @ts-expect-error ts-migrate(2339) FIXME: Property '_id' does not exist on type 'Event | Com... Remove this comment to see the full error message
                message._id = Types.ObjectId(incoming._id)
            }
            if (incoming.createdOn) {
                // @ts-expect-error ts-migrate(2339) FIXME: Property 'createdOn' does not exist on type 'Event... Remove this comment to see the full error message
                message.createdOn = new Date(incoming.createdOn)
            }

            const context_ = this.createContext(message)

            return this.handleMessage(context_, fn)
        };
    }

    /**
     * Handle request in callback.
     *
     * @api private
     */

    handleMessage(context_: any, fnMiddleware: any) {
        const onerror = (error: any) => context_.onerror(error)
        const handleResponse = () => this.respond(context_)
        return fnMiddleware(context_).then(handleResponse).catch(onerror)
    }

    withContext(callback: any) {
        const context = Object.create(this.context)
        context.app = this

        context.correlate(uuid())

        context.state = {}

        context.send = (message: any) => this.send(message, context)
        context.handle = (message: any) => this.handle(message, context)
        context.publish = context.send

        callback(context)
    }

    /**
     * Initialize a new context.
     *
     * @api private
     */

    createContext(message: any) {
        const context = Object.create(this.context)
        context.app = this

        context.message = message
        context.message.is = (type: any) => type === message.type

        if (message.metadata.correlationId) {
            context.correlate(message.metadata.correlationId)
        }
        if (message.metadata.causationId) {
            context.causedBy(message.metadata.causationId)
        }
        if (message.initiator) {
            context.setInitiator(message.initiator)
        }

        context.state = {}

        context.send = (message: any) => this.send(message, context)
        context.publish = context.send
        context.handle = (message: any) => this.handle(message, context)

        return context
    }

    async send(command: any, context_: any) {
        const context = context_ || this.context

        // 1. Add metadata, wrap message
        command.metadata.causationId = context.causationId || command.id
        command.metadata.correlationId = context.correlationId
        command.addInitiator(context.initiator)

        // 2. Send
        await this.transport.send(command)

        // 3. Respond - to middleware!
        return {
            code: 202,
            message: 'Accepted',
            command: command.name,
        }
    }

    async handle(message: any, context_: any) {
        const context = context_ || this.context

        // 1. Add metadata, wrap message
        message.metadata.causationId = context.causationId || message.id
        message.metadata.correlationId = context.correlationId
        message.addInitiator(context.initiator)

        context.message = message
        context.message.is = (type: any) => type === message.type

        const fn = compose(this.middleware)

        if (!this.listenerCount('error')) this.on('error', this.onerror)

        const response = await this.handleMessage(context, fn)

        return (
            response || {
                code: 202,
                message: 'Accepted',
            }
        )
    }

    /**
     * Default error handler.
     *
     * @param {Error} err
     * @api private
     */

    onerror(error: any) {
        // When dealing with cross-globals a normal `instanceof` check doesn't work properly.
        // See https://github.com/koajs/koa/issues/1466
        // We can probably remove it once jest fixes https://github.com/facebook/jest/issues/2549.
        const isNativeError =
            Object.prototype.toString.call(error) === '[object Error]' ||
            error instanceof Error
        if (!isNativeError)
            throw new TypeError(util.format('non-error thrown: %j', error))

        if (404 === error.status || error.expose) return
        // if (this.silent) return

        const message = error.stack || error.toString()
        console.error(`\n${message.replace(/^/gm, '  ')}\n`)
    }

    async respond(context_: any) {
        debug('Respond', context_.message.name)
        // Dispatch Event
        if (context_.message.is('event')) {
            await this.emit(context_.message.name, context_)
        }

        // allow bypassing koa
        if (false === context_.respond) return

        return context_.body
    }
}

/**
 * Make HttpError available to consumers of the library so that consumers don't
 * have a direct dependency upon `http-errors`
 */

module.exports = Omnibus
