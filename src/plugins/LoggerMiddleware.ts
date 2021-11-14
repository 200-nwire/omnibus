// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Middleware... Remove this comment to see the full error message
const Middleware = require('../middleware')

module.exports = class LoggerMiddleware extends Middleware {
    constructor(logger: any) {
        super()
        this.logger = logger
    }

    execute(context: any, next: any) {
        this.logger.log(
            `[${context.command.metadata.correlationId}]`,
            '[command]',
            context.command.name
        )
        return next(context).then((result: any) => {
            return (
                result || {
                    code: 202,
                    message: 'Accepted',
                }
            )
        });
    }
}
