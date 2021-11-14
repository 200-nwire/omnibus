'use strict'

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'uuid'.
const { uuid, regex: uuidRegex } = require('uuidv4'),
    // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Value'.
    { Value } = require('validate-value')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'nameFromCl... Remove this comment to see the full error message
const nameFromClass = (string: any, strip = 'when.') =>
    string
        .replace(/([\da-z]|(?=[A-Z]))([A-Z])/g, '$1.$2')
        .replace(strip, '')
        .replace(/^\.|\.$/g, '')
        .toLowerCase()

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'value'.
const value = new Value({
    type: 'object',
    properties: {
        aggregate: {
            type: 'object',
            properties: {
                name: { type: 'string', minLength: 1, format: 'alphanumeric' },
                id: { type: 'string', minLength: 1 },
            },
            required: ['name', 'id'],
            additionalProperties: false,
        },
        name: { type: 'string', minLength: 1 },
        type: { type: 'string', minLength: 1 },
        id: { type: 'string' },
        data: {
            type: 'object',
            properties: {},
            required: [],
            additionalProperties: true,
        },
        initiator: {
            oneOf: [
                {
                    type: 'null',
                },
                {
                    type: 'object',
                    properties: {
                        id: { type: 'string', minLength: 1 },
                        type: { type: 'string', minLength: 1 },
                    },
                    required: ['type'],
                    additionalProperties: false,
                },
            ],
        },
        metadata: {
            type: 'object',
            properties: {
                timestamp: { type: 'number' },
                correlationId: { type: 'string' },
                causationId: { type: 'string' },
            },
            required: ['timestamp', 'correlationId', 'causationId'],
            additionalProperties: false,
        },
    },
    required: ['aggregate', 'name', 'id', 'data', 'metadata', 'type'],
    additionalProperties: false,
})

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Command'.
class Command {
    aggregate: any;
    data: any;
    id: any;
    initiator: any;
    metadata: any;
    name: any;
    type: any;
    /**
     *
     * @param data
     * @param aggregate
     */
    // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'name' implicitly has an 'any' typ... Remove this comment to see the full error message
    constructor({ data = {}, aggregate = { id: uuid(), name: 'noname' }, name = null }) {
        this.aggregate = aggregate
        this.name = name || nameFromClass(this.constructor.name, 'Command')
        this.type = 'command'
        this.id = uuid()
        this.initiator = null
        this.data = data
        this.metadata = {
            timestamp: Date.now(),
            correlationId: this.id,
            causationId: this.id,
        }

        value.validate(this, { valueName: 'command' })
    }

    addInitiator({
        id,
        type = 'anonymous'
    }: any) {
        this.initiator = {
            type,
        }

        if (id) {
            this.initiator.id = id
        }
    }

    static deserialize({
        aggregate,
        name,
        id,
        initiator,
        metadata,
        data
    }: any) {
        const command = new Command({ name, aggregate, data })

        command.id = id
        command.metadata = metadata

        if (initiator && initiator.type) {
            command.addInitiator(initiator)
        }

        value.validate(command, { valueName: 'command' })

        return command
    }

    static isWellFormed(command: any) {
        if (!command) {
            return false
        }

        return value.isValid(command)
    }
}

module.exports = Command
