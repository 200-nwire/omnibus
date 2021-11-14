const fs = require('fs')
const path = require('path')
const capitalizeStr = require('lodash/capitalize')
const camelCaseStr = require('lodash/camelCase')
const upperFirstStr = require('lodash/upperFirst')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'isDirector... Remove this comment to see the full error message
const isDirectory = (dir: any) => fs.lstatSync(dir).isDirectory()

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'walkSync'.
const walkSync = (file: any) => isDirectory(file)
    ? fs.readdirSync(file).map((f: any) => walkSync(path.join(file, f)))
    : file

const capitalize = (s: any) => capitalizeStr(s)

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'camelCase'... Remove this comment to see the full error message
const camelCase = (s: any) => camelCaseStr(s)

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'upperFirst... Remove this comment to see the full error message
const upperFirst = (s: any) => upperFirstStr(s)

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'isString'.
const isString = (s: any) => typeof s === 'string'

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'isFunction... Remove this comment to see the full error message
const isFunction = (f: any) => typeof f === 'function'

module.exports = {
    isDirectory,
    walkSync,
    capitalize,
    camelCase,
    upperFirst,
    isString,
    isFunction,
}
