import { useEffect, useRef, useCallback } from 'react';

// React hook for interacting with the wasmWorker (a web worker)
export function useWasmWorker() {
	const workerRef = useRef(); // Current web worker instance
	const idRef = useRef(0); // Unique ID counter for async responses (see call below)
	const callbacks = useRef(new Map()); // Maps IDs to resolve/reject handlers

	// initialize once
	useEffect(() => {
		workerRef.current = new Worker(new URL('@workers/wasmWorker.js', import.meta.url), { type: 'module' });

		// Listen to messages from web worker
		workerRef.current.onmessage = ({ data }) => {
			const { id, error, output, returnValue } = data;
			const cb = callbacks.current.get(id);
			if (!cb) return;
			// Handle promise based on ID
			error ? cb.reject(error) : cb.resolve({ output, returnValue });
			callbacks.current.delete(id);
		};

		return () => workerRef.current.terminate();
	}, []);

	// Send a task to the worker
	const call = useCallback((funcName, args = {}, bufferKeys = []) => {
		const id = idRef.current++;

		return new Promise((resolve, reject) => {
			callbacks.current.set(id, { resolve, reject });
			workerRef.current.postMessage({ id, funcName, args, bufferKeys });
		});
	}, []);

	return { call };
}
