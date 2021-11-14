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
            // required: ['name', 'id'],
            additionalProperties: false,
        },
        name: { type: 'string', minLength: 1 },
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
                published: { type: 'boolean' },
                correlationId: { type: 'string' },
                causationId: { type: 'string' },
            },
            required: ['timestamp', 'published'],
            additionalProperties: true,
        },
        type: { type: 'string', minLength: 1 },
    },
    required: ['aggregate', 'name', 'id', 'data', 'metadata', 'type'],
    additionalProperties: false,
})

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Event'.
class Event {
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
     */
    // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'name' implicitly has an 'any' type.
    constructor(data = {}, name = null) {
        this.aggregate = {}
        this.name = name || nameFromClass(this.constructor.name, 'Event')
        this.id = uuid()
        this.type = 'event'

        this.data = data
        this.initiator = null
        this.metadata = {
            timestamp: new Date().getTime(),
            published: false,
        }

        value.validate(this, { valueName: 'event' })
    }

    addAggregate(aggregate: any) {
        this.aggregate = aggregate
    }

    addInitiator(initiator: any) {
        if (!initiator) {
            throw new Error('Initiator is missing.')
        }
        // if (!initiator.id) {
        //     throw new Error('Initiator id is missing.')
        // }

        this.initiator = {
            type: initiator.type,
        }

        if (initiator.id) {
            this.initiator.id = initiator.id
        }
    }

    payload() {
        return this.data
    }

    static deserialize({
        aggregate,
        name,
        id,
        initiator,
        metadata,
        data
    }: any) {
        const event = new Event(data, name)

        event.aggregate = aggregate
        event.id = id
        event.metadata = metadata

        if (initiator && initiator.type) {
            event.addInitiator(initiator)
        }

        value.validate(event, { valueName: 'event' })

        return event
    }

    static isWellFormed(event: any) {
        if (!event) {
            return false
        }

        return value.isValid(event)
    }
}

module.exports = Event
