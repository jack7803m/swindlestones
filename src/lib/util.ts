/**
 * Creates a logger object with log, warn, and error functions.
 * Primarily useful in functions with lots of repetitive error cases when you always want the same data logged out.
 * @param data - Additional data object to be logged with each message.
 * @returns An object with log, warn, and error functions.
 */
export function createLogger(data: any) {
	function log(message: string) {
		console.log(message, data);
	}

	function warn(message: string) {
		console.warn(message, data);
	}

	function error(message: string) {
		console.warn(message, data);
	}

	return {
		log,
		warn,
		error
	};
}
