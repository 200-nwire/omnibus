// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Middleware... Remove this comment to see the full error message
const Middleware = require('./src/middleware')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'CommandBus... Remove this comment to see the full error message
const CommandBus = require('./src/command-bus')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'CreateComm... Remove this comment to see the full error message
const CreateCommandBusProxy = require('./src/create-command-bus-proxy')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'InvalidMid... Remove this comment to see the full error message
const InvalidMiddlewareException = require('./src/exceptions/InvalidMiddlewareException')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'InvalidCom... Remove this comment to see the full error message
const InvalidCommandException = require('./src/exceptions/InvalidCommandException')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'InvalidHan... Remove this comment to see the full error message
const InvalidHandlerMethodException = require('./src/exceptions/InvalidHandlerMethodException')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'MissingHan... Remove this comment to see the full error message
const MissingHandlerException = require('./src/exceptions/MissingHandlerException')
const LoggerMiddleware = require('./src/plugins/LoggerMiddleware')
const EventBusMIddlewere = require('./src/plugins/EventBusMIddlewere')
const CommandHandlerMiddleware = require('./src/handler/CommandHandlerMiddleware')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'CommandNam... Remove this comment to see the full error message
const CommandNameExtractor = require('./src/handler/CommandNameExtractor/CommandNameExtractor')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'MethodName... Remove this comment to see the full error message
const MethodNameInflector = require('./src/handler/MethodNameInflector/MethodNameInflector')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'HandlerLoc... Remove this comment to see the full error message
const HandlerLocator = require('./src/handler/Locator/HandlerLocator')
const ClassNameExtractor = require('./src/handler/CommandNameExtractor/ClassNameExtractor')
const HandleInflector = require('./src/handler/MethodNameInflector/HandleInflector')
const InMemoryLocator = require('./src/handler/Locator/InMemoryLocator')
const NamespaceHandlerLocator = require('./src/handler/Locator/NamespaceHandlerLocator')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Omnibus'.
const Omnibus = require('./src/onion/application')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'OmnibusBul... Remove this comment to see the full error message
const { OmnibusBullTransport, MemoryTransport, ServiceBusTransport } = require('./src/transports')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Event'.
const Event = require('./src/onion/event')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Command'.
const Command = require('./src/onion/command')

module.exports = CommandBus

module.exports = {
    CommandBus,
    Middleware,
    Command,
    Event,
    CreateCommandBusProxy,
    InvalidMiddlewareException,
    InvalidCommandException,
    InvalidHandlerMethodException,
    MissingHandlerException,
    CommandHandlerMiddleware,
    CommandNameExtractor,
    MethodNameInflector,
    HandlerLocator,
    LoggerMiddleware,
    EventBusMIddlewere,
    ClassNameExtractor,
    HandleInflector,
    InMemoryLocator,
    NamespaceHandlerLocator,
    Omnibus,
    OmnibusBullTransport,
    MemoryTransport,
    ServiceBusTransport,
}
