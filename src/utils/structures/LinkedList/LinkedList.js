import Node from './Node';

export default class LinkedHistory {
	constructor(initialValue, onChange = (current) => {}) {
		this.head = new Node(initialValue);
		this.current = this.head;
		this.onChange = onChange; // Optional callback
	}

	get value() { return this.current.value; }

	get canUndo() { return !!this.current.prev; }

	get canRedo() { return !!this.current.next; }

	set(value) {
		const newNode = new Node(value, this.current);
		this.current.next = newNode;
		this.current = newNode;
		this.onChange(this.value);
	}

	undo() {
		if (!this.canUndo) { return; }

		this.current = this.current.prev;
		this.onChange(this.value);
	}

	redo() {
		if (!this.canRedo) { return; }

		this.current = this.current.next;
		this.onChange(this.value);
	}

	reset(value) {
		this.head = new Node(value);
		this.current = this.head;
		this.onChange(this.value);
	}

	// Attach a change listener (React hook uses this)
	attach(onChange) { this.onChange = onChange; }
}
