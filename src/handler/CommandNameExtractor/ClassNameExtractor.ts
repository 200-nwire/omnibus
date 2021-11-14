// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'has'.
const { has, isObject, isString } = require('lodash')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'CommandNam... Remove this comment to see the full error message
const CommandNameExtractor = require('./CommandNameExtractor')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'InvalidCom... Remove this comment to see the full error message
const InvalidCommandException = require('../../exceptions/InvalidCommandException')

module.exports = class ClassNameExtractor extends CommandNameExtractor {
    extractName(command: any) {
        if (isObject(command) === false || isString(command.name) === false) {
            throw new InvalidCommandException('Invalid Command Name.')
        }

        return command.name
    }
}
