"use strict";

/**
 * Computes a value on first access and reuses it for all subsequent accesses.
 * @template T
 */
class Lazy {
	/**
	 * @param {() => T} supplier Value factory invoked at most once before reset.
	 */
	constructor(supplier) {
		if (typeof supplier !== "function") {
			throw new TypeError("Lazy expects a supplier function.");
		}
		this.supplier = supplier;
		this.hasValue = false;
		this.value = undefined;
	}

	/** @returns {T} The cached value, including an explicitly returned `undefined`. */
	get() {
		if (!this.hasValue) {
			this.value = this.supplier();
			this.hasValue = true;
		}
		return this.value;
	}

	/** Forces the supplier to run again on the next call to {@link get}. */
	reset() {
		this.value = undefined;
		this.hasValue = false;
	}
}

module.exports = { Lazy };
