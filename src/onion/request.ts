'use strict'

/**
 * Module dependencies.
 */

const accepts = require('accepts')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'typeis'.
const typeis = require('type-is')
const fresh = require('fresh')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'only'.
const only = require('only')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'util'.
const util = require('util')

/**
 * Prototype.
 */

module.exports = {
    /**
     * Return request header.
     *
     * @return {Object}
     * @api public
     */

    get header() {
        return this.req.headers
    },

    /**
     * Set request header.
     *
     * @api public
     */

    set header(value) {
        this.req.headers = value
    },

    /**
     * Return request header, alias as request.header
     *
     * @return {Object}
     * @api public
     */

    get headers() {
        return this.req.headers
    },

    /**
     * Set request header, alias as request.header
     *
     * @api public
     */

    set headers(value) {
        this.req.headers = value
    },

    /**
     * Get origin of URL.
     *
     * @return {String}
     * @api public
     */

    get origin() {
        return `${this.protocol}://${this.host}`
    },

    /**
     * Parse the "Host" header field host
     * and support X-Forwarded-Host when a
     * proxy is enabled.
     *
     * @return {String} hostname:port
     * @api public
     */

    get host() {
        const proxy = this.app.proxy
        let host = proxy && this.get('X-Forwarded-Host')
        if (!host) {
            if (this.req.httpVersionMajor >= 2) host = this.get(':authority')
            if (!host) host = this.get('Host')
        }
        if (!host) return ''
        return host.split(/\s*,\s*/, 1)[0];
    },

    /**
     * Parse the "Host" header field hostname
     * and support X-Forwarded-Host when a
     * proxy is enabled.
     *
     * @return {String} hostname
     * @api public
     */

    get hostname() {
        const host = this.host
        if (!host) return ''
        if ('[' === host[0]) return this.URL.hostname || '' // IPv6
        return host.split(':', 1)[0]
    },

    /**
     * Check if the request is fresh, aka
     * Last-Modified and/or the ETag
     * still match.
     *
     * @return {Boolean}
     * @api public
     */

    get fresh() {
        const method = this.method
        const s = this.ctx.status

        // GET or HEAD for weak freshness validation only
        if ('GET' !== method && 'HEAD' !== method) return false

        // 2xx or 304 as per rfc2616 14.26
        if ((s >= 200 && s < 300) || 304 === s) {
            return fresh(this.header, this.response.header)
        }

        return false
    },

    /**
     * Check if the request is stale, aka
     * "Last-Modified" and / or the "ETag" for the
     * resource has changed.
     *
     * @return {Boolean}
     * @api public
     */

    get stale() {
        return !this.fresh
    },

    /**
     * Get accept object.
     * Lazily memoized.
     *
     * @return {Object}
     * @api private
     */

    get accept() {
        return this._accept || (this._accept = accepts(this.req))
    },

    /**
     * Set accept object.
     *
     * @param {Object}
     * @api private
     */

    set accept(object) {
        this._accept = object
    },

    /**
     * Check if the given `type(s)` is acceptable, returning
     * the best match when true, otherwise `false`, in which
     * case you should respond with 406 "Not Acceptable".
     *
     * The `type` value may be a single mime type string
     * such as "application/json", the extension name
     * such as "json" or an array `["json", "html", "text/plain"]`. When a list
     * or array is given the _best_ match, if any is returned.
     *
     * Examples:
     *
     *     // Accept: text/html
     *     this.accepts('html');
     *     // => "html"
     *
     *     // Accept: text/*, application/json
     *     this.accepts('html');
     *     // => "html"
     *     this.accepts('text/html');
     *     // => "text/html"
     *     this.accepts('json', 'text');
     *     // => "json"
     *     this.accepts('application/json');
     *     // => "application/json"
     *
     *     // Accept: text/*, application/json
     *     this.accepts('image/png');
     *     this.accepts('png');
     *     // => false
     *
     *     // Accept: text/*;q=.5, application/json
     *     this.accepts(['html', 'json']);
     *     this.accepts('html', 'json');
     *     // => "json"
     *
     * @param {String|Array} type(s)...
     * @return {String|Array|false}
     * @api public
     */

    accepts(...arguments_: any[]) {
        return this.accept.types(...arguments_)
    },

    /**
     * Check if the incoming request contains the "Content-Type"
     * header field and if it contains any of the given mime `type`s.
     * If there is no request body, `null` is returned.
     * If there is no content type, `false` is returned.
     * Otherwise, it returns the first `type` that matches.
     *
     * Examples:
     *
     *     // With Content-Type: text/html; charset=utf-8
     *     this.is('html'); // => 'html'
     *     this.is('text/html'); // => 'text/html'
     *     this.is('text/*', 'application/json'); // => 'text/html'
     *
     *     // When Content-Type is application/json
     *     this.is('json', 'urlencoded'); // => 'json'
     *     this.is('application/json'); // => 'application/json'
     *     this.is('html', 'application/*'); // => 'application/json'
     *
     *     this.is('html'); // => false
     *
     * @param {String|String[]} [type]
     * @param {String[]} [types]
     * @return {String|false|null}
     * @api public
     */

    is(type: any, ...types: any[]) {
        return typeis(this.req, type, ...types)
    },

    /**
     * Return the request mime type void of
     * parameters such as "charset".
     *
     * @return {String}
     * @api public
     */

    get type() {
        const type = this.get('Content-Type')
        if (!type) return ''
        return type.split(';')[0]
    },

    /**
     * Inspect implementation.
     *
     * @return {Object}
     * @api public
     */

    inspect() {
        if (!this.req) return
        return this.toJSON()
    },

    /**
     * Return JSON representation.
     *
     * @return {Object}
     * @api public
     */

    toJSON() {
        return only(this, ['method', 'url', 'header'])
    },
}

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
