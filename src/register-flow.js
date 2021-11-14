function isFunction(value) {
    return typeof value === 'function'
}
function flattenObject(ob) {
    let toReturn = {}

    for (let i in ob) {
        if (!ob.hasOwnProperty(i)) continue

        if (typeof ob[i] == 'object' && ob[i] !== null) {
            let flatObject = flattenObject(ob[i])
            for (let x in flatObject) {
                if (!flatObject.hasOwnProperty(x)) continue

                toReturn[i + '.' + x] = flatObject[x]
            }
        } else {
            toReturn[i] = ob[i]
        }
    }
    return toReturn
}
function updateContext(context, _event, assignment) {
    let partialUpdate = {}
    if (isFunction(assignment)) {
        partialUpdate = assignment(context, _event)
    } else {
        for (const key of Object.keys(assignment)) {
            const propAssignment = assignment[key]

            partialUpdate[key] = isFunction(propAssignment)
                ? propAssignment(context, _event)
                : propAssignment
        }
    }
    return Object.assign({}, context, partialUpdate)
}
const getMethods = (object) =>
    Object.getOwnPropertyNames(object).filter(
        (item) => typeof object[item] === 'function'
    )
const eventName = (string, strip = 'when.') =>
    string
        .replace(/([\da-z]|(?=[A-Z]))([A-Z])/g, '$1.$2')
        .replace(strip, '')
        .replace(/^\.|\.$/g, '')
        .toLowerCase()
let listeners = require('require-dir')('./workflow', { extensions: ['.js'] })

module.exports = (Bus, container) => {
    let storage = container.resolve('storage')

    Object.values(listeners).forEach((listener) => {
        getMethods(listener).forEach((handler) => {
            let method = listener[handler]
            Bus.on(eventName(handler), async (context) => {
                console.log(context.message.name, 'BEFORE:SAGA')

                try {
                    let query = {}

                    if (
                        listener['mappings'] &&
                        listener['mappings'][context.message.name]
                    ) {
                        query = updateContext(
                            query,
                            context.message,
                            listener['mappings'][context.message.name]
                        )
                    }
                    context.state = await storage.loadSaga(
                        listener['name'] + ':' + context.message.aggregate.name,
                        context.message.aggregate.id,
                        flattenObject({ payload: query })
                    )

                    if (context.state.status === 'completed') {
                        // throw new Error('saga already done')
                        console.log(
                            listener['name'],
                            'already completed, skipping',
                            context.message.name
                        )
                        // TODO: FIX the saga flow!!
                        // return
                    }
                } catch (error) {
                    console.log(error.message)
                    context.state = listener['initialState'] || {}
                    //throw new Error('no flow found')
                }

                context.assign = (assignment) => {
                    context.state = updateContext(
                        context.state,
                        context.message,
                        assignment
                    )
                }

                let sagaObj = {
                    complete(assignment = {}) {
                        assignment.status = 'completed'
                        context.assign(assignment)
                    },
                }

                await method.call(sagaObj, context)

                console.log(context.message.name, 'AFTER:SAGA', context.state)
                if (context.state) {
                    await storage.saveSaga(
                        listener['name'] + ':' + context.message.aggregate.name,
                        context.message.aggregate.id,
                        context.state
                    )
                }
            })

            Bus.use(async (context, next) => {
                if (
                    listener['starts'] &&
                    listener['starts'].includes(context.message.name)
                ) {
                    try {
                        await storage.loadSaga(
                            listener['name'] +
                                ':' +
                                context.message.aggregate.name,
                            context.message.aggregate.id
                        )

                        console.log(
                            listener['name'],
                            'already started',
                            context.message.name
                        )

                        return await next()
                    } catch (error) {
                        console.log(error.message)
                    }

                    console.log(
                        listener['name'],
                        'started by',
                        context.message.name
                    )

                    const handlerName =
                        'handle' +
                        context.message.name
                            .replace(/^\w|[A-Z]|\b\w/g, (word) =>
                                word.toUpperCase()
                            )
                            .replace(/\./g, '')
                            .replace(/\s+/g, '')

                    console.log(context.message.name, 'BEFORE:SAGA')

                    context.state = listener['initialState'] || {}

                    context.assign = (assignment) => {
                        context.state = updateContext(
                            context.state,
                            context.message,
                            assignment
                        )
                    }

                    if (listener[handlerName]) {
                        await listener[handlerName](context)
                    }

                    console.log(
                        context.message.name,
                        'AFTER:SAGA',
                        context.state
                    )

                    await storage.saveSaga(
                        listener['name'] + ':' + context.message.aggregate.name,
                        context.message.aggregate.id,
                        context.state
                    )
                }

                await next()
            })
        })
    })

    const { whitelist, handler } = require('./broadcast')
    Bus.on(whitelist, handler)
}
