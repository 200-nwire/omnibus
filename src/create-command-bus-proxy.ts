const {
    // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'camelCase'... Remove this comment to see the full error message
    camelCase,
    // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'upperFirst... Remove this comment to see the full error message
    upperFirst,
    // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'isDirector... Remove this comment to see the full error message
    isDirectory,
    // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'isFunction... Remove this comment to see the full error message
    isFunction,
    // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'walkSync'.
    walkSync,
} = require('./utils')

const cachedCommands = {}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'CreateComm... Remove this comment to see the full error message
function CreateCommandBusProxy(commandBus: any, commandsDir: any) {
    if (!commandsDir || !isDirectory(commandsDir)) {
        throw new Error('Invalid commands path.')
    }

    const availableCommands = walkSync(commandsDir)

    return new Proxy(
        {},
        {
            get(target, propertyKey) {
                const commandName = `${upperFirst(
                    camelCase(propertyKey)
                )}Command.js`

                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                if (!cachedCommands[commandName]) {
                    const foundCommand = availableCommands.find((command: any) => command.endsWith(commandName)
                    )

                    if (!foundCommand) {
                        throw new Error(`Command "${commandName}" not found.`)
                    }

                    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                    cachedCommands[commandName] = require(foundCommand)
                }

                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                const Command = cachedCommands[commandName]

                if (isFunction(Command) === false) {
                    throw new Error(`Command "${commandName}" is not callable.`)
                }

                return (...arguments_: any[]) =>
                    commandBus.handle(new Command(...arguments_));
            },
        }
    );
}

module.exports = CreateCommandBusProxy
