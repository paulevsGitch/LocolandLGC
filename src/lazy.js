/**
 * Provides a value if it is cached, if not then creates it and caches.
 * @template T
 */
class Lazy {
	/**
	 * @param {() => T} supplier 
	 */
	constructor(supplier) {
		this.supplier = supplier;
	}

	/**
	 * @returns {T}
	 */
	get() {
		let value = this.value;
		if (value === undefined) {
			value = this.supplier();
			this.value = value;
		}
		return value;
	}
}

module.exports = {
	Lazy
};
