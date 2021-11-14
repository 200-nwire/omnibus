'use strict'

/**
 * Module dependencies.
 */

const contentDisposition = require('content-disposition')
const getType = require('cache-content-type')
const onFinish = require('on-finished')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'escape'.
const escape = require('escape-html')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'typeis'.
const typeis = require('type-is').is
const statuses = require('statuses')
const destroy = require('destroy')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'assert'.
const assert = require('assert')
const extname = require('path').extname
const vary = require('vary')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'only'.
const only = require('only')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'util'.
const util = require('util')
const encodeUrl = require('encodeurl')
const Stream = require('stream')

/**
 * Prototype.
 */

module.exports = {
    /**
     * Return the request socket.
     *
     * @return {Connection}
     * @api public
     */

    get socket() {
        return this.res.socket
    },

    /**
     * Return response header.
     *
     * @return {Object}
     * @api public
     */

    get header() {
        const { res } = this
        return typeof res.getHeaders === 'function'
            ? res.getHeaders()
            : res._headers || {} // Node < 7.7
    },

    /**
     * Return response header, alias as response.header
     *
     * @return {Object}
     * @api public
     */

    get headers() {
        return this.header
    },

    /**
     * Get response status code.
     *
     * @return {Number}
     * @api public
     */

    get status() {
        return this.res.statusCode
    },

    /**
     * Set response status code.
     *
     * @param {Number} code
     * @api public
     */

    set status(code) {
        if (this.headerSent) return

        assert(Number.isInteger(code), 'status code must be a number')
        assert(code >= 100 && code <= 999, `invalid status code: ${code}`)
        this._explicitStatus = true
        this.res.statusCode = code
        if (this.req.httpVersionMajor < 2)
            this.res.statusMessage = statuses[code]
        if (this.body && statuses.empty[code]) this.body = null
    },

    /**
     * Get response status message
     *
     * @return {String}
     * @api public
     */

    get message() {
        return this.res.statusMessage || statuses[this.status]
    },

    /**
     * Set response status message
     *
     * @param {String} msg
     * @api public
     */

    set message(message) {
        this.res.statusMessage = message
    },

    /**
     * Get response body.
     *
     * @return {Mixed}
     * @api public
     */

    get body() {
        return this._body
    },

    /**
     * Set response body.
     *
     * @param {String|Buffer|Object|Stream} val
     * @api public
     */

    set body(value) {
        const original = this._body
        this._body = value

        // no content
        if (null == value) {
            if (!statuses.empty[this.status]) this.status = 204
            if (value === null) this._explicitNullBody = true
            this.remove('Content-Type')
            this.remove('Content-Length')
            this.remove('Transfer-Encoding')
            return
        }

        // set the status
        if (!this._explicitStatus) this.status = 200

        // set the content-type only if not yet set
        const setType = !this.has('Content-Type')

        // string
        if ('string' === typeof value) {
            if (setType) this.type = /^\s*</.test(value) ? 'html' : 'text'
            this.length = Buffer.byteLength(value)
            return
        }

        // buffer
        if (Buffer.isBuffer(value)) {
            if (setType) this.type = 'bin'
            this.length = value.length
            return
        }

        // stream
        if (value instanceof Stream) {
            onFinish(this.res, destroy.bind(null, value))
            if (original != value) {
                value.once('error', (error: any) => this.ctx.onerror(error))
                // overwriting
                if (null != original) this.remove('Content-Length')
            }

            if (setType) this.type = 'bin'
            return
        }

        // json
        this.remove('Content-Length')
        this.type = 'json'
    },

    /**
     * Set Content-Length field to `n`.
     *
     * @param {Number} n
     * @api public
     */

    set length(n) {
        this.set('Content-Length', n)
    },

    /**
     * Return parsed response Content-Length when present.
     *
     * @return {Number}
     * @api public
     */

    get length() {
        if (this.has('Content-Length')) {
            return Number.parseInt(this.get('Content-Length'), 10) || 0
        }

        const { body } = this
        if (!body || body instanceof Stream) return undefined
        if ('string' === typeof body) return Buffer.byteLength(body)
        if (Buffer.isBuffer(body)) return body.length
        return Buffer.byteLength(JSON.stringify(body))
    },

    /**
     * Check if a header has been written to the socket.
     *
     * @return {Boolean}
     * @api public
     */

    get headerSent() {
        return this.res.headersSent
    },

    /**
     * Vary on `field`.
     *
     * @param {String} field
     * @api public
     */

    vary(field: any) {
        if (this.headerSent) return

        vary(this.res, field)
    },

    /**
     * Perform a 302 redirect to `url`.
     *
     * The string "back" is special-cased
     * to provide Referrer support, when Referrer
     * is not present `alt` or "/" is used.
     *
     * Examples:
     *
     *    this.redirect('back');
     *    this.redirect('back', '/index.html');
     *    this.redirect('/login');
     *    this.redirect('http://google.com');
     *
     * @param {String} url
     * @param {String} [alt]
     * @api public
     */

    redirect(url: any, alt: any) {
        // location
        if ('back' === url) url = this.ctx.get('Referrer') || alt || '/'
        this.set('Location', encodeUrl(url))

        // status
        if (!statuses.redirect[this.status]) this.status = 302

        // html
        if (this.ctx.accepts('html')) {
            url = escape(url)
            this.type = 'text/html; charset=utf-8'
            this.body = `Redirecting to <a href="${url}">${url}</a>.`
            return
        }

        // text
        this.type = 'text/plain; charset=utf-8'
        this.body = `Redirecting to ${url}.`
    },

    /**
     * Set Content-Disposition header to "attachment" with optional `filename`.
     *
     * @param {String} filename
     * @api public
     */

    attachment(filename: any, options: any) {
        if (filename) this.type = extname(filename)
        this.set('Content-Disposition', contentDisposition(filename, options))
    },

    /**
     * Set Content-Type response header with `type` through `mime.lookup()`
     * when it does not contain a charset.
     *
     * Examples:
     *
     *     this.type = '.html';
     *     this.type = 'html';
     *     this.type = 'json';
     *     this.type = 'application/json';
     *     this.type = 'png';
     *
     * @param {String} type
     * @api public
     */

    set type(type) {
        type = getType(type)
        if (type) {
            this.set('Content-Type', type)
        } else {
            this.remove('Content-Type')
        }
    },

    /**
     * Set the Last-Modified date using a string or a Date.
     *
     *     this.response.lastModified = new Date();
     *     this.response.lastModified = '2013-09-13';
     *
     * @param {String|Date} type
     * @api public
     */

    set lastModified(value) {
        if ('string' === typeof value) value = new Date(value)
        this.set('Last-Modified', value.toUTCString())
    },

    /**
     * Get the Last-Modified date in Date form, if it exists.
     *
     * @return {Date}
     * @api public
     */

    get lastModified() {
        const date = this.get('last-modified')
        if (date) return new Date(date)
    },

    /**
     * Set the ETag of a response.
     * This will normalize the quotes if necessary.
     *
     *     this.response.etag = 'md5hashsum';
     *     this.response.etag = '"md5hashsum"';
     *     this.response.etag = 'W/"123456789"';
     *
     * @param {String} etag
     * @api public
     */

    set etag(value) {
        if (!/^(W\/)?"/.test(value)) value = `"${value}"`
        this.set('ETag', value)
    },

    /**
     * Get the ETag of a response.
     *
     * @return {String}
     * @api public
     */

    get etag() {
        return this.get('ETag')
    },

    /**
     * Return the response mime type void of
     * parameters such as "charset".
     *
     * @return {String}
     * @api public
     */

    get type() {
        const type = this.get('Content-Type')
        if (!type) return ''
        return type.split(';', 1)[0]
    },

    /**
     * Check whether the response is one of the listed types.
     * Pretty much the same as `this.request.is()`.
     *
     * @param {String|String[]} [type]
     * @param {String[]} [types]
     * @return {String|false}
     * @api public
     */

    is(type: any, ...types: any[]) {
        return typeis(this.type, type, ...types)
    },

    /**
     * Return response header.
     *
     * Examples:
     *
     *     this.get('Content-Type');
     *     // => "text/plain"
     *
     *     this.get('content-type');
     *     // => "text/plain"
     *
     * @param {String} field
     * @return {String}
     * @api public
     */

    get(field: any) {
        return this.header[field.toLowerCase()] || ''
    },

    /**
     * Returns true if the header identified by name is currently set in the outgoing headers.
     * The header name matching is case-insensitive.
     *
     * Examples:
     *
     *     this.has('Content-Type');
     *     // => true
     *
     *     this.get('content-type');
     *     // => true
     *
     * @param {String} field
     * @return {boolean}
     * @api public
     */

    has(field: any) {
        return typeof this.res.hasHeader === 'function'
            ? this.res.hasHeader(field)
            : // Node < 7.7
              field.toLowerCase() in this.headers
    },

    /**
     * Set header `field` to `val` or pass
     * an object of header fields.
     *
     * Examples:
     *
     *    this.set('Foo', ['bar', 'baz']);
     *    this.set('Accept', 'application/json');
     *    this.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' });
     *
     * @param {String|Object|Array} field
     * @param {String} val
     * @api public
     */

    set(field: any, value: any) {
        if (this.headerSent) return

        if (2 === arguments.length) {
            if (Array.isArray(value))
                value = value.map((v) =>
                    typeof v === 'string' ? v : String(v)
                )
            else if (typeof value !== 'string') value = String(value)
            this.res.setHeader(field, value)
        } else {
            for (const key in field) {
                this.set(key, field[key])
            }
        }
    },

    /**
     * Append additional header `field` with value `val`.
     *
     * Examples:
     *
     * ```
     * this.append('Link', ['<http://localhost/>', '<http://localhost:3000/>']);
     * this.append('Set-Cookie', 'foo=bar; Path=/; HttpOnly');
     * this.append('Warning', '199 Miscellaneous warning');
     * ```
     *
     * @param {String} field
     * @param {String|Array} val
     * @api public
     */

    append(field: any, value: any) {
        const previous = this.get(field)

        if (previous) {
            value = Array.isArray(previous)
                ? previous.concat(value)
                : [previous].concat(value)
        }

        return this.set(field, value)
    },

    /**
     * Remove header `field`.
     *
     * @param {String} name
     * @api public
     */

    remove(field: any) {
        if (this.headerSent) return

        this.res.removeHeader(field)
    },

    /**
     * Checks if the request is writable.
     * Tests for the existence of the socket
     * as node sometimes does not set it.
     *
     * @return {Boolean}
     * @api private
     */

    get writable() {
        // can't write any more after response finished
        // response.writableEnded is available since Node > 12.9
        // https://nodejs.org/api/http.html#http_response_writableended
        // response.finished is undocumented feature of previous Node versions
        // https://stackoverflow.com/questions/16254385/undocumented-response-finished-in-node-js
        if (this.res.writableEnded || this.res.finished) return false

        const socket = this.res.socket
        // There are already pending outgoing res, but still writable
        // https://github.com/nodejs/node/blob/v4.4.7/lib/_http_server.js#L486
        if (!socket) return true
        return socket.writable
    },

    /**
     * Inspect implementation.
     *
     * @return {Object}
     * @api public
     */

    inspect() {
        if (!this.res) return
        const o = this.toJSON()
        o.body = this.body
        return o
    },

    /**
     * Return JSON representation.
     *
     * @return {Object}
     * @api public
     */

    toJSON() {
        return only(this, ['status', 'message', 'header'])
    },

    /**
     * Flush any set headers and begin the body
     */

    flushHeaders() {
        this.res.flushHeaders()
    },
}

/**
 * Custom inspection implementation for node 6+.
 *
 * @return {Object}
 * @api public
 */

/* istanbul ignore else */
if (util.inspect.custom) {
    module.exports[util.inspect.custom] = module.exports.inspect
}
