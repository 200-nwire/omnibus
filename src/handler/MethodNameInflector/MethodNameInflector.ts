module.exports = class MethodNameInflector {
// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'command' implicitly has an 'any' type.
	inflect(command) {
		throw new Error('inflect method must be implemented');
	}
}
