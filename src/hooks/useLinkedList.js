import { useState, useMemo, useEffect } from 'react';
import { LinkedList } from '@utils/structures/LinkedList';

export default function useLinkedList(initialValue) {
	const [value, setValue] = useState(initialValue);

	const history = useMemo(() => {
		const h = new LinkedList(initialValue);
		h.attach(setValue);
		return h;
	}, []);

	useEffect(() => {
		history.attach(setValue); // Sync any state on mount
	}, [history]);

	return {
		value,
		canUndo: history.canUndo,
		canRedo: history.canRedo,
		set: (v) => history.set(v),
		undo: () => history.undo(),
		redo: () => history.redo(),
		reset: (v) => history.reset(v),
		history,
	};
}
