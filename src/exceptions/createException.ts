module.exports = function createException(name: any, options: any) {
    class Exception {
        code: any;
        message: any;
        stack: any;
        constructor(message: any, code: any) {
            if (Error.captureStackTrace) {
                Error.captureStackTrace(this, this.constructor)
            } else {
                this.stack = new Error().stack
            }

            this.message = options.message || message
            this.code = options.code || code
        }
    }

    // @ts-expect-error ts-migrate(2741) FIXME: Property 'code' is missing in type 'Error' but req... Remove this comment to see the full error message
    Exception.prototype = new Error()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'name' does not exist on type 'Exception'... Remove this comment to see the full error message
    Exception.prototype.name = name
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'type' does not exist on type 'Exception'... Remove this comment to see the full error message
    Exception.prototype.type = 'Exception'
    Exception.prototype.constructor = Exception

    return Exception
}
