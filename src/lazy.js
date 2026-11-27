"use strict";

/**
 * Computes a value on first access and reuses it until reset.
 * The explicit `hasValue` flag also supports suppliers whose valid result is `undefined`.
 * @template T
 */
class Lazy {
	/** @param {() => T} supplier Value factory invoked on the first `get()` after reset. */
	constructor(supplier) {
		if (typeof supplier !== "function") throw new TypeError("Lazy expects a supplier function.");
		this.supplier = supplier;
		this.hasValue = false;
		this.value = undefined;
	}
	/** @returns {T} Cached value, computing it once when necessary. */
	get() {
		if (!this.hasValue) {
			this.value = this.supplier();
			this.hasValue = true;
		}
		return this.value;
	}
	/** Invalidates the cached value so the next `get()` invokes the supplier again. 
	 * @returns {void} Clears the cached value so the next read invokes the factory again.
	 */
	reset() {
		this.value = undefined;
		this.hasValue = false;
	}
}

module.exports = { Lazy };