//#region src/imageToUint8ClampedArray.js
/**
* @packageDocumentation
* Convenience image conversion utility to ensure type compatibility with the library.
*
* @file Convenience utility function.
*
* @module image-utils
* @license MIT
* @copyright Ryan Millard 2026
* @author Ryan Millard
* @since 0.0.0
*
* @exports imageToUint8ClampedArray
*/
/**
* @summary Convert an image file into a `Uint8ClampedArray` of pixel data (RGBA).
*
* @function imageToUint8ClampedArray
* @async
* @description
* Reads an image file (PNG, JPEG, etc.) and returns its pixel data as a `Uint8ClampedArray`.
* Each pixel consists of four consecutive values: red, green, blue, and alpha (RGBA).
* Also returns the image's original width and height. Useful for canvas operations,
* image processing, WebGL textures, or computer vision tasks.
*
*
* @param {File} file - The image file to process. Must be a valid `File` object, e.g., from an `<input type="file">` element.
*
* @returns {Promise<{pixels: Uint8ClampedArray, width: number, height: number}>}
* A Promise resolving to an object containing:
* - `pixels`: A `Uint8ClampedArray` of RGBA pixel values.
* - `width`: Width of the image in pixels.
* - `height`: Height of the image in pixels.
*
* @throws {Error} Will not throw in current implementation, but could reject if the image fails to load.
*
* @example
* const fileInput = document.querySelector("#fileInput");
* fileInput.addEventListener("change", async (event) => {
*   const file = event.target.files[0];
*   const { pixels, width, height } = await imageToUint8ClampedArray(file);
*   console.log("Width:", width, "Height:", height);
*   console.log("Pixels:", pixels);
* });
*
* @todo Add error handling for invalid or corrupt image files.
* @variation Standard image file input
*/
function imageToUint8ClampedArray(file) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const objectUrl = URL.createObjectURL(file);
		img.onload = () => {
			URL.revokeObjectURL(objectUrl);
			const canvas = document.createElement("canvas");
			canvas.width = img.width;
			canvas.height = img.height;
			const ctx = canvas.getContext("2d");
			ctx.drawImage(img, 0, 0);
			const { data } = ctx.getImageData(0, 0, img.width, img.height);
			resolve({
				pixels: data,
				width: img.width,
				height: img.height
			});
		};
		img.onerror = () => {
			URL.revokeObjectURL(objectUrl);
			reject(/* @__PURE__ */ new Error("Failed to load image"));
		};
		img.src = objectUrl;
	});
}
//#endregion
//#region \0@oxc-project+runtime@0.137.0/helpers/esm/typeof.js
function _typeof(o) {
	"@babel/helpers - typeof";
	return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
		return typeof o;
	} : function(o) {
		return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
	}, _typeof(o);
}
//#endregion
//#region \0@oxc-project+runtime@0.137.0/helpers/esm/toPrimitive.js
function toPrimitive(t, r) {
	if ("object" != _typeof(t) || !t) return t;
	var e = t[Symbol.toPrimitive];
	if (void 0 !== e) {
		var i = e.call(t, r || "default");
		if ("object" != _typeof(i)) return i;
		throw new TypeError("@@toPrimitive must return a primitive value.");
	}
	return ("string" === r ? String : Number)(t);
}
//#endregion
//#region \0@oxc-project+runtime@0.137.0/helpers/esm/toPropertyKey.js
function toPropertyKey(t) {
	var i = toPrimitive(t, "string");
	return "symbol" == _typeof(i) ? i : i + "";
}
//#endregion
//#region \0@oxc-project+runtime@0.137.0/helpers/esm/defineProperty.js
function _defineProperty(e, r, t) {
	return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
		value: t,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[r] = t, e;
}
//#endregion
//#region build-wasm/web/img2num.js
var createImg2NumModule = (() => {
	return (async function(moduleArg = {}) {
		var moduleRtn;
		var Module = moduleArg;
		var ENVIRONMENT_IS_WEB = typeof window == "object";
		var ENVIRONMENT_IS_WORKER = typeof WorkerGlobalScope != "undefined";
		typeof process == "object" && process.versions?.node && process.type;
		var thisProgram = "./this.program";
		var quit_ = (status, toThrow) => {
			throw toThrow;
		};
		var _scriptName = import.meta.url;
		var scriptDirectory = "";
		function locateFile(path) {
			if (Module["locateFile"]) return Module["locateFile"](path, scriptDirectory);
			return scriptDirectory + path;
		}
		var readAsync, readBinary;
		if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
			try {
				scriptDirectory = new URL(".", _scriptName).href;
			} catch {}
			if (ENVIRONMENT_IS_WORKER) readBinary = (url) => {
				var xhr = new XMLHttpRequest();
				xhr.open("GET", url, false);
				xhr.responseType = "arraybuffer";
				xhr.send(null);
				return new Uint8Array(xhr.response);
			};
			readAsync = async (url) => {
				var response = await fetch(url, { credentials: "same-origin" });
				if (response.ok) return response.arrayBuffer();
				throw new Error(response.status + " : " + response.url);
			};
		}
		var out = console.log.bind(console);
		var err = console.error.bind(console);
		var wasmBinary;
		var ABORT = false;
		var EXITSTATUS;
		function assert(condition, text) {
			if (!condition) abort(text);
		}
		var readyPromiseResolve, readyPromiseReject;
		var wasmMemory, HEAP8, HEAPU8, HEAP16, HEAP32, HEAPU32, HEAPF32, HEAPF64, HEAP64;
		var runtimeInitialized = false;
		function updateMemoryViews() {
			var b = wasmMemory.buffer;
			HEAP8 = new Int8Array(b);
			HEAP16 = new Int16Array(b);
			Module["HEAPU8"] = HEAPU8 = new Uint8Array(b);
			new Uint16Array(b);
			Module["HEAP32"] = HEAP32 = new Int32Array(b);
			HEAPU32 = new Uint32Array(b);
			HEAPF32 = new Float32Array(b);
			HEAPF64 = new Float64Array(b);
			HEAP64 = new BigInt64Array(b);
			new BigUint64Array(b);
		}
		function preRun() {
			if (Module["preRun"]) {
				if (typeof Module["preRun"] == "function") Module["preRun"] = [Module["preRun"]];
				while (Module["preRun"].length) addOnPreRun(Module["preRun"].shift());
			}
			callRuntimeCallbacks(onPreRuns);
		}
		function initRuntime() {
			runtimeInitialized = true;
			wasmExports["sa"]();
		}
		function postRun() {
			if (Module["postRun"]) {
				if (typeof Module["postRun"] == "function") Module["postRun"] = [Module["postRun"]];
				while (Module["postRun"].length) addOnPostRun(Module["postRun"].shift());
			}
			callRuntimeCallbacks(onPostRuns);
		}
		var runDependencies = 0;
		var dependenciesFulfilled = null;
		function addRunDependency(id) {
			runDependencies++;
			Module["monitorRunDependencies"]?.(runDependencies);
		}
		function removeRunDependency(id) {
			runDependencies--;
			Module["monitorRunDependencies"]?.(runDependencies);
			if (runDependencies == 0) {
				if (dependenciesFulfilled) {
					var callback = dependenciesFulfilled;
					dependenciesFulfilled = null;
					callback();
				}
			}
		}
		function abort(what) {
			Module["onAbort"]?.(what);
			what = "Aborted(" + what + ")";
			err(what);
			ABORT = true;
			what += ". Build with -sASSERTIONS for more info.";
			var e = new WebAssembly.RuntimeError(what);
			readyPromiseReject?.(e);
			throw e;
		}
		var wasmBinaryFile;
		function findWasmBinary() {
			var _globalThis;
			if (Module["locateFile"]) return locateFile("img2num.wasm");
			return new URL((_globalThis = globalThis).__IMG2NUM_WASM_NAME__ ?? (_globalThis.__IMG2NUM_WASM_NAME__ = "img2num.wasm"), import.meta.url).href;
		}
		function getBinarySync(file) {
			if (file == wasmBinaryFile && wasmBinary) return new Uint8Array(wasmBinary);
			if (readBinary) return readBinary(file);
			throw "both async and sync fetching of the wasm failed";
		}
		async function getWasmBinary(binaryFile) {
			if (!wasmBinary) try {
				var response = await readAsync(binaryFile);
				return new Uint8Array(response);
			} catch {}
			return getBinarySync(binaryFile);
		}
		async function instantiateArrayBuffer(binaryFile, imports) {
			try {
				var binary = await getWasmBinary(binaryFile);
				return await WebAssembly.instantiate(binary, imports);
			} catch (reason) {
				err(`failed to asynchronously prepare wasm: ${reason}`);
				abort(reason);
			}
		}
		async function instantiateAsync(binary, binaryFile, imports) {
			if (!binary && typeof WebAssembly.instantiateStreaming == "function") try {
				var response = fetch(binaryFile, { credentials: "same-origin" });
				return await WebAssembly.instantiateStreaming(response, imports);
			} catch (reason) {
				err(`wasm streaming compile failed: ${reason}`);
				err("falling back to ArrayBuffer instantiation");
			}
			return instantiateArrayBuffer(binaryFile, imports);
		}
		function getWasmImports() {
			return { a: wasmImports };
		}
		async function createWasm() {
			function receiveInstance(instance, module) {
				wasmExports = instance.exports;
				wasmExports = Asyncify.instrumentWasmExports(wasmExports);
				wasmExports = applySignatureConversions(wasmExports);
				wasmMemory = wasmExports["ra"];
				updateMemoryViews();
				wasmTable = wasmExports["Ba"];
				assignWasmExports(wasmExports);
				removeRunDependency("wasm-instantiate");
				return wasmExports;
			}
			addRunDependency("wasm-instantiate");
			function receiveInstantiationResult(result) {
				return receiveInstance(result["instance"]);
			}
			var info = getWasmImports();
			if (Module["instantiateWasm"]) return new Promise((resolve, reject) => {
				Module["instantiateWasm"](info, (mod, inst) => {
					resolve(receiveInstance(mod, inst));
				});
			});
			wasmBinaryFile ?? (wasmBinaryFile = findWasmBinary());
			return receiveInstantiationResult(await instantiateAsync(wasmBinary, wasmBinaryFile, info));
		}
		class ExitStatus {
			constructor(status) {
				_defineProperty(this, "name", "ExitStatus");
				this.message = `Program terminated with exit(${status})`;
				this.status = status;
			}
		}
		var callRuntimeCallbacks = (callbacks) => {
			while (callbacks.length > 0) callbacks.shift()(Module);
		};
		var onPostRuns = [];
		var addOnPostRun = (cb) => onPostRuns.push(cb);
		var onPreRuns = [];
		var addOnPreRun = (cb) => onPreRuns.push(cb);
		var dynCalls = {};
		function getValue(ptr, type = "i8") {
			if (type.endsWith("*")) type = "*";
			switch (type) {
				case "i1": return HEAP8[ptr >>> 0];
				case "i8": return HEAP8[ptr >>> 0];
				case "i16": return HEAP16[ptr >>> 1 >>> 0];
				case "i32": return HEAP32[ptr >>> 2 >>> 0];
				case "i64": return HEAP64[ptr >>> 3 >>> 0];
				case "float": return HEAPF32[ptr >>> 2 >>> 0];
				case "double": return HEAPF64[ptr >>> 3 >>> 0];
				case "*": return HEAPU32[ptr >>> 2 >>> 0];
				default: abort(`invalid type for getValue: ${type}`);
			}
		}
		var noExitRuntime = true;
		function setValue(ptr, value, type = "i8") {
			if (type.endsWith("*")) type = "*";
			switch (type) {
				case "i1":
					HEAP8[ptr >>> 0] = value;
					break;
				case "i8":
					HEAP8[ptr >>> 0] = value;
					break;
				case "i16":
					HEAP16[ptr >>> 1 >>> 0] = value;
					break;
				case "i32":
					HEAP32[ptr >>> 2 >>> 0] = value;
					break;
				case "i64":
					HEAP64[ptr >>> 3 >>> 0] = BigInt(value);
					break;
				case "float":
					HEAPF32[ptr >>> 2 >>> 0] = value;
					break;
				case "double":
					HEAPF64[ptr >>> 3 >>> 0] = value;
					break;
				case "*":
					HEAPU32[ptr >>> 2 >>> 0] = value;
					break;
				default: abort(`invalid type for setValue: ${type}`);
			}
		}
		var stackRestore = (val) => __emscripten_stack_restore(val);
		var stackSave = () => _emscripten_stack_get_current();
		var exceptionCaught = [];
		var uncaughtExceptionCount = 0;
		var INT53_MAX = 9007199254740992;
		var INT53_MIN = -9007199254740992;
		var bigintToI53Checked = (num) => num < INT53_MIN || num > INT53_MAX ? NaN : Number(num);
		function ___cxa_begin_catch(ptr) {
			ptr >>>= 0;
			var info = new ExceptionInfo(ptr);
			if (!info.get_caught()) {
				info.set_caught(true);
				uncaughtExceptionCount--;
			}
			info.set_rethrown(false);
			exceptionCaught.push(info);
			___cxa_increment_exception_refcount(ptr);
			return ___cxa_get_exception_ptr(ptr);
		}
		var exceptionLast = 0;
		var ___cxa_end_catch = () => {
			_setThrew(0, 0);
			var info = exceptionCaught.pop();
			___cxa_decrement_exception_refcount(info.excPtr);
			exceptionLast = 0;
		};
		class ExceptionInfo {
			constructor(excPtr) {
				this.excPtr = excPtr;
				this.ptr = excPtr - 24;
			}
			set_type(type) {
				HEAPU32[this.ptr + 4 >>> 2 >>> 0] = type;
			}
			get_type() {
				return HEAPU32[this.ptr + 4 >>> 2 >>> 0];
			}
			set_destructor(destructor) {
				HEAPU32[this.ptr + 8 >>> 2 >>> 0] = destructor;
			}
			get_destructor() {
				return HEAPU32[this.ptr + 8 >>> 2 >>> 0];
			}
			set_caught(caught) {
				caught = caught ? 1 : 0;
				HEAP8[this.ptr + 12 >>> 0] = caught;
			}
			get_caught() {
				return HEAP8[this.ptr + 12 >>> 0] != 0;
			}
			set_rethrown(rethrown) {
				rethrown = rethrown ? 1 : 0;
				HEAP8[this.ptr + 13 >>> 0] = rethrown;
			}
			get_rethrown() {
				return HEAP8[this.ptr + 13 >>> 0] != 0;
			}
			init(type, destructor) {
				this.set_adjusted_ptr(0);
				this.set_type(type);
				this.set_destructor(destructor);
			}
			set_adjusted_ptr(adjustedPtr) {
				HEAPU32[this.ptr + 16 >>> 2 >>> 0] = adjustedPtr;
			}
			get_adjusted_ptr() {
				return HEAPU32[this.ptr + 16 >>> 2 >>> 0];
			}
		}
		var setTempRet0 = (val) => __emscripten_tempret_set(val);
		var findMatchingCatch = (args) => {
			var thrown = exceptionLast;
			if (!thrown) {
				setTempRet0(0);
				return 0;
			}
			var info = new ExceptionInfo(thrown);
			info.set_adjusted_ptr(thrown);
			var thrownType = info.get_type();
			if (!thrownType) {
				setTempRet0(0);
				return thrown;
			}
			for (var caughtType of args) {
				if (caughtType === 0 || caughtType === thrownType) break;
				var adjusted_ptr_addr = info.ptr + 16;
				if (___cxa_can_catch(caughtType, thrownType, adjusted_ptr_addr)) {
					setTempRet0(caughtType);
					return thrown;
				}
			}
			setTempRet0(thrownType);
			return thrown;
		};
		function ___cxa_find_matching_catch_2() {
			return findMatchingCatch([]);
		}
		function ___cxa_find_matching_catch_3(arg0) {
			arg0 >>>= 0;
			return findMatchingCatch([arg0]);
		}
		var ___cxa_rethrow = () => {
			var info = exceptionCaught.pop();
			if (!info) abort("no exception to throw");
			var ptr = info.excPtr;
			if (!info.get_rethrown()) {
				exceptionCaught.push(info);
				info.set_rethrown(true);
				info.set_caught(false);
				uncaughtExceptionCount++;
			}
			exceptionLast = ptr;
			throw exceptionLast;
		};
		function ___cxa_throw(ptr, type, destructor) {
			ptr >>>= 0;
			type >>>= 0;
			destructor >>>= 0;
			new ExceptionInfo(ptr).init(type, destructor);
			exceptionLast = ptr;
			uncaughtExceptionCount++;
			throw exceptionLast;
		}
		var ___cxa_uncaught_exceptions = () => uncaughtExceptionCount;
		function ___resumeException(ptr) {
			ptr >>>= 0;
			if (!exceptionLast) exceptionLast = ptr;
			throw exceptionLast;
		}
		var __abort_js = () => abort("");
		var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
			outIdx >>>= 0;
			if (!(maxBytesToWrite > 0)) return 0;
			var startIdx = outIdx;
			var endIdx = outIdx + maxBytesToWrite - 1;
			for (var i = 0; i < str.length; ++i) {
				var u = str.codePointAt(i);
				if (u <= 127) {
					if (outIdx >= endIdx) break;
					heap[outIdx++ >>> 0] = u;
				} else if (u <= 2047) {
					if (outIdx + 1 >= endIdx) break;
					heap[outIdx++ >>> 0] = 192 | u >> 6;
					heap[outIdx++ >>> 0] = 128 | u & 63;
				} else if (u <= 65535) {
					if (outIdx + 2 >= endIdx) break;
					heap[outIdx++ >>> 0] = 224 | u >> 12;
					heap[outIdx++ >>> 0] = 128 | u >> 6 & 63;
					heap[outIdx++ >>> 0] = 128 | u & 63;
				} else {
					if (outIdx + 3 >= endIdx) break;
					heap[outIdx++ >>> 0] = 240 | u >> 18;
					heap[outIdx++ >>> 0] = 128 | u >> 12 & 63;
					heap[outIdx++ >>> 0] = 128 | u >> 6 & 63;
					heap[outIdx++ >>> 0] = 128 | u & 63;
					i++;
				}
			}
			heap[outIdx >>> 0] = 0;
			return outIdx - startIdx;
		};
		var stringToUTF8 = (str, outPtr, maxBytesToWrite) => stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
		var __tzset_js = function(timezone, daylight, std_name, dst_name) {
			timezone >>>= 0;
			daylight >>>= 0;
			std_name >>>= 0;
			dst_name >>>= 0;
			var currentYear = (/* @__PURE__ */ new Date()).getFullYear();
			var winter = new Date(currentYear, 0, 1);
			var summer = new Date(currentYear, 6, 1);
			var winterOffset = winter.getTimezoneOffset();
			var summerOffset = summer.getTimezoneOffset();
			var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
			HEAPU32[timezone >>> 2 >>> 0] = stdTimezoneOffset * 60;
			HEAP32[daylight >>> 2 >>> 0] = Number(winterOffset != summerOffset);
			var extractZone = (timezoneOffset) => {
				var sign = timezoneOffset >= 0 ? "-" : "+";
				var absOffset = Math.abs(timezoneOffset);
				return `UTC${sign}${String(Math.floor(absOffset / 60)).padStart(2, "0")}${String(absOffset % 60).padStart(2, "0")}`;
			};
			var winterName = extractZone(winterOffset);
			var summerName = extractZone(summerOffset);
			if (summerOffset < winterOffset) {
				stringToUTF8(winterName, std_name, 17);
				stringToUTF8(summerName, dst_name, 17);
			} else {
				stringToUTF8(winterName, dst_name, 17);
				stringToUTF8(summerName, std_name, 17);
			}
		};
		var _emscripten_has_asyncify = () => 1;
		var getHeapMax = () => 4294901760;
		var alignMemory = (size, alignment) => Math.ceil(size / alignment) * alignment;
		var growMemory = (size) => {
			var pages = (size - wasmMemory.buffer.byteLength + 65535) / 65536 | 0;
			try {
				wasmMemory.grow(pages);
				updateMemoryViews();
				return 1;
			} catch (e) {}
		};
		function _emscripten_resize_heap(requestedSize) {
			requestedSize >>>= 0;
			var oldSize = HEAPU8.length;
			var maxHeapSize = getHeapMax();
			if (requestedSize > maxHeapSize) return false;
			for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
				var overGrownHeapSize = oldSize * (1 + .2 / cutDown);
				overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
				if (growMemory(Math.min(maxHeapSize, alignMemory(Math.max(requestedSize, overGrownHeapSize), 65536)))) return true;
			}
			return false;
		}
		var handleException = (e) => {
			if (e instanceof ExitStatus || e == "unwind") return EXITSTATUS;
			quit_(1, e);
		};
		var runtimeKeepaliveCounter = 0;
		var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;
		var _proc_exit = (code) => {
			EXITSTATUS = code;
			if (!keepRuntimeAlive()) {
				Module["onExit"]?.(code);
				ABORT = true;
			}
			quit_(code, new ExitStatus(code));
		};
		var exitJS = (status, implicit) => {
			EXITSTATUS = status;
			_proc_exit(status);
		};
		var _exit = exitJS;
		var maybeExit = () => {
			if (!keepRuntimeAlive()) try {
				_exit(EXITSTATUS);
			} catch (e) {
				handleException(e);
			}
		};
		var callUserCallback = (func) => {
			if (ABORT) return;
			try {
				func();
				maybeExit();
			} catch (e) {
				handleException(e);
			}
		};
		var safeSetTimeout = (func, timeout) => setTimeout(() => {
			callUserCallback(func);
		}, timeout);
		var _emscripten_sleep = (ms) => Asyncify.handleSleep((wakeUp) => safeSetTimeout(wakeUp, ms));
		_emscripten_sleep.isAsync = true;
		var lengthBytesUTF8 = (str) => {
			var len = 0;
			for (var i = 0; i < str.length; ++i) {
				var c = str.charCodeAt(i);
				if (c <= 127) len++;
				else if (c <= 2047) len += 2;
				else if (c >= 55296 && c <= 57343) {
					len += 4;
					++i;
				} else len += 3;
			}
			return len;
		};
		var stackAlloc = (sz) => __emscripten_stack_alloc(sz);
		var stringToUTF8OnStack = (str) => {
			var size = lengthBytesUTF8(str) + 1;
			var ret = stackAlloc(size);
			stringToUTF8(str, ret, size);
			return ret;
		};
		var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder() : void 0;
		var UTF8ArrayToString = (heapOrArray, idx = 0, maxBytesToRead = NaN) => {
			idx >>>= 0;
			var endIdx = idx + maxBytesToRead;
			var endPtr = idx;
			while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
			if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
			var str = "";
			while (idx < endPtr) {
				var u0 = heapOrArray[idx++];
				if (!(u0 & 128)) {
					str += String.fromCharCode(u0);
					continue;
				}
				var u1 = heapOrArray[idx++] & 63;
				if ((u0 & 224) == 192) {
					str += String.fromCharCode((u0 & 31) << 6 | u1);
					continue;
				}
				var u2 = heapOrArray[idx++] & 63;
				if ((u0 & 240) == 224) u0 = (u0 & 15) << 12 | u1 << 6 | u2;
				else u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63;
				if (u0 < 65536) str += String.fromCharCode(u0);
				else {
					var ch = u0 - 65536;
					str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
				}
			}
			return str;
		};
		var UTF8ToString = (ptr, maxBytesToRead) => {
			ptr >>>= 0;
			return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
		};
		var stringToNewUTF8 = (str) => {
			var size = lengthBytesUTF8(str) + 1;
			var ret = _malloc(size);
			if (ret) stringToUTF8(str, ret, size);
			return ret;
		};
		var WebGPU = {
			Internals: {
				jsObjects: [],
				jsObjectInsert: (ptr, jsObject) => {
					WebGPU.Internals.jsObjects[ptr] = jsObject;
				},
				bufferOnUnmaps: [],
				futures: [],
				futureInsert: (futureId, promise) => {
					WebGPU.Internals.futures[futureId] = new Promise((resolve) => promise.finally(() => resolve(futureId)));
				}
			},
			getJsObject: (ptr) => {
				if (!ptr) return void 0;
				return WebGPU.Internals.jsObjects[ptr];
			},
			importJsAdapter: (obj, parentPtr = 0) => {
				var ptr = _emwgpuCreateAdapter(parentPtr);
				WebGPU.Internals.jsObjects[ptr] = obj;
				return ptr;
			},
			importJsBindGroup: (obj, parentPtr = 0) => {
				var ptr = _emwgpuCreateBindGroup(parentPtr);
				WebGPU.Internals.jsObjects[ptr] = obj;
				return ptr;
			},
			importJsBindGroupLayout: (obj, parentPtr = 0) => {
				var ptr = _emwgpuCreateBindGroupLayout(parentPtr);
				WebGPU.Internals.jsObjects[ptr] = obj;
				return ptr;
			},
			importJsBuffer: (buffer, parentPtr = 0) => {
				assert(buffer.mapState != "pending");
				var mapState = buffer.mapState == "mapped" ? 3 : 1;
				var bufferPtr = _emwgpuCreateBuffer(parentPtr, mapState);
				WebGPU.Internals.jsObjectInsert(bufferPtr, buffer);
				if (buffer.mapState == "mapped") WebGPU.Internals.bufferOnUnmaps[bufferPtr] = [];
				return bufferPtr;
			},
			importJsCommandBuffer: (obj, parentPtr = 0) => {
				var ptr = _emwgpuCreateCommandBuffer(parentPtr);
				WebGPU.Internals.jsObjects[ptr] = obj;
				return ptr;
			},
			importJsCommandEncoder: (obj, parentPtr = 0) => {
				var ptr = _emwgpuCreateCommandEncoder(parentPtr);
				WebGPU.Internals.jsObjects[ptr] = obj;
				return ptr;
			},
			importJsComputePassEncoder: (obj, parentPtr = 0) => {
				var ptr = _emwgpuCreateComputePassEncoder(parentPtr);
				WebGPU.Internals.jsObjects[ptr] = obj;
				return ptr;
			},
			importJsComputePipeline: (obj, parentPtr = 0) => {
				var ptr = _emwgpuCreateComputePipeline(parentPtr);
				WebGPU.Internals.jsObjects[ptr] = obj;
				return ptr;
			},
			importJsDevice: (device, parentPtr = 0) => {
				var queuePtr = _emwgpuCreateQueue(parentPtr);
				var devicePtr = _emwgpuCreateDevice(parentPtr, queuePtr);
				WebGPU.Internals.jsObjectInsert(queuePtr, device.queue);
				WebGPU.Internals.jsObjectInsert(devicePtr, device);
				return devicePtr;
			},
			importJsPipelineLayout: (obj, parentPtr = 0) => {
				var ptr = _emwgpuCreatePipelineLayout(parentPtr);
				WebGPU.Internals.jsObjects[ptr] = obj;
				return ptr;
			},
			importJsQuerySet: (obj, parentPtr = 0) => {
				var ptr = _emwgpuCreateQuerySet(parentPtr);
				WebGPU.Internals.jsObjects[ptr] = obj;
				return ptr;
			},
			importJsQueue: (obj, parentPtr = 0) => {
				var ptr = _emwgpuCreateQueue(parentPtr);
				WebGPU.Internals.jsObjects[ptr] = obj;
				return ptr;
			},
			importJsRenderBundle: (obj, parentPtr = 0) => {
				var ptr = _emwgpuCreateRenderBundle(parentPtr);
				WebGPU.Internals.jsObjects[ptr] = obj;
				return ptr;
			},
			importJsRenderBundleEncoder: (obj, parentPtr = 0) => {
				var ptr = _emwgpuCreateRenderBundleEncoder(parentPtr);
				WebGPU.Internals.jsObjects[ptr] = obj;
				return ptr;
			},
			importJsRenderPassEncoder: (obj, parentPtr = 0) => {
				var ptr = _emwgpuCreateRenderPassEncoder(parentPtr);
				WebGPU.Internals.jsObjects[ptr] = obj;
				return ptr;
			},
			importJsRenderPipeline: (obj, parentPtr = 0) => {
				var ptr = _emwgpuCreateRenderPipeline(parentPtr);
				WebGPU.Internals.jsObjects[ptr] = obj;
				return ptr;
			},
			importJsSampler: (obj, parentPtr = 0) => {
				var ptr = _emwgpuCreateSampler(parentPtr);
				WebGPU.Internals.jsObjects[ptr] = obj;
				return ptr;
			},
			importJsShaderModule: (obj, parentPtr = 0) => {
				var ptr = _emwgpuCreateShaderModule(parentPtr);
				WebGPU.Internals.jsObjects[ptr] = obj;
				return ptr;
			},
			importJsSurface: (obj, parentPtr = 0) => {
				var ptr = _emwgpuCreateSurface(parentPtr);
				WebGPU.Internals.jsObjects[ptr] = obj;
				return ptr;
			},
			importJsTexture: (obj, parentPtr = 0) => {
				var ptr = _emwgpuCreateTexture(parentPtr);
				WebGPU.Internals.jsObjects[ptr] = obj;
				return ptr;
			},
			importJsTextureView: (obj, parentPtr = 0) => {
				var ptr = _emwgpuCreateTextureView(parentPtr);
				WebGPU.Internals.jsObjects[ptr] = obj;
				return ptr;
			},
			errorCallback: (callback, type, message, userdata) => {
				var sp = stackSave();
				((a1, a2, a3) => dynCall_viii(callback, a1, a2, a3))(type, stringToUTF8OnStack(message), userdata);
				stackRestore(sp);
			},
			setStringView: (ptr, data, length) => {
				HEAPU32[ptr >>> 2 >>> 0] = data;
				HEAPU32[ptr + 4 >>> 2 >>> 0] = length;
			},
			makeStringFromStringView: (stringViewPtr) => {
				var ptr = HEAPU32[stringViewPtr >>> 2 >>> 0];
				var length = HEAPU32[stringViewPtr + 4 >>> 2 >>> 0];
				return UTF8ToString(ptr, length);
			},
			makeStringFromOptionalStringView: (stringViewPtr) => {
				var ptr = HEAPU32[stringViewPtr >>> 2 >>> 0];
				var length = HEAPU32[stringViewPtr + 4 >>> 2 >>> 0];
				if (!ptr) {
					if (length === 0) return "";
					return;
				}
				return UTF8ToString(ptr, length);
			},
			makeColor: (ptr) => ({
				r: HEAPF64[ptr >>> 3 >>> 0],
				g: HEAPF64[ptr + 8 >>> 3 >>> 0],
				b: HEAPF64[ptr + 16 >>> 3 >>> 0],
				a: HEAPF64[ptr + 24 >>> 3 >>> 0]
			}),
			makeExtent3D: (ptr) => ({
				width: HEAPU32[ptr >>> 2 >>> 0],
				height: HEAPU32[ptr + 4 >>> 2 >>> 0],
				depthOrArrayLayers: HEAPU32[ptr + 8 >>> 2 >>> 0]
			}),
			makeOrigin3D: (ptr) => ({
				x: HEAPU32[ptr >>> 2 >>> 0],
				y: HEAPU32[ptr + 4 >>> 2 >>> 0],
				z: HEAPU32[ptr + 8 >>> 2 >>> 0]
			}),
			makeTexelCopyTextureInfo: (ptr) => ({
				texture: WebGPU.getJsObject(HEAPU32[ptr >>> 2 >>> 0]),
				mipLevel: HEAPU32[ptr + 4 >>> 2 >>> 0],
				origin: WebGPU.makeOrigin3D(ptr + 8),
				aspect: WebGPU.TextureAspect[HEAPU32[ptr + 20 >>> 2 >>> 0]]
			}),
			makeTexelCopyBufferLayout: (ptr) => {
				var bytesPerRow = HEAPU32[ptr + 8 >>> 2 >>> 0];
				var rowsPerImage = HEAPU32[ptr + 12 >>> 2 >>> 0];
				return {
					offset: HEAPU32[ptr + 4 >>> 2 >>> 0] * 4294967296 + HEAPU32[ptr >>> 2 >>> 0],
					bytesPerRow: bytesPerRow === 4294967295 ? void 0 : bytesPerRow,
					rowsPerImage: rowsPerImage === 4294967295 ? void 0 : rowsPerImage
				};
			},
			makeTexelCopyBufferInfo: (ptr) => {
				var layoutPtr = ptr + 0;
				var bufferCopyView = WebGPU.makeTexelCopyBufferLayout(layoutPtr);
				bufferCopyView["buffer"] = WebGPU.getJsObject(HEAPU32[ptr + 16 >>> 2 >>> 0]);
				return bufferCopyView;
			},
			makePassTimestampWrites: (ptr) => {
				if (ptr === 0) return void 0;
				return {
					querySet: WebGPU.getJsObject(HEAPU32[ptr + 4 >>> 2 >>> 0]),
					beginningOfPassWriteIndex: HEAPU32[ptr + 8 >>> 2 >>> 0],
					endOfPassWriteIndex: HEAPU32[ptr + 12 >>> 2 >>> 0]
				};
			},
			makePipelineConstants: (constantCount, constantsPtr) => {
				if (!constantCount) return;
				var constants = {};
				for (var i = 0; i < constantCount; ++i) {
					var entryPtr = constantsPtr + 24 * i;
					var key = WebGPU.makeStringFromStringView(entryPtr + 4);
					constants[key] = HEAPF64[entryPtr + 16 >>> 3 >>> 0];
				}
				return constants;
			},
			makePipelineLayout: (layoutPtr) => {
				if (!layoutPtr) return "auto";
				return WebGPU.getJsObject(layoutPtr);
			},
			makeComputeState: (ptr) => {
				if (!ptr) return void 0;
				return {
					module: WebGPU.getJsObject(HEAPU32[ptr + 4 >>> 2 >>> 0]),
					constants: WebGPU.makePipelineConstants(HEAPU32[ptr + 16 >>> 2 >>> 0], HEAPU32[ptr + 20 >>> 2 >>> 0]),
					entryPoint: WebGPU.makeStringFromOptionalStringView(ptr + 8)
				};
			},
			makeComputePipelineDesc: (descriptor) => {
				return {
					label: WebGPU.makeStringFromOptionalStringView(descriptor + 4),
					layout: WebGPU.makePipelineLayout(HEAPU32[descriptor + 12 >>> 2 >>> 0]),
					compute: WebGPU.makeComputeState(descriptor + 16)
				};
			},
			makeRenderPipelineDesc: (descriptor) => {
				function makePrimitiveState(psPtr) {
					if (!psPtr) return void 0;
					return {
						topology: WebGPU.PrimitiveTopology[HEAPU32[psPtr + 4 >>> 2 >>> 0]],
						stripIndexFormat: WebGPU.IndexFormat[HEAPU32[psPtr + 8 >>> 2 >>> 0]],
						frontFace: WebGPU.FrontFace[HEAPU32[psPtr + 12 >>> 2 >>> 0]],
						cullMode: WebGPU.CullMode[HEAPU32[psPtr + 16 >>> 2 >>> 0]],
						unclippedDepth: !!HEAPU32[psPtr + 20 >>> 2 >>> 0]
					};
				}
				function makeBlendComponent(bdPtr) {
					if (!bdPtr) return void 0;
					return {
						operation: WebGPU.BlendOperation[HEAPU32[bdPtr >>> 2 >>> 0]],
						srcFactor: WebGPU.BlendFactor[HEAPU32[bdPtr + 4 >>> 2 >>> 0]],
						dstFactor: WebGPU.BlendFactor[HEAPU32[bdPtr + 8 >>> 2 >>> 0]]
					};
				}
				function makeBlendState(bsPtr) {
					if (!bsPtr) return void 0;
					return {
						alpha: makeBlendComponent(bsPtr + 12),
						color: makeBlendComponent(bsPtr + 0)
					};
				}
				function makeColorState(csPtr) {
					var formatInt = HEAPU32[csPtr + 4 >>> 2 >>> 0];
					return formatInt === 0 ? void 0 : {
						format: WebGPU.TextureFormat[formatInt],
						blend: makeBlendState(HEAPU32[csPtr + 8 >>> 2 >>> 0]),
						writeMask: HEAPU32[csPtr + 16 >>> 2 >>> 0]
					};
				}
				function makeColorStates(count, csArrayPtr) {
					var states = [];
					for (var i = 0; i < count; ++i) states.push(makeColorState(csArrayPtr + 24 * i));
					return states;
				}
				function makeStencilStateFace(ssfPtr) {
					return {
						compare: WebGPU.CompareFunction[HEAPU32[ssfPtr >>> 2 >>> 0]],
						failOp: WebGPU.StencilOperation[HEAPU32[ssfPtr + 4 >>> 2 >>> 0]],
						depthFailOp: WebGPU.StencilOperation[HEAPU32[ssfPtr + 8 >>> 2 >>> 0]],
						passOp: WebGPU.StencilOperation[HEAPU32[ssfPtr + 12 >>> 2 >>> 0]]
					};
				}
				function makeDepthStencilState(dssPtr) {
					if (!dssPtr) return void 0;
					return {
						format: WebGPU.TextureFormat[HEAPU32[dssPtr + 4 >>> 2 >>> 0]],
						depthWriteEnabled: !!HEAPU32[dssPtr + 8 >>> 2 >>> 0],
						depthCompare: WebGPU.CompareFunction[HEAPU32[dssPtr + 12 >>> 2 >>> 0]],
						stencilFront: makeStencilStateFace(dssPtr + 16),
						stencilBack: makeStencilStateFace(dssPtr + 32),
						stencilReadMask: HEAPU32[dssPtr + 48 >>> 2 >>> 0],
						stencilWriteMask: HEAPU32[dssPtr + 52 >>> 2 >>> 0],
						depthBias: HEAP32[dssPtr + 56 >>> 2 >>> 0],
						depthBiasSlopeScale: HEAPF32[dssPtr + 60 >>> 2 >>> 0],
						depthBiasClamp: HEAPF32[dssPtr + 64 >>> 2 >>> 0]
					};
				}
				function makeVertexAttribute(vaPtr) {
					return {
						format: WebGPU.VertexFormat[HEAPU32[vaPtr + 4 >>> 2 >>> 0]],
						offset: HEAPU32[vaPtr + 4 + 8 >>> 2 >>> 0] * 4294967296 + HEAPU32[vaPtr + 8 >>> 2 >>> 0],
						shaderLocation: HEAPU32[vaPtr + 16 >>> 2 >>> 0]
					};
				}
				function makeVertexAttributes(count, vaArrayPtr) {
					var vas = [];
					for (var i = 0; i < count; ++i) vas.push(makeVertexAttribute(vaArrayPtr + i * 24));
					return vas;
				}
				function makeVertexBuffer(vbPtr) {
					if (!vbPtr) return void 0;
					var stepModeInt = HEAPU32[vbPtr + 4 >>> 2 >>> 0];
					var attributeCountInt = HEAPU32[vbPtr + 16 >>> 2 >>> 0];
					if (stepModeInt === 0 && attributeCountInt === 0) return null;
					return {
						arrayStride: HEAPU32[vbPtr + 4 + 8 >>> 2 >>> 0] * 4294967296 + HEAPU32[vbPtr + 8 >>> 2 >>> 0],
						stepMode: WebGPU.VertexStepMode[stepModeInt],
						attributes: makeVertexAttributes(attributeCountInt, HEAPU32[vbPtr + 20 >>> 2 >>> 0])
					};
				}
				function makeVertexBuffers(count, vbArrayPtr) {
					if (!count) return void 0;
					var vbs = [];
					for (var i = 0; i < count; ++i) vbs.push(makeVertexBuffer(vbArrayPtr + i * 24));
					return vbs;
				}
				function makeVertexState(viPtr) {
					if (!viPtr) return void 0;
					return {
						module: WebGPU.getJsObject(HEAPU32[viPtr + 4 >>> 2 >>> 0]),
						constants: WebGPU.makePipelineConstants(HEAPU32[viPtr + 16 >>> 2 >>> 0], HEAPU32[viPtr + 20 >>> 2 >>> 0]),
						buffers: makeVertexBuffers(HEAPU32[viPtr + 24 >>> 2 >>> 0], HEAPU32[viPtr + 28 >>> 2 >>> 0]),
						entryPoint: WebGPU.makeStringFromOptionalStringView(viPtr + 8)
					};
				}
				function makeMultisampleState(msPtr) {
					if (!msPtr) return void 0;
					return {
						count: HEAPU32[msPtr + 4 >>> 2 >>> 0],
						mask: HEAPU32[msPtr + 8 >>> 2 >>> 0],
						alphaToCoverageEnabled: !!HEAPU32[msPtr + 12 >>> 2 >>> 0]
					};
				}
				function makeFragmentState(fsPtr) {
					if (!fsPtr) return void 0;
					return {
						module: WebGPU.getJsObject(HEAPU32[fsPtr + 4 >>> 2 >>> 0]),
						constants: WebGPU.makePipelineConstants(HEAPU32[fsPtr + 16 >>> 2 >>> 0], HEAPU32[fsPtr + 20 >>> 2 >>> 0]),
						targets: makeColorStates(HEAPU32[fsPtr + 24 >>> 2 >>> 0], HEAPU32[fsPtr + 28 >>> 2 >>> 0]),
						entryPoint: WebGPU.makeStringFromOptionalStringView(fsPtr + 8)
					};
				}
				return {
					label: WebGPU.makeStringFromOptionalStringView(descriptor + 4),
					layout: WebGPU.makePipelineLayout(HEAPU32[descriptor + 12 >>> 2 >>> 0]),
					vertex: makeVertexState(descriptor + 16),
					primitive: makePrimitiveState(descriptor + 48),
					depthStencil: makeDepthStencilState(HEAPU32[descriptor + 72 >>> 2 >>> 0]),
					multisample: makeMultisampleState(descriptor + 76),
					fragment: makeFragmentState(HEAPU32[descriptor + 92 >>> 2 >>> 0])
				};
			},
			fillLimitStruct: (limits, limitsOutPtr) => {
				function setLimitValueU32(name, limitOffset) {
					var limitValue = limits[name];
					HEAP32[limitsOutPtr + limitOffset >>> 2 >>> 0] = limitValue;
				}
				function setLimitValueU64(name, limitOffset) {
					var limitValue = limits[name];
					HEAP64[limitsOutPtr + limitOffset >>> 3 >>> 0] = BigInt(limitValue);
				}
				setLimitValueU32("maxTextureDimension1D", 4);
				setLimitValueU32("maxTextureDimension2D", 8);
				setLimitValueU32("maxTextureDimension3D", 12);
				setLimitValueU32("maxTextureArrayLayers", 16);
				setLimitValueU32("maxBindGroups", 20);
				setLimitValueU32("maxBindGroupsPlusVertexBuffers", 24);
				setLimitValueU32("maxBindingsPerBindGroup", 28);
				setLimitValueU32("maxDynamicUniformBuffersPerPipelineLayout", 32);
				setLimitValueU32("maxDynamicStorageBuffersPerPipelineLayout", 36);
				setLimitValueU32("maxSampledTexturesPerShaderStage", 40);
				setLimitValueU32("maxSamplersPerShaderStage", 44);
				setLimitValueU32("maxStorageBuffersPerShaderStage", 48);
				setLimitValueU32("maxStorageTexturesPerShaderStage", 52);
				setLimitValueU32("maxUniformBuffersPerShaderStage", 56);
				setLimitValueU32("minUniformBufferOffsetAlignment", 80);
				setLimitValueU32("minStorageBufferOffsetAlignment", 84);
				setLimitValueU64("maxUniformBufferBindingSize", 64);
				setLimitValueU64("maxStorageBufferBindingSize", 72);
				setLimitValueU32("maxVertexBuffers", 88);
				setLimitValueU64("maxBufferSize", 96);
				setLimitValueU32("maxVertexAttributes", 104);
				setLimitValueU32("maxVertexBufferArrayStride", 108);
				setLimitValueU32("maxInterStageShaderVariables", 112);
				setLimitValueU32("maxColorAttachments", 116);
				setLimitValueU32("maxColorAttachmentBytesPerSample", 120);
				setLimitValueU32("maxComputeWorkgroupStorageSize", 124);
				setLimitValueU32("maxComputeInvocationsPerWorkgroup", 128);
				setLimitValueU32("maxComputeWorkgroupSizeX", 132);
				setLimitValueU32("maxComputeWorkgroupSizeY", 136);
				setLimitValueU32("maxComputeWorkgroupSizeZ", 140);
				setLimitValueU32("maxComputeWorkgroupsPerDimension", 144);
				if (limits.maxImmediateSize !== void 0) setLimitValueU32("maxImmediateSize", 148);
			},
			fillAdapterInfoStruct: (info, infoStruct) => {
				HEAP32[infoStruct + 52 >>> 2 >>> 0] = info.subgroupMinSize;
				HEAP32[infoStruct + 56 >>> 2 >>> 0] = info.subgroupMaxSize;
				var strPtr = stringToNewUTF8(info.vendor + info.architecture + info.device + info.description);
				var vendorLen = lengthBytesUTF8(info.vendor);
				WebGPU.setStringView(infoStruct + 4, strPtr, vendorLen);
				strPtr += vendorLen;
				var architectureLen = lengthBytesUTF8(info.architecture);
				WebGPU.setStringView(infoStruct + 12, strPtr, architectureLen);
				strPtr += architectureLen;
				var deviceLen = lengthBytesUTF8(info.device);
				WebGPU.setStringView(infoStruct + 20, strPtr, deviceLen);
				strPtr += deviceLen;
				var descriptionLen = lengthBytesUTF8(info.description);
				WebGPU.setStringView(infoStruct + 28, strPtr, descriptionLen);
				strPtr += descriptionLen;
				HEAP32[infoStruct + 36 >>> 2 >>> 0] = 2;
				var adapterType = info.isFallbackAdapter ? 3 : 4;
				HEAP32[infoStruct + 40 >>> 2 >>> 0] = adapterType;
				HEAP32[infoStruct + 44 >>> 2 >>> 0] = 0;
				HEAP32[infoStruct + 48 >>> 2 >>> 0] = 0;
			},
			Int_BufferMapState: {
				unmapped: 1,
				pending: 2,
				mapped: 3
			},
			Int_CompilationMessageType: {
				error: 1,
				warning: 2,
				info: 3
			},
			Int_DeviceLostReason: {
				undefined: 1,
				unknown: 1,
				destroyed: 2
			},
			Int_PreferredFormat: {
				rgba8unorm: 18,
				bgra8unorm: 23
			},
			AddressMode: [
				,
				"clamp-to-edge",
				"repeat",
				"mirror-repeat"
			],
			BlendFactor: [
				,
				"zero",
				"one",
				"src",
				"one-minus-src",
				"src-alpha",
				"one-minus-src-alpha",
				"dst",
				"one-minus-dst",
				"dst-alpha",
				"one-minus-dst-alpha",
				"src-alpha-saturated",
				"constant",
				"one-minus-constant",
				"src1",
				"one-minus-src1",
				"src1alpha",
				"one-minus-src1alpha"
			],
			BlendOperation: [
				,
				"add",
				"subtract",
				"reverse-subtract",
				"min",
				"max"
			],
			BufferBindingType: [
				"binding-not-used",
				,
				"uniform",
				"storage",
				"read-only-storage"
			],
			BufferMapState: {
				1: "unmapped",
				2: "pending",
				3: "mapped"
			},
			CompareFunction: [
				,
				"never",
				"less",
				"equal",
				"less-equal",
				"greater",
				"not-equal",
				"greater-equal",
				"always"
			],
			CompilationInfoRequestStatus: {
				1: "success",
				2: "callback-cancelled"
			},
			CompositeAlphaMode: [
				,
				"opaque",
				"premultiplied",
				"unpremultiplied",
				"inherit"
			],
			CullMode: [
				,
				"none",
				"front",
				"back"
			],
			ErrorFilter: {
				1: "validation",
				2: "out-of-memory",
				3: "internal"
			},
			FeatureLevel: [
				,
				"compatibility",
				"core"
			],
			FeatureName: {
				1: "depth-clip-control",
				2: "depth32float-stencil8",
				3: "timestamp-query",
				4: "texture-compression-bc",
				5: "texture-compression-bc-sliced-3d",
				6: "texture-compression-etc2",
				7: "texture-compression-astc",
				8: "texture-compression-astc-sliced-3d",
				9: "indirect-first-instance",
				10: "shader-f16",
				11: "rg11b10ufloat-renderable",
				12: "bgra8unorm-storage",
				13: "float32-filterable",
				14: "float32-blendable",
				15: "clip-distances",
				16: "dual-source-blending",
				17: "subgroups",
				18: "core-features-and-limits",
				327692: "chromium-experimental-unorm16-texture-formats",
				327693: "chromium-experimental-snorm16-texture-formats",
				327732: "chromium-experimental-multi-draw-indirect"
			},
			FilterMode: [
				,
				"nearest",
				"linear"
			],
			FrontFace: [
				,
				"ccw",
				"cw"
			],
			IndexFormat: [
				,
				"uint16",
				"uint32"
			],
			LoadOp: [
				,
				"load",
				"clear"
			],
			MipmapFilterMode: [
				,
				"nearest",
				"linear"
			],
			OptionalBool: ["false", "true"],
			PowerPreference: [
				,
				"low-power",
				"high-performance"
			],
			PredefinedColorSpace: {
				1: "srgb",
				2: "display-p3"
			},
			PrimitiveTopology: [
				,
				"point-list",
				"line-list",
				"line-strip",
				"triangle-list",
				"triangle-strip"
			],
			QueryType: {
				1: "occlusion",
				2: "timestamp"
			},
			SamplerBindingType: [
				"binding-not-used",
				,
				"filtering",
				"non-filtering",
				"comparison"
			],
			Status: {
				1: "success",
				2: "error"
			},
			StencilOperation: [
				,
				"keep",
				"zero",
				"replace",
				"invert",
				"increment-clamp",
				"decrement-clamp",
				"increment-wrap",
				"decrement-wrap"
			],
			StorageTextureAccess: [
				"binding-not-used",
				,
				"write-only",
				"read-only",
				"read-write"
			],
			StoreOp: [
				,
				"store",
				"discard"
			],
			SurfaceGetCurrentTextureStatus: {
				1: "success-optimal",
				2: "success-suboptimal",
				3: "timeout",
				4: "outdated",
				5: "lost",
				6: "error"
			},
			TextureAspect: [
				,
				"all",
				"stencil-only",
				"depth-only"
			],
			TextureDimension: [
				,
				"1d",
				"2d",
				"3d"
			],
			TextureFormat: [
				,
				"r8unorm",
				"r8snorm",
				"r8uint",
				"r8sint",
				"r16uint",
				"r16sint",
				"r16float",
				"rg8unorm",
				"rg8snorm",
				"rg8uint",
				"rg8sint",
				"r32float",
				"r32uint",
				"r32sint",
				"rg16uint",
				"rg16sint",
				"rg16float",
				"rgba8unorm",
				"rgba8unorm-srgb",
				"rgba8snorm",
				"rgba8uint",
				"rgba8sint",
				"bgra8unorm",
				"bgra8unorm-srgb",
				"rgb10a2uint",
				"rgb10a2unorm",
				"rg11b10ufloat",
				"rgb9e5ufloat",
				"rg32float",
				"rg32uint",
				"rg32sint",
				"rgba16uint",
				"rgba16sint",
				"rgba16float",
				"rgba32float",
				"rgba32uint",
				"rgba32sint",
				"stencil8",
				"depth16unorm",
				"depth24plus",
				"depth24plus-stencil8",
				"depth32float",
				"depth32float-stencil8",
				"bc1-rgba-unorm",
				"bc1-rgba-unorm-srgb",
				"bc2-rgba-unorm",
				"bc2-rgba-unorm-srgb",
				"bc3-rgba-unorm",
				"bc3-rgba-unorm-srgb",
				"bc4-r-unorm",
				"bc4-r-snorm",
				"bc5-rg-unorm",
				"bc5-rg-snorm",
				"bc6h-rgb-ufloat",
				"bc6h-rgb-float",
				"bc7-rgba-unorm",
				"bc7-rgba-unorm-srgb",
				"etc2-rgb8unorm",
				"etc2-rgb8unorm-srgb",
				"etc2-rgb8a1unorm",
				"etc2-rgb8a1unorm-srgb",
				"etc2-rgba8unorm",
				"etc2-rgba8unorm-srgb",
				"eac-r11unorm",
				"eac-r11snorm",
				"eac-rg11unorm",
				"eac-rg11snorm",
				"astc-4x4-unorm",
				"astc-4x4-unorm-srgb",
				"astc-5x4-unorm",
				"astc-5x4-unorm-srgb",
				"astc-5x5-unorm",
				"astc-5x5-unorm-srgb",
				"astc-6x5-unorm",
				"astc-6x5-unorm-srgb",
				"astc-6x6-unorm",
				"astc-6x6-unorm-srgb",
				"astc-8x5-unorm",
				"astc-8x5-unorm-srgb",
				"astc-8x6-unorm",
				"astc-8x6-unorm-srgb",
				"astc-8x8-unorm",
				"astc-8x8-unorm-srgb",
				"astc-10x5-unorm",
				"astc-10x5-unorm-srgb",
				"astc-10x6-unorm",
				"astc-10x6-unorm-srgb",
				"astc-10x8-unorm",
				"astc-10x8-unorm-srgb",
				"astc-10x10-unorm",
				"astc-10x10-unorm-srgb",
				"astc-12x10-unorm",
				"astc-12x10-unorm-srgb",
				"astc-12x12-unorm",
				"astc-12x12-unorm-srgb"
			],
			TextureSampleType: [
				"binding-not-used",
				,
				"float",
				"unfilterable-float",
				"depth",
				"sint",
				"uint"
			],
			TextureViewDimension: [
				,
				"1d",
				"2d",
				"2d-array",
				"cube",
				"cube-array",
				"3d"
			],
			ToneMappingMode: {
				1: "standard",
				2: "extended"
			},
			VertexFormat: {
				1: "uint8",
				2: "uint8x2",
				3: "uint8x4",
				4: "sint8",
				5: "sint8x2",
				6: "sint8x4",
				7: "unorm8",
				8: "unorm8x2",
				9: "unorm8x4",
				10: "snorm8",
				11: "snorm8x2",
				12: "snorm8x4",
				13: "uint16",
				14: "uint16x2",
				15: "uint16x4",
				16: "sint16",
				17: "sint16x2",
				18: "sint16x4",
				19: "unorm16",
				20: "unorm16x2",
				21: "unorm16x4",
				22: "snorm16",
				23: "snorm16x2",
				24: "snorm16x4",
				25: "float16",
				26: "float16x2",
				27: "float16x4",
				28: "float32",
				29: "float32x2",
				30: "float32x3",
				31: "float32x4",
				32: "uint32",
				33: "uint32x2",
				34: "uint32x3",
				35: "uint32x4",
				36: "sint32",
				37: "sint32x2",
				38: "sint32x3",
				39: "sint32x4",
				40: "unorm10-10-10-2",
				41: "unorm8x4-bgra"
			},
			VertexStepMode: [
				,
				"vertex",
				"instance"
			],
			WGSLLanguageFeatureName: {
				1: "readonly_and_readwrite_storage_textures",
				2: "packed_4x8_integer_dot_product",
				3: "unrestricted_pointer_parameters",
				4: "pointer_composite_access",
				5: "sized_binding_array"
			},
			FeatureNameString2Enum: {
				"depth-clip-control": "1",
				"depth32float-stencil8": "2",
				"timestamp-query": "3",
				"texture-compression-bc": "4",
				"texture-compression-bc-sliced-3d": "5",
				"texture-compression-etc2": "6",
				"texture-compression-astc": "7",
				"texture-compression-astc-sliced-3d": "8",
				"indirect-first-instance": "9",
				"shader-f16": "10",
				"rg11b10ufloat-renderable": "11",
				"bgra8unorm-storage": "12",
				"float32-filterable": "13",
				"float32-blendable": "14",
				"clip-distances": "15",
				"dual-source-blending": "16",
				subgroups: "17",
				"core-features-and-limits": "18",
				"chromium-experimental-unorm16-texture-formats": "327692",
				"chromium-experimental-snorm16-texture-formats": "327693",
				"chromium-experimental-multi-draw-indirect": "327732"
			},
			WGSLLanguageFeatureNameString2Enum: {
				readonly_and_readwrite_storage_textures: "1",
				packed_4x8_integer_dot_product: "2",
				unrestricted_pointer_parameters: "3",
				pointer_composite_access: "4",
				sized_binding_array: "5"
			}
		};
		function _emwgpuAdapterRequestDevice(adapterPtr, futureId, deviceLostFutureId, devicePtr, queuePtr, descriptor) {
			adapterPtr >>>= 0;
			futureId = bigintToI53Checked(futureId);
			deviceLostFutureId = bigintToI53Checked(deviceLostFutureId);
			devicePtr >>>= 0;
			queuePtr >>>= 0;
			descriptor >>>= 0;
			var adapter = WebGPU.getJsObject(adapterPtr);
			var desc = {};
			if (descriptor) {
				var requiredFeatureCount = HEAPU32[descriptor + 12 >>> 2 >>> 0];
				if (requiredFeatureCount) {
					var requiredFeaturesPtr = HEAPU32[descriptor + 16 >>> 2 >>> 0];
					desc["requiredFeatures"] = Array.from(HEAPU32.subarray(requiredFeaturesPtr >>> 2 >>> 0, requiredFeaturesPtr + requiredFeatureCount * 4 >>> 2 >>> 0), (feature) => WebGPU.FeatureName[feature]);
				}
				var limitsPtr = HEAPU32[descriptor + 20 >>> 2 >>> 0];
				if (limitsPtr) {
					var requiredLimits = {};
					function setLimitU32IfDefined(name, limitOffset, ignoreIfZero = false) {
						var ptr = limitsPtr + limitOffset;
						var value = HEAPU32[ptr >>> 2 >>> 0];
						if (value != 4294967295 && (!ignoreIfZero || value != 0)) requiredLimits[name] = value;
					}
					function setLimitU64IfDefined(name, limitOffset) {
						var ptr = limitsPtr + limitOffset;
						var limitPart1 = HEAPU32[ptr >>> 2 >>> 0];
						var limitPart2 = HEAPU32[ptr + 4 >>> 2 >>> 0];
						if (limitPart1 != 4294967295 || limitPart2 != 4294967295) requiredLimits[name] = HEAPU32[ptr + 4 >>> 2 >>> 0] * 4294967296 + HEAPU32[ptr >>> 2 >>> 0];
					}
					setLimitU32IfDefined("maxTextureDimension1D", 4);
					setLimitU32IfDefined("maxTextureDimension2D", 8);
					setLimitU32IfDefined("maxTextureDimension3D", 12);
					setLimitU32IfDefined("maxTextureArrayLayers", 16);
					setLimitU32IfDefined("maxBindGroups", 20);
					setLimitU32IfDefined("maxBindGroupsPlusVertexBuffers", 24);
					setLimitU32IfDefined("maxDynamicUniformBuffersPerPipelineLayout", 32);
					setLimitU32IfDefined("maxDynamicStorageBuffersPerPipelineLayout", 36);
					setLimitU32IfDefined("maxSampledTexturesPerShaderStage", 40);
					setLimitU32IfDefined("maxSamplersPerShaderStage", 44);
					setLimitU32IfDefined("maxStorageBuffersPerShaderStage", 48);
					setLimitU32IfDefined("maxStorageTexturesPerShaderStage", 52);
					setLimitU32IfDefined("maxUniformBuffersPerShaderStage", 56);
					setLimitU32IfDefined("minUniformBufferOffsetAlignment", 80);
					setLimitU32IfDefined("minStorageBufferOffsetAlignment", 84);
					setLimitU64IfDefined("maxUniformBufferBindingSize", 64);
					setLimitU64IfDefined("maxStorageBufferBindingSize", 72);
					setLimitU32IfDefined("maxVertexBuffers", 88);
					setLimitU64IfDefined("maxBufferSize", 96);
					setLimitU32IfDefined("maxVertexAttributes", 104);
					setLimitU32IfDefined("maxVertexBufferArrayStride", 108);
					setLimitU32IfDefined("maxInterStageShaderVariables", 112);
					setLimitU32IfDefined("maxColorAttachments", 116);
					setLimitU32IfDefined("maxColorAttachmentBytesPerSample", 120);
					setLimitU32IfDefined("maxComputeWorkgroupStorageSize", 124);
					setLimitU32IfDefined("maxComputeInvocationsPerWorkgroup", 128);
					setLimitU32IfDefined("maxComputeWorkgroupSizeX", 132);
					setLimitU32IfDefined("maxComputeWorkgroupSizeY", 136);
					setLimitU32IfDefined("maxComputeWorkgroupSizeZ", 140);
					setLimitU32IfDefined("maxComputeWorkgroupsPerDimension", 144);
					setLimitU32IfDefined("maxImmediateSize", 148, true);
					desc["requiredLimits"] = requiredLimits;
				}
				var defaultQueuePtr = HEAPU32[descriptor + 24 >>> 2 >>> 0];
				if (defaultQueuePtr) desc["defaultQueue"] = { label: WebGPU.makeStringFromOptionalStringView(defaultQueuePtr + 4) };
				desc["label"] = WebGPU.makeStringFromOptionalStringView(descriptor + 4);
			}
			WebGPU.Internals.futureInsert(futureId, adapter.requestDevice(desc).then((device) => {
				WebGPU.Internals.jsObjectInsert(queuePtr, device.queue);
				WebGPU.Internals.jsObjectInsert(devicePtr, device);
				if (deviceLostFutureId) WebGPU.Internals.futureInsert(deviceLostFutureId, device.lost.then((info) => {
					device.onuncapturederror = (ev) => {};
					var sp = stackSave();
					var messagePtr = stringToUTF8OnStack(info.message);
					_emwgpuOnDeviceLostCompleted(deviceLostFutureId, WebGPU.Int_DeviceLostReason[info.reason], messagePtr);
					stackRestore(sp);
				}));
				device.onuncapturederror = (ev) => {
					var type = 5;
					if (ev.error instanceof GPUValidationError) type = 2;
					else if (ev.error instanceof GPUOutOfMemoryError) type = 3;
					else if (ev.error instanceof GPUInternalError) type = 4;
					var sp = stackSave();
					var messagePtr = stringToUTF8OnStack(ev.error.message);
					_emwgpuOnUncapturedError(devicePtr, type, messagePtr);
					stackRestore(sp);
				};
				_emwgpuOnRequestDeviceCompleted(futureId, 1, devicePtr, 0);
			}, (ex) => {
				var sp = stackSave();
				var messagePtr = stringToUTF8OnStack(ex.message);
				_emwgpuOnRequestDeviceCompleted(futureId, 3, devicePtr, messagePtr);
				if (deviceLostFutureId) _emwgpuOnDeviceLostCompleted(deviceLostFutureId, 4, messagePtr);
				stackRestore(sp);
			}));
		}
		function _emwgpuBufferDestroy(bufferPtr) {
			bufferPtr >>>= 0;
			var buffer = WebGPU.getJsObject(bufferPtr);
			var onUnmap = WebGPU.Internals.bufferOnUnmaps[bufferPtr];
			if (onUnmap) {
				for (var i = 0; i < onUnmap.length; ++i) onUnmap[i]();
				delete WebGPU.Internals.bufferOnUnmaps[bufferPtr];
			}
			buffer.destroy();
		}
		var warnOnce = (text) => {
			warnOnce.shown || (warnOnce.shown = {});
			if (!warnOnce.shown[text]) {
				warnOnce.shown[text] = 1;
				err(text);
			}
		};
		function _emwgpuBufferGetConstMappedRange(bufferPtr, offset, size) {
			bufferPtr >>>= 0;
			offset >>>= 0;
			size >>>= 0;
			var buffer = WebGPU.getJsObject(bufferPtr);
			if (size === 0) warnOnce("getMappedRange size=0 no longer means WGPU_WHOLE_MAP_SIZE");
			if (size == 4294967295) size = void 0;
			var mapped;
			try {
				mapped = buffer.getMappedRange(offset, size);
			} catch (ex) {
				return 0;
			}
			var data = _memalign(16, mapped.byteLength);
			HEAPU8.set(new Uint8Array(mapped), data >>> 0);
			WebGPU.Internals.bufferOnUnmaps[bufferPtr].push(() => _free(data));
			return data;
		}
		var _emwgpuBufferMapAsync = function(bufferPtr, futureId, mode, offset, size) {
			bufferPtr >>>= 0;
			futureId = bigintToI53Checked(futureId);
			mode = bigintToI53Checked(mode);
			offset >>>= 0;
			size >>>= 0;
			var buffer = WebGPU.getJsObject(bufferPtr);
			WebGPU.Internals.bufferOnUnmaps[bufferPtr] = [];
			if (size == 4294967295) size = void 0;
			WebGPU.Internals.futureInsert(futureId, buffer.mapAsync(mode, offset, size).then(() => {
				_emwgpuOnMapAsyncCompleted(futureId, 1, 0);
			}, (ex) => {
				stackSave();
				var messagePtr = stringToUTF8OnStack(ex.message);
				var status = ex.name === "AbortError" ? 4 : ex.name === "OperationError" ? 3 : 0;
				_emwgpuOnMapAsyncCompleted(futureId, status, messagePtr);
				delete WebGPU.Internals.bufferOnUnmaps[bufferPtr];
			}));
		};
		function _emwgpuBufferUnmap(bufferPtr) {
			bufferPtr >>>= 0;
			var buffer = WebGPU.getJsObject(bufferPtr);
			var onUnmap = WebGPU.Internals.bufferOnUnmaps[bufferPtr];
			if (!onUnmap) return;
			for (var i = 0; i < onUnmap.length; ++i) onUnmap[i]();
			delete WebGPU.Internals.bufferOnUnmaps[bufferPtr];
			buffer.unmap();
		}
		function _emwgpuDelete(ptr) {
			ptr >>>= 0;
			delete WebGPU.Internals.jsObjects[ptr];
		}
		function _emwgpuDeviceCreateBuffer(devicePtr, descriptor, bufferPtr) {
			devicePtr >>>= 0;
			descriptor >>>= 0;
			bufferPtr >>>= 0;
			var mappedAtCreation = !!HEAPU32[descriptor + 32 >>> 2 >>> 0];
			var desc = {
				label: WebGPU.makeStringFromOptionalStringView(descriptor + 4),
				usage: HEAPU32[descriptor + 16 >>> 2 >>> 0],
				size: HEAPU32[descriptor + 4 + 24 >>> 2 >>> 0] * 4294967296 + HEAPU32[descriptor + 24 >>> 2 >>> 0],
				mappedAtCreation
			};
			var device = WebGPU.getJsObject(devicePtr);
			var buffer;
			try {
				buffer = device.createBuffer(desc);
			} catch (ex) {
				return false;
			}
			WebGPU.Internals.jsObjectInsert(bufferPtr, buffer);
			if (mappedAtCreation) WebGPU.Internals.bufferOnUnmaps[bufferPtr] = [];
			return true;
		}
		function _emwgpuDeviceCreateShaderModule(devicePtr, descriptor, shaderModulePtr) {
			devicePtr >>>= 0;
			descriptor >>>= 0;
			shaderModulePtr >>>= 0;
			var nextInChainPtr = HEAPU32[descriptor >>> 2 >>> 0];
			var sType = HEAPU32[nextInChainPtr + 4 >>> 2 >>> 0];
			var desc = {
				label: WebGPU.makeStringFromOptionalStringView(descriptor + 4),
				code: ""
			};
			switch (sType) {
				case 2:
					desc["code"] = WebGPU.makeStringFromStringView(nextInChainPtr + 8);
					break;
			}
			var device = WebGPU.getJsObject(devicePtr);
			WebGPU.Internals.jsObjectInsert(shaderModulePtr, device.createShaderModule(desc));
		}
		var _emwgpuDeviceDestroy = (devicePtr) => {
			WebGPU.getJsObject(devicePtr).destroy();
		};
		function _emwgpuInstanceRequestAdapter(instancePtr, futureId, options, adapterPtr) {
			instancePtr >>>= 0;
			futureId = bigintToI53Checked(futureId);
			options >>>= 0;
			adapterPtr >>>= 0;
			var opts;
			if (options) {
				var featureLevel = HEAPU32[options + 4 >>> 2 >>> 0];
				opts = {
					featureLevel: WebGPU.FeatureLevel[featureLevel],
					powerPreference: WebGPU.PowerPreference[HEAPU32[options + 8 >>> 2 >>> 0]],
					forceFallbackAdapter: !!HEAPU32[options + 12 >>> 2 >>> 0]
				};
				var nextInChainPtr = HEAPU32[options >>> 2 >>> 0];
				if (nextInChainPtr !== 0) {
					HEAPU32[nextInChainPtr + 4 >>> 2 >>> 0];
					opts.xrCompatible = !!HEAPU32[nextInChainPtr + 8 >>> 2 >>> 0];
				}
			}
			if (!("gpu" in navigator)) {
				var sp = stackSave();
				var messagePtr = stringToUTF8OnStack("WebGPU not available on this browser (navigator.gpu is not available)");
				_emwgpuOnRequestAdapterCompleted(futureId, 3, adapterPtr, messagePtr);
				stackRestore(sp);
				return;
			}
			WebGPU.Internals.futureInsert(futureId, navigator["gpu"]["requestAdapter"](opts).then((adapter) => {
				if (adapter) {
					WebGPU.Internals.jsObjectInsert(adapterPtr, adapter);
					_emwgpuOnRequestAdapterCompleted(futureId, 1, adapterPtr, 0);
				} else {
					var sp = stackSave();
					var messagePtr = stringToUTF8OnStack("WebGPU not available on this browser (requestAdapter returned null)");
					_emwgpuOnRequestAdapterCompleted(futureId, 3, adapterPtr, messagePtr);
					stackRestore(sp);
				}
			}, (ex) => {
				var sp = stackSave();
				var messagePtr = stringToUTF8OnStack(ex.message);
				_emwgpuOnRequestAdapterCompleted(futureId, 4, adapterPtr, messagePtr);
				stackRestore(sp);
			}));
		}
		var ENV = {};
		var getExecutableName = () => thisProgram || "./this.program";
		var getEnvStrings = () => {
			if (!getEnvStrings.strings) {
				var env = {
					USER: "web_user",
					LOGNAME: "web_user",
					PATH: "/",
					PWD: "/",
					HOME: "/home/web_user",
					LANG: (typeof navigator == "object" && navigator.language || "C").replace("-", "_") + ".UTF-8",
					_: getExecutableName()
				};
				for (var x in ENV) if (ENV[x] === void 0) delete env[x];
				else env[x] = ENV[x];
				var strings = [];
				for (var x in env) strings.push(`${x}=${env[x]}`);
				getEnvStrings.strings = strings;
			}
			return getEnvStrings.strings;
		};
		function _environ_get(__environ, environ_buf) {
			__environ >>>= 0;
			environ_buf >>>= 0;
			var bufSize = 0;
			var envp = 0;
			for (var string of getEnvStrings()) {
				var ptr = environ_buf + bufSize;
				HEAPU32[__environ + envp >>> 2 >>> 0] = ptr;
				bufSize += stringToUTF8(string, ptr, Infinity) + 1;
				envp += 4;
			}
			return 0;
		}
		function _environ_sizes_get(penviron_count, penviron_buf_size) {
			penviron_count >>>= 0;
			penviron_buf_size >>>= 0;
			var strings = getEnvStrings();
			HEAPU32[penviron_count >>> 2 >>> 0] = strings.length;
			var bufSize = 0;
			for (var string of strings) bufSize += lengthBytesUTF8(string) + 1;
			HEAPU32[penviron_buf_size >>> 2 >>> 0] = bufSize;
			return 0;
		}
		var _fd_close = (fd) => 52;
		function _fd_read(fd, iov, iovcnt, pnum) {
			iov >>>= 0;
			iovcnt >>>= 0;
			pnum >>>= 0;
			return 52;
		}
		function _fd_seek(fd, offset, whence, newOffset) {
			offset = bigintToI53Checked(offset);
			newOffset >>>= 0;
			return 70;
		}
		var printCharBuffers = [
			null,
			[],
			[]
		];
		var printChar = (stream, curr) => {
			var buffer = printCharBuffers[stream];
			if (curr === 0 || curr === 10) {
				(stream === 1 ? out : err)(UTF8ArrayToString(buffer));
				buffer.length = 0;
			} else buffer.push(curr);
		};
		function _fd_write(fd, iov, iovcnt, pnum) {
			iov >>>= 0;
			iovcnt >>>= 0;
			pnum >>>= 0;
			var num = 0;
			for (var i = 0; i < iovcnt; i++) {
				var ptr = HEAPU32[iov >>> 2 >>> 0];
				var len = HEAPU32[iov + 4 >>> 2 >>> 0];
				iov += 8;
				for (var j = 0; j < len; j++) printChar(fd, HEAPU8[ptr + j >>> 0]);
				num += len;
			}
			HEAPU32[pnum >>> 2 >>> 0] = num;
			return 0;
		}
		var initRandomFill = () => (view) => crypto.getRandomValues(view);
		var randomFill = (view) => {
			(randomFill = initRandomFill())(view);
		};
		function _random_get(buffer, size) {
			buffer >>>= 0;
			size >>>= 0;
			randomFill(HEAPU8.subarray(buffer >>> 0, buffer + size >>> 0));
			return 0;
		}
		function _wgpuAdapterGetLimits(adapterPtr, limitsOutPtr) {
			adapterPtr >>>= 0;
			limitsOutPtr >>>= 0;
			var adapter = WebGPU.getJsObject(adapterPtr);
			WebGPU.fillLimitStruct(adapter.limits, limitsOutPtr);
			return 1;
		}
		function _wgpuCommandEncoderBeginComputePass(encoderPtr, descriptor) {
			encoderPtr >>>= 0;
			descriptor >>>= 0;
			var desc;
			if (descriptor) desc = {
				label: WebGPU.makeStringFromOptionalStringView(descriptor + 4),
				timestampWrites: WebGPU.makePassTimestampWrites(HEAPU32[descriptor + 12 >>> 2 >>> 0])
			};
			var commandEncoder = WebGPU.getJsObject(encoderPtr);
			var ptr = _emwgpuCreateComputePassEncoder(0);
			WebGPU.Internals.jsObjectInsert(ptr, commandEncoder.beginComputePass(desc));
			return ptr;
		}
		function _wgpuCommandEncoderCopyBufferToBuffer(encoderPtr, srcPtr, srcOffset, dstPtr, dstOffset, size) {
			encoderPtr >>>= 0;
			srcPtr >>>= 0;
			srcOffset = bigintToI53Checked(srcOffset);
			dstPtr >>>= 0;
			dstOffset = bigintToI53Checked(dstOffset);
			size = bigintToI53Checked(size);
			var commandEncoder = WebGPU.getJsObject(encoderPtr);
			var src = WebGPU.getJsObject(srcPtr);
			var dst = WebGPU.getJsObject(dstPtr);
			commandEncoder.copyBufferToBuffer(src, srcOffset, dst, dstOffset, size);
		}
		function _wgpuCommandEncoderCopyTextureToBuffer(encoderPtr, srcPtr, dstPtr, copySizePtr) {
			encoderPtr >>>= 0;
			srcPtr >>>= 0;
			dstPtr >>>= 0;
			copySizePtr >>>= 0;
			var commandEncoder = WebGPU.getJsObject(encoderPtr);
			var copySize = WebGPU.makeExtent3D(copySizePtr);
			commandEncoder.copyTextureToBuffer(WebGPU.makeTexelCopyTextureInfo(srcPtr), WebGPU.makeTexelCopyBufferInfo(dstPtr), copySize);
		}
		function _wgpuCommandEncoderFinish(encoderPtr, descriptor) {
			encoderPtr >>>= 0;
			descriptor >>>= 0;
			var commandEncoder = WebGPU.getJsObject(encoderPtr);
			var ptr = _emwgpuCreateCommandBuffer(0);
			WebGPU.Internals.jsObjectInsert(ptr, commandEncoder.finish());
			return ptr;
		}
		function _wgpuComputePassEncoderDispatchWorkgroups(passPtr, x, y, z) {
			passPtr >>>= 0;
			WebGPU.getJsObject(passPtr).dispatchWorkgroups(x, y, z);
		}
		function _wgpuComputePassEncoderEnd(passPtr) {
			passPtr >>>= 0;
			WebGPU.getJsObject(passPtr).end();
		}
		function _wgpuComputePassEncoderSetBindGroup(passPtr, groupIndex, groupPtr, dynamicOffsetCount, dynamicOffsetsPtr) {
			passPtr >>>= 0;
			groupPtr >>>= 0;
			dynamicOffsetCount >>>= 0;
			dynamicOffsetsPtr >>>= 0;
			var pass = WebGPU.getJsObject(passPtr);
			var group = WebGPU.getJsObject(groupPtr);
			if (dynamicOffsetCount == 0) pass.setBindGroup(groupIndex, group);
			else pass.setBindGroup(groupIndex, group, HEAPU32, dynamicOffsetsPtr >>> 2, dynamicOffsetCount);
		}
		function _wgpuComputePassEncoderSetPipeline(passPtr, pipelinePtr) {
			passPtr >>>= 0;
			pipelinePtr >>>= 0;
			var pass = WebGPU.getJsObject(passPtr);
			var pipeline = WebGPU.getJsObject(pipelinePtr);
			pass.setPipeline(pipeline);
		}
		function _wgpuComputePipelineGetBindGroupLayout(pipelinePtr, groupIndex) {
			pipelinePtr >>>= 0;
			var pipeline = WebGPU.getJsObject(pipelinePtr);
			var ptr = _emwgpuCreateBindGroupLayout(0);
			WebGPU.Internals.jsObjectInsert(ptr, pipeline.getBindGroupLayout(groupIndex));
			return ptr;
		}
		var readI53FromI64 = (ptr) => HEAPU32[ptr >>> 2 >>> 0] + HEAP32[ptr + 4 >>> 2 >>> 0] * 4294967296;
		function _wgpuDeviceCreateBindGroup(devicePtr, descriptor) {
			devicePtr >>>= 0;
			descriptor >>>= 0;
			function makeEntry(entryPtr) {
				var bufferPtr = HEAPU32[entryPtr + 8 >>> 2 >>> 0];
				var samplerPtr = HEAPU32[entryPtr + 32 >>> 2 >>> 0];
				var textureViewPtr = HEAPU32[entryPtr + 36 >>> 2 >>> 0];
				var binding = HEAPU32[entryPtr + 4 >>> 2 >>> 0];
				if (bufferPtr) {
					var size = readI53FromI64(entryPtr + 24);
					if (size == -1) size = void 0;
					return {
						binding,
						resource: {
							buffer: WebGPU.getJsObject(bufferPtr),
							offset: HEAPU32[entryPtr + 4 + 16 >>> 2 >>> 0] * 4294967296 + HEAPU32[entryPtr + 16 >>> 2 >>> 0],
							size
						}
					};
				} else if (samplerPtr) return {
					binding,
					resource: WebGPU.getJsObject(samplerPtr)
				};
				else return {
					binding,
					resource: WebGPU.getJsObject(textureViewPtr)
				};
			}
			function makeEntries(count, entriesPtrs) {
				var entries = [];
				for (var i = 0; i < count; ++i) entries.push(makeEntry(entriesPtrs + 40 * i));
				return entries;
			}
			var desc = {
				label: WebGPU.makeStringFromOptionalStringView(descriptor + 4),
				layout: WebGPU.getJsObject(HEAPU32[descriptor + 12 >>> 2 >>> 0]),
				entries: makeEntries(HEAPU32[descriptor + 16 >>> 2 >>> 0], HEAPU32[descriptor + 20 >>> 2 >>> 0])
			};
			var device = WebGPU.getJsObject(devicePtr);
			var ptr = _emwgpuCreateBindGroup(0);
			WebGPU.Internals.jsObjectInsert(ptr, device.createBindGroup(desc));
			return ptr;
		}
		function _wgpuDeviceCreateCommandEncoder(devicePtr, descriptor) {
			devicePtr >>>= 0;
			descriptor >>>= 0;
			var desc;
			if (descriptor) desc = { label: WebGPU.makeStringFromOptionalStringView(descriptor + 4) };
			var device = WebGPU.getJsObject(devicePtr);
			var ptr = _emwgpuCreateCommandEncoder(0);
			WebGPU.Internals.jsObjectInsert(ptr, device.createCommandEncoder(desc));
			return ptr;
		}
		function _wgpuDeviceCreateComputePipeline(devicePtr, descriptor) {
			devicePtr >>>= 0;
			descriptor >>>= 0;
			var desc = WebGPU.makeComputePipelineDesc(descriptor);
			var device = WebGPU.getJsObject(devicePtr);
			var ptr = _emwgpuCreateComputePipeline(0);
			WebGPU.Internals.jsObjectInsert(ptr, device.createComputePipeline(desc));
			return ptr;
		}
		function _wgpuDeviceCreateTexture(devicePtr, descriptor) {
			devicePtr >>>= 0;
			descriptor >>>= 0;
			var desc = {
				label: WebGPU.makeStringFromOptionalStringView(descriptor + 4),
				size: WebGPU.makeExtent3D(descriptor + 28),
				mipLevelCount: HEAPU32[descriptor + 44 >>> 2 >>> 0],
				sampleCount: HEAPU32[descriptor + 48 >>> 2 >>> 0],
				dimension: WebGPU.TextureDimension[HEAPU32[descriptor + 24 >>> 2 >>> 0]],
				format: WebGPU.TextureFormat[HEAPU32[descriptor + 40 >>> 2 >>> 0]],
				usage: HEAPU32[descriptor + 16 >>> 2 >>> 0]
			};
			var viewFormatCount = HEAPU32[descriptor + 52 >>> 2 >>> 0];
			if (viewFormatCount) {
				var viewFormatsPtr = HEAPU32[descriptor + 56 >>> 2 >>> 0];
				desc["viewFormats"] = Array.from(HEAP32.subarray(viewFormatsPtr >>> 2 >>> 0, viewFormatsPtr + viewFormatCount * 4 >>> 2 >>> 0), (format) => WebGPU.TextureFormat[format]);
			}
			var device = WebGPU.getJsObject(devicePtr);
			var ptr = _emwgpuCreateTexture(0);
			WebGPU.Internals.jsObjectInsert(ptr, device.createTexture(desc));
			return ptr;
		}
		var _wgpuQueueSubmit = function(queuePtr, commandCount, commands) {
			queuePtr >>>= 0;
			commandCount >>>= 0;
			commands >>>= 0;
			var queue = WebGPU.getJsObject(queuePtr);
			var cmds = Array.from(HEAP32.subarray(commands >>> 2 >>> 0, commands + commandCount * 4 >>> 2 >>> 0), (id) => WebGPU.getJsObject(id));
			queue.submit(cmds);
		};
		function _wgpuQueueWriteBuffer(queuePtr, bufferPtr, bufferOffset, data, size) {
			queuePtr >>>= 0;
			bufferPtr >>>= 0;
			bufferOffset = bigintToI53Checked(bufferOffset);
			data >>>= 0;
			size >>>= 0;
			var queue = WebGPU.getJsObject(queuePtr);
			var buffer = WebGPU.getJsObject(bufferPtr);
			var subarray = HEAPU8.subarray(data >>> 0, data + size >>> 0);
			queue.writeBuffer(buffer, bufferOffset, subarray, 0, size);
		}
		function _wgpuQueueWriteTexture(queuePtr, destinationPtr, data, dataSize, dataLayoutPtr, writeSizePtr) {
			queuePtr >>>= 0;
			destinationPtr >>>= 0;
			data >>>= 0;
			dataSize >>>= 0;
			dataLayoutPtr >>>= 0;
			writeSizePtr >>>= 0;
			var queue = WebGPU.getJsObject(queuePtr);
			var destination = WebGPU.makeTexelCopyTextureInfo(destinationPtr);
			var dataLayout = WebGPU.makeTexelCopyBufferLayout(dataLayoutPtr);
			var writeSize = WebGPU.makeExtent3D(writeSizePtr);
			var subarray = HEAPU8.subarray(data >>> 0, data + dataSize >>> 0);
			queue.writeTexture(destination, subarray, dataLayout, writeSize);
		}
		function _wgpuTextureCreateView(texturePtr, descriptor) {
			texturePtr >>>= 0;
			descriptor >>>= 0;
			var desc;
			if (descriptor) {
				var mipLevelCount = HEAPU32[descriptor + 24 >>> 2 >>> 0];
				var arrayLayerCount = HEAPU32[descriptor + 32 >>> 2 >>> 0];
				desc = {
					label: WebGPU.makeStringFromOptionalStringView(descriptor + 4),
					format: WebGPU.TextureFormat[HEAPU32[descriptor + 12 >>> 2 >>> 0]],
					dimension: WebGPU.TextureViewDimension[HEAPU32[descriptor + 16 >>> 2 >>> 0]],
					baseMipLevel: HEAPU32[descriptor + 20 >>> 2 >>> 0],
					mipLevelCount: mipLevelCount === 4294967295 ? void 0 : mipLevelCount,
					baseArrayLayer: HEAPU32[descriptor + 28 >>> 2 >>> 0],
					arrayLayerCount: arrayLayerCount === 4294967295 ? void 0 : arrayLayerCount,
					aspect: WebGPU.TextureAspect[HEAPU32[descriptor + 36 >>> 2 >>> 0]]
				};
			}
			var texture = WebGPU.getJsObject(texturePtr);
			var ptr = _emwgpuCreateTextureView(0);
			WebGPU.Internals.jsObjectInsert(ptr, texture.createView(desc));
			return ptr;
		}
		function _wgpuTextureDestroy(texturePtr) {
			texturePtr >>>= 0;
			WebGPU.getJsObject(texturePtr).destroy();
		}
		var wasmTable;
		var runAndAbortIfError = (func) => {
			try {
				return func();
			} catch (e) {
				abort(e);
			}
		};
		var runtimeKeepalivePush = () => {
			runtimeKeepaliveCounter += 1;
		};
		var runtimeKeepalivePop = () => {
			runtimeKeepaliveCounter -= 1;
		};
		var Asyncify = {
			instrumentWasmImports(imports) {
				var importPattern = /^(invoke_.*|__asyncjs__.*)$/;
				for (let [x, original] of Object.entries(imports)) if (typeof original == "function") original.isAsync || importPattern.test(x);
			},
			instrumentFunction(original) {
				var wrapper = (...args) => {
					Asyncify.exportCallStack.push(original);
					try {
						return original(...args);
					} finally {
						if (!ABORT) {
							Asyncify.exportCallStack.pop();
							Asyncify.maybeStopUnwind();
						}
					}
				};
				Asyncify.funcWrappers.set(original, wrapper);
				return wrapper;
			},
			instrumentWasmExports(exports) {
				var ret = {};
				for (let [x, original] of Object.entries(exports)) if (typeof original == "function") ret[x] = Asyncify.instrumentFunction(original);
				else ret[x] = original;
				return ret;
			},
			State: {
				Normal: 0,
				Unwinding: 1,
				Rewinding: 2,
				Disabled: 3
			},
			state: 0,
			StackSize: 131272,
			currData: null,
			handleSleepReturnValue: 0,
			exportCallStack: [],
			callstackFuncToId: /* @__PURE__ */ new Map(),
			callStackIdToFunc: /* @__PURE__ */ new Map(),
			funcWrappers: /* @__PURE__ */ new Map(),
			callStackId: 0,
			asyncPromiseHandlers: null,
			sleepCallbacks: [],
			getCallStackId(func) {
				if (!Asyncify.callstackFuncToId.has(func)) {
					var id = Asyncify.callStackId++;
					Asyncify.callstackFuncToId.set(func, id);
					Asyncify.callStackIdToFunc.set(id, func);
				}
				return Asyncify.callstackFuncToId.get(func);
			},
			maybeStopUnwind() {
				if (Asyncify.currData && Asyncify.state === Asyncify.State.Unwinding && Asyncify.exportCallStack.length === 0) {
					Asyncify.state = Asyncify.State.Normal;
					runAndAbortIfError(_asyncify_stop_unwind);
					if (typeof Fibers != "undefined") Fibers.trampoline();
				}
			},
			whenDone() {
				return new Promise((resolve, reject) => {
					Asyncify.asyncPromiseHandlers = {
						resolve,
						reject
					};
				});
			},
			allocateData() {
				var ptr = _malloc(12 + Asyncify.StackSize);
				Asyncify.setDataHeader(ptr, ptr + 12, Asyncify.StackSize);
				Asyncify.setDataRewindFunc(ptr);
				return ptr;
			},
			setDataHeader(ptr, stack, stackSize) {
				HEAPU32[ptr >>> 2 >>> 0] = stack;
				HEAPU32[ptr + 4 >>> 2 >>> 0] = stack + stackSize;
			},
			setDataRewindFunc(ptr) {
				var bottomOfCallStack = Asyncify.exportCallStack[0];
				var rewindId = Asyncify.getCallStackId(bottomOfCallStack);
				HEAP32[ptr + 8 >>> 2 >>> 0] = rewindId;
			},
			getDataRewindFunc(ptr) {
				var id = HEAP32[ptr + 8 >>> 2 >>> 0];
				return Asyncify.callStackIdToFunc.get(id);
			},
			doRewind(ptr) {
				var original = Asyncify.getDataRewindFunc(ptr);
				return Asyncify.funcWrappers.get(original)();
			},
			handleSleep(startAsync) {
				if (ABORT) return;
				if (Asyncify.state === Asyncify.State.Normal) {
					var reachedCallback = false;
					var reachedAfterCallback = false;
					startAsync((handleSleepReturnValue = 0) => {
						if (ABORT) return;
						Asyncify.handleSleepReturnValue = handleSleepReturnValue;
						reachedCallback = true;
						if (!reachedAfterCallback) return;
						Asyncify.state = Asyncify.State.Rewinding;
						runAndAbortIfError(() => _asyncify_start_rewind(Asyncify.currData));
						if (typeof MainLoop != "undefined" && MainLoop.func) MainLoop.resume();
						var asyncWasmReturnValue, isError = false;
						try {
							asyncWasmReturnValue = Asyncify.doRewind(Asyncify.currData);
						} catch (err) {
							asyncWasmReturnValue = err;
							isError = true;
						}
						var handled = false;
						if (!Asyncify.currData) {
							var asyncPromiseHandlers = Asyncify.asyncPromiseHandlers;
							if (asyncPromiseHandlers) {
								Asyncify.asyncPromiseHandlers = null;
								(isError ? asyncPromiseHandlers.reject : asyncPromiseHandlers.resolve)(asyncWasmReturnValue);
								handled = true;
							}
						}
						if (isError && !handled) throw asyncWasmReturnValue;
					});
					reachedAfterCallback = true;
					if (!reachedCallback) {
						Asyncify.state = Asyncify.State.Unwinding;
						Asyncify.currData = Asyncify.allocateData();
						if (typeof MainLoop != "undefined" && MainLoop.func) MainLoop.pause();
						runAndAbortIfError(() => _asyncify_start_unwind(Asyncify.currData));
					}
				} else if (Asyncify.state === Asyncify.State.Rewinding) {
					Asyncify.state = Asyncify.State.Normal;
					runAndAbortIfError(_asyncify_stop_rewind);
					_free(Asyncify.currData);
					Asyncify.currData = null;
					Asyncify.sleepCallbacks.forEach(callUserCallback);
				} else abort(`invalid state: ${Asyncify.state}`);
				return Asyncify.handleSleepReturnValue;
			},
			handleAsync: (startAsync) => Asyncify.handleSleep((wakeUp) => {
				startAsync().then(wakeUp);
			})
		};
		var getCFunc = (ident) => {
			return Module["_" + ident];
		};
		var writeArrayToMemory = (array, buffer) => {
			HEAP8.set(array, buffer >>> 0);
		};
		var ccall = (ident, returnType, argTypes, args, opts) => {
			var toC = {
				string: (str) => {
					var ret = 0;
					if (str !== null && str !== void 0 && str !== 0) ret = stringToUTF8OnStack(str);
					return ret;
				},
				array: (arr) => {
					var ret = stackAlloc(arr.length);
					writeArrayToMemory(arr, ret);
					return ret;
				}
			};
			function convertReturnValue(ret) {
				if (returnType === "string") return UTF8ToString(ret);
				if (returnType === "boolean") return Boolean(ret);
				return ret;
			}
			var func = getCFunc(ident);
			var cArgs = [];
			var stack = 0;
			if (args) for (var i = 0; i < args.length; i++) {
				var converter = toC[argTypes[i]];
				if (converter) {
					if (stack === 0) stack = stackSave();
					cArgs[i] = converter(args[i]);
				} else cArgs[i] = args[i];
			}
			var previousAsync = Asyncify.currData;
			var ret = func(...cArgs);
			function onDone(ret) {
				runtimeKeepalivePop();
				if (stack !== 0) stackRestore(stack);
				return convertReturnValue(ret);
			}
			var asyncMode = opts?.async;
			runtimeKeepalivePush();
			if (Asyncify.currData != previousAsync) return Asyncify.whenDone().then(onDone);
			ret = onDone(ret);
			if (asyncMode) return Promise.resolve(ret);
			return ret;
		};
		var cwrap = (ident, returnType, argTypes, opts) => {
			var numericArgs = !argTypes || argTypes.every((type) => type === "number" || type === "boolean");
			if (returnType !== "string" && numericArgs && !opts) return getCFunc(ident);
			return (...args) => ccall(ident, returnType, argTypes, args, opts);
		};
		if (Module["noExitRuntime"]) noExitRuntime = Module["noExitRuntime"];
		if (Module["print"]) out = Module["print"];
		if (Module["printErr"]) err = Module["printErr"];
		if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
		if (Module["arguments"]) Module["arguments"];
		if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
		Module["ccall"] = ccall;
		Module["cwrap"] = cwrap;
		Module["setValue"] = setValue;
		Module["getValue"] = getValue;
		Module["UTF8ToString"] = UTF8ToString;
		Module["stringToUTF8"] = stringToUTF8;
		Module["lengthBytesUTF8"] = lengthBytesUTF8;
		var _malloc, _emwgpuCreateBindGroup, _emwgpuCreateBindGroupLayout, _emwgpuCreateCommandBuffer, _emwgpuCreateCommandEncoder, _emwgpuCreateComputePassEncoder, _emwgpuCreateComputePipeline, _emwgpuCreatePipelineLayout, _emwgpuCreateQuerySet, _emwgpuCreateRenderBundle, _emwgpuCreateRenderBundleEncoder, _emwgpuCreateRenderPassEncoder, _emwgpuCreateRenderPipeline, _emwgpuCreateSampler, _emwgpuCreateSurface, _emwgpuCreateTexture, _emwgpuCreateTextureView, _emwgpuCreateAdapter, _emwgpuCreateBuffer, _emwgpuCreateDevice, _emwgpuCreateQueue, _emwgpuCreateShaderModule, _emwgpuOnDeviceLostCompleted, _emwgpuOnMapAsyncCompleted, _emwgpuOnRequestAdapterCompleted, _emwgpuOnRequestDeviceCompleted, _emwgpuOnUncapturedError, _free, _memalign, _setThrew, __emscripten_tempret_set, __emscripten_stack_restore, __emscripten_stack_alloc, _emscripten_stack_get_current, ___cxa_decrement_exception_refcount, ___cxa_increment_exception_refcount, ___cxa_can_catch, ___cxa_get_exception_ptr, dynCall_vi, dynCall_viii, dynCall_ii, dynCall_viiii, dynCall_vii, dynCall_iii, dynCall_v, dynCall_iiiiii, dynCall_iiiiij, dynCall_iiiiid, dynCall_iiii, dynCall_iiiiiiii, dynCall_iiiii, dynCall_jiiii, dynCall_fiii, dynCall_diii, dynCall_i, dynCall_viiiiiii, dynCall_iiiiiii, dynCall_iiiiiiiiiiii, dynCall_viiiiiiiiii, dynCall_viiiiiiiiiiiiiii, _asyncify_start_unwind, _asyncify_stop_unwind, _asyncify_start_rewind, _asyncify_stop_rewind;
		function assignWasmExports(wasmExports) {
			Module["_gaussian_blur_fft"] = wasmExports["ta"];
			Module["_invert_image"] = wasmExports["ua"];
			Module["_threshold_image"] = wasmExports["va"];
			Module["_black_threshold_image"] = wasmExports["wa"];
			Module["_kmeans"] = wasmExports["xa"];
			Module["_bilateral_filter"] = wasmExports["ya"];
			Module["_labels_to_svg"] = wasmExports["za"];
			Module["_image_to_svg"] = wasmExports["Aa"];
			Module["_malloc"] = _malloc = wasmExports["Ca"];
			_emwgpuCreateBindGroup = wasmExports["Da"];
			_emwgpuCreateBindGroupLayout = wasmExports["Ea"];
			_emwgpuCreateCommandBuffer = wasmExports["Fa"];
			_emwgpuCreateCommandEncoder = wasmExports["Ga"];
			_emwgpuCreateComputePassEncoder = wasmExports["Ha"];
			_emwgpuCreateComputePipeline = wasmExports["Ia"];
			_emwgpuCreatePipelineLayout = wasmExports["Ja"];
			_emwgpuCreateQuerySet = wasmExports["Ka"];
			_emwgpuCreateRenderBundle = wasmExports["La"];
			_emwgpuCreateRenderBundleEncoder = wasmExports["Ma"];
			_emwgpuCreateRenderPassEncoder = wasmExports["Na"];
			_emwgpuCreateRenderPipeline = wasmExports["Oa"];
			_emwgpuCreateSampler = wasmExports["Pa"];
			_emwgpuCreateSurface = wasmExports["Qa"];
			_emwgpuCreateTexture = wasmExports["Ra"];
			_emwgpuCreateTextureView = wasmExports["Sa"];
			_emwgpuCreateAdapter = wasmExports["Ta"];
			_emwgpuCreateBuffer = wasmExports["Ua"];
			_emwgpuCreateDevice = wasmExports["Va"];
			_emwgpuCreateQueue = wasmExports["Wa"];
			_emwgpuCreateShaderModule = wasmExports["Xa"];
			_emwgpuOnDeviceLostCompleted = wasmExports["Ya"];
			_emwgpuOnMapAsyncCompleted = wasmExports["Za"];
			_emwgpuOnRequestAdapterCompleted = wasmExports["_a"];
			_emwgpuOnRequestDeviceCompleted = wasmExports["$a"];
			_emwgpuOnUncapturedError = wasmExports["ab"];
			Module["_free"] = _free = wasmExports["bb"];
			_memalign = wasmExports["cb"];
			_setThrew = wasmExports["db"];
			__emscripten_tempret_set = wasmExports["eb"];
			__emscripten_stack_restore = wasmExports["fb"];
			__emscripten_stack_alloc = wasmExports["gb"];
			_emscripten_stack_get_current = wasmExports["hb"];
			___cxa_decrement_exception_refcount = wasmExports["ib"];
			___cxa_increment_exception_refcount = wasmExports["jb"];
			___cxa_can_catch = wasmExports["kb"];
			___cxa_get_exception_ptr = wasmExports["lb"];
			dynCalls["vi"] = dynCall_vi = wasmExports["mb"];
			dynCalls["viiiii"] = wasmExports["nb"];
			dynCalls["viii"] = dynCall_viii = wasmExports["ob"];
			dynCalls["ii"] = dynCall_ii = wasmExports["pb"];
			dynCalls["viiii"] = dynCall_viiii = wasmExports["qb"];
			dynCalls["vii"] = dynCall_vii = wasmExports["rb"];
			dynCalls["iii"] = dynCall_iii = wasmExports["sb"];
			dynCalls["viji"] = wasmExports["tb"];
			dynCalls["v"] = dynCall_v = wasmExports["ub"];
			dynCalls["iiiiii"] = dynCall_iiiiii = wasmExports["vb"];
			dynCalls["iiiiij"] = dynCall_iiiiij = wasmExports["wb"];
			dynCalls["iiiiid"] = dynCall_iiiiid = wasmExports["xb"];
			dynCalls["iiii"] = dynCall_iiii = wasmExports["yb"];
			dynCalls["viijii"] = wasmExports["zb"];
			dynCalls["jiji"] = wasmExports["Ab"];
			dynCalls["iidiiii"] = wasmExports["Bb"];
			dynCalls["iiiiiiii"] = dynCall_iiiiiiii = wasmExports["Cb"];
			dynCalls["iiiiiiiiiii"] = wasmExports["Db"];
			dynCalls["iiiii"] = dynCall_iiiii = wasmExports["Eb"];
			dynCalls["jiiii"] = dynCall_jiiii = wasmExports["Fb"];
			dynCalls["iiiiiiiiiiiii"] = wasmExports["Gb"];
			dynCalls["fiii"] = dynCall_fiii = wasmExports["Hb"];
			dynCalls["diii"] = dynCall_diii = wasmExports["Ib"];
			dynCalls["i"] = dynCall_i = wasmExports["Jb"];
			dynCalls["viiiiiii"] = dynCall_viiiiiii = wasmExports["Kb"];
			dynCalls["iiiiiii"] = dynCall_iiiiiii = wasmExports["Lb"];
			dynCalls["iiiiiiiiiiii"] = dynCall_iiiiiiiiiiii = wasmExports["Mb"];
			dynCalls["viiiiiiiiii"] = dynCall_viiiiiiiiii = wasmExports["Nb"];
			dynCalls["viiiiiiiiiiiiiii"] = dynCall_viiiiiiiiiiiiiii = wasmExports["Ob"];
			dynCalls["iiiiiiiii"] = wasmExports["Pb"];
			dynCalls["iiiiijj"] = wasmExports["Qb"];
			dynCalls["iiiiiijj"] = wasmExports["Rb"];
			dynCalls["viiiiii"] = wasmExports["Sb"];
			_asyncify_start_unwind = wasmExports["Tb"];
			_asyncify_stop_unwind = wasmExports["Ub"];
			_asyncify_start_rewind = wasmExports["Vb"];
			_asyncify_stop_rewind = wasmExports["Wb"];
		}
		var wasmImports = {
			p: ___cxa_begin_catch,
			r: ___cxa_end_catch,
			a: ___cxa_find_matching_catch_2,
			f: ___cxa_find_matching_catch_3,
			ca: ___cxa_rethrow,
			s: ___cxa_throw,
			S: ___cxa_uncaught_exceptions,
			d: ___resumeException,
			ea: __abort_js,
			W: __tzset_js,
			ja: _emscripten_has_asyncify,
			da: _emscripten_resize_heap,
			q: _emscripten_sleep,
			ia: _emwgpuAdapterRequestDevice,
			oa: _emwgpuBufferDestroy,
			na: _emwgpuBufferGetConstMappedRange,
			ma: _emwgpuBufferMapAsync,
			la: _emwgpuBufferUnmap,
			i: _emwgpuDelete,
			ha: _emwgpuDeviceCreateBuffer,
			ga: _emwgpuDeviceCreateShaderModule,
			ka: _emwgpuDeviceDestroy,
			fa: _emwgpuInstanceRequestAdapter,
			X: _environ_get,
			Y: _environ_sizes_get,
			Z: _fd_close,
			_: _fd_read,
			$: _fd_seek,
			R: _fd_write,
			O: invoke_diii,
			P: invoke_fiii,
			j: invoke_i,
			b: invoke_ii,
			e: invoke_iii,
			n: invoke_iiii,
			h: invoke_iiiii,
			aa: invoke_iiiiid,
			v: invoke_iiiiii,
			w: invoke_iiiiiii,
			Q: invoke_iiiiiiii,
			J: invoke_iiiiiiiiiiii,
			ba: invoke_iiiiij,
			K: invoke_jiiii,
			g: invoke_v,
			o: invoke_vi,
			c: invoke_vii,
			k: invoke_viii,
			T: invoke_viiii,
			m: invoke_viiiiiii,
			F: invoke_viiiiiiiiii,
			I: invoke_viiiiiiiiiiiiiii,
			V: _random_get,
			qa: _wgpuAdapterGetLimits,
			E: _wgpuCommandEncoderBeginComputePass,
			U: _wgpuCommandEncoderCopyBufferToBuffer,
			N: _wgpuCommandEncoderCopyTextureToBuffer,
			M: _wgpuCommandEncoderFinish,
			B: _wgpuComputePassEncoderDispatchWorkgroups,
			A: _wgpuComputePassEncoderEnd,
			C: _wgpuComputePassEncoderSetBindGroup,
			D: _wgpuComputePassEncoderSetPipeline,
			y: _wgpuComputePipelineGetBindGroupLayout,
			x: _wgpuDeviceCreateBindGroup,
			G: _wgpuDeviceCreateCommandEncoder,
			pa: _wgpuDeviceCreateComputePipeline,
			t: _wgpuDeviceCreateTexture,
			L: _wgpuQueueSubmit,
			z: _wgpuQueueWriteBuffer,
			H: _wgpuQueueWriteTexture,
			l: _wgpuTextureCreateView,
			u: _wgpuTextureDestroy
		};
		var wasmExports = await createWasm();
		function invoke_iii(index, a1, a2) {
			var sp = stackSave();
			try {
				return dynCall_iii(index, a1, a2);
			} catch (e) {
				stackRestore(sp);
				if (e !== e + 0) throw e;
				_setThrew(1, 0);
			}
		}
		function invoke_ii(index, a1) {
			var sp = stackSave();
			try {
				return dynCall_ii(index, a1);
			} catch (e) {
				stackRestore(sp);
				if (e !== e + 0) throw e;
				_setThrew(1, 0);
			}
		}
		function invoke_vii(index, a1, a2) {
			var sp = stackSave();
			try {
				dynCall_vii(index, a1, a2);
			} catch (e) {
				stackRestore(sp);
				if (e !== e + 0) throw e;
				_setThrew(1, 0);
			}
		}
		function invoke_vi(index, a1) {
			var sp = stackSave();
			try {
				dynCall_vi(index, a1);
			} catch (e) {
				stackRestore(sp);
				if (e !== e + 0) throw e;
				_setThrew(1, 0);
			}
		}
		function invoke_v(index) {
			var sp = stackSave();
			try {
				dynCall_v(index);
			} catch (e) {
				stackRestore(sp);
				if (e !== e + 0) throw e;
				_setThrew(1, 0);
			}
		}
		function invoke_iiiiiii(index, a1, a2, a3, a4, a5, a6) {
			var sp = stackSave();
			try {
				return dynCall_iiiiiii(index, a1, a2, a3, a4, a5, a6);
			} catch (e) {
				stackRestore(sp);
				if (e !== e + 0) throw e;
				_setThrew(1, 0);
			}
		}
		function invoke_iiii(index, a1, a2, a3) {
			var sp = stackSave();
			try {
				return dynCall_iiii(index, a1, a2, a3);
			} catch (e) {
				stackRestore(sp);
				if (e !== e + 0) throw e;
				_setThrew(1, 0);
			}
		}
		function invoke_viiii(index, a1, a2, a3, a4) {
			var sp = stackSave();
			try {
				dynCall_viiii(index, a1, a2, a3, a4);
			} catch (e) {
				stackRestore(sp);
				if (e !== e + 0) throw e;
				_setThrew(1, 0);
			}
		}
		function invoke_iiiiii(index, a1, a2, a3, a4, a5) {
			var sp = stackSave();
			try {
				return dynCall_iiiiii(index, a1, a2, a3, a4, a5);
			} catch (e) {
				stackRestore(sp);
				if (e !== e + 0) throw e;
				_setThrew(1, 0);
			}
		}
		function invoke_iiiiij(index, a1, a2, a3, a4, a5) {
			var sp = stackSave();
			try {
				return dynCall_iiiiij(index, a1, a2, a3, a4, a5);
			} catch (e) {
				stackRestore(sp);
				if (e !== e + 0) throw e;
				_setThrew(1, 0);
			}
		}
		function invoke_iiiiid(index, a1, a2, a3, a4, a5) {
			var sp = stackSave();
			try {
				return dynCall_iiiiid(index, a1, a2, a3, a4, a5);
			} catch (e) {
				stackRestore(sp);
				if (e !== e + 0) throw e;
				_setThrew(1, 0);
			}
		}
		function invoke_viii(index, a1, a2, a3) {
			var sp = stackSave();
			try {
				dynCall_viii(index, a1, a2, a3);
			} catch (e) {
				stackRestore(sp);
				if (e !== e + 0) throw e;
				_setThrew(1, 0);
			}
		}
		function invoke_iiiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
			var sp = stackSave();
			try {
				return dynCall_iiiiiiii(index, a1, a2, a3, a4, a5, a6, a7);
			} catch (e) {
				stackRestore(sp);
				if (e !== e + 0) throw e;
				_setThrew(1, 0);
			}
		}
		function invoke_iiiii(index, a1, a2, a3, a4) {
			var sp = stackSave();
			try {
				return dynCall_iiiii(index, a1, a2, a3, a4);
			} catch (e) {
				stackRestore(sp);
				if (e !== e + 0) throw e;
				_setThrew(1, 0);
			}
		}
		function invoke_jiiii(index, a1, a2, a3, a4) {
			var sp = stackSave();
			try {
				return dynCall_jiiii(index, a1, a2, a3, a4);
			} catch (e) {
				stackRestore(sp);
				if (e !== e + 0) throw e;
				_setThrew(1, 0);
				return 0n;
			}
		}
		function invoke_fiii(index, a1, a2, a3) {
			var sp = stackSave();
			try {
				return dynCall_fiii(index, a1, a2, a3);
			} catch (e) {
				stackRestore(sp);
				if (e !== e + 0) throw e;
				_setThrew(1, 0);
			}
		}
		function invoke_diii(index, a1, a2, a3) {
			var sp = stackSave();
			try {
				return dynCall_diii(index, a1, a2, a3);
			} catch (e) {
				stackRestore(sp);
				if (e !== e + 0) throw e;
				_setThrew(1, 0);
			}
		}
		function invoke_i(index) {
			var sp = stackSave();
			try {
				return dynCall_i(index);
			} catch (e) {
				stackRestore(sp);
				if (e !== e + 0) throw e;
				_setThrew(1, 0);
			}
		}
		function invoke_viiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
			var sp = stackSave();
			try {
				dynCall_viiiiiii(index, a1, a2, a3, a4, a5, a6, a7);
			} catch (e) {
				stackRestore(sp);
				if (e !== e + 0) throw e;
				_setThrew(1, 0);
			}
		}
		function invoke_iiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
			var sp = stackSave();
			try {
				return dynCall_iiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
			} catch (e) {
				stackRestore(sp);
				if (e !== e + 0) throw e;
				_setThrew(1, 0);
			}
		}
		function invoke_viiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
			var sp = stackSave();
			try {
				dynCall_viiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
			} catch (e) {
				stackRestore(sp);
				if (e !== e + 0) throw e;
				_setThrew(1, 0);
			}
		}
		function invoke_viiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15) {
			var sp = stackSave();
			try {
				dynCall_viiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15);
			} catch (e) {
				stackRestore(sp);
				if (e !== e + 0) throw e;
				_setThrew(1, 0);
			}
		}
		function applySignatureConversions(wasmExports) {
			wasmExports = Object.assign({}, wasmExports);
			var makeWrapper_pp = (f) => (a0) => f(a0) >>> 0;
			var makeWrapper_ppp = (f) => (a0, a1) => f(a0, a1) >>> 0;
			var makeWrapper_p = (f) => () => f() >>> 0;
			wasmExports["Ca"] = makeWrapper_pp(wasmExports["Ca"]);
			wasmExports["cb"] = makeWrapper_ppp(wasmExports["cb"]);
			wasmExports["gb"] = makeWrapper_pp(wasmExports["gb"]);
			wasmExports["hb"] = makeWrapper_p(wasmExports["hb"]);
			wasmExports["lb"] = makeWrapper_pp(wasmExports["lb"]);
			return wasmExports;
		}
		function run() {
			if (runDependencies > 0) {
				dependenciesFulfilled = run;
				return;
			}
			preRun();
			if (runDependencies > 0) {
				dependenciesFulfilled = run;
				return;
			}
			function doRun() {
				Module["calledRun"] = true;
				if (ABORT) return;
				initRuntime();
				readyPromiseResolve?.(Module);
				Module["onRuntimeInitialized"]?.();
				postRun();
			}
			if (Module["setStatus"]) {
				Module["setStatus"]("Running...");
				setTimeout(() => {
					setTimeout(() => Module["setStatus"](""), 1);
					doRun();
				}, 1);
			} else doRun();
		}
		function preInit() {
			if (Module["preInit"]) {
				if (typeof Module["preInit"] == "function") Module["preInit"] = [Module["preInit"]];
				while (Module["preInit"].length > 0) Module["preInit"].shift()();
			}
		}
		preInit();
		run();
		if (runtimeInitialized) moduleRtn = Module;
		else moduleRtn = new Promise((resolve, reject) => {
			readyPromiseResolve = resolve;
			readyPromiseReject = reject;
		});
		return moduleRtn;
	});
})();
//#endregion
//#region src/wasmModule.js
/**
* @internal
*/
var wasmModule;
var initialized = false;
var readyPromise;
/**
* @internal
* @summary Get the initialized WASM module instance.
*
* @description
* Returns the cached Emscripten module instance. This function assumes
* {@link initWasmModule} has already completed successfully.
*
* @function getWasmModule
* @returns {Object|undefined} The initialized WASM module.
* @since 0.3.0
*/
function getWasmModule() {
	return wasmModule;
}
/**
* `@summary` Initialize the WASM module. Async as of `#433`. Previously `initWasmWorker`.
* `@function` initWasmModule
* `@since` 0.0.0
*/
async function initWasmModule() {
	if (initialized) return;
	if (!readyPromise) readyPromise = (async () => {
		wasmModule = await createImg2NumModule();
	})();
	await readyPromise;
	initialized = true;
}
/**
* @summary Release resources held by the WebAssembly module.
*
* @description
* This function is optional. In most applications, there is no need to call
* it explicitly, as resources are released when the process exits. It is
* provided for applications that need to reclaim resources—such as a WebGPU
* device—before program termination so they can be used elsewhere.
*
* @async
* @function terminateWasmModule
* @returns {Promise<void>} A promise that resolves once all resources have
* been released and the module has been reset to an uninitialized state.
* @since 0.3.0
*/
async function terminateWasmModule() {
	wasmModule = void 0;
	initialized = false;
	readyPromise = void 0;
}
//#endregion
//#region src/wasmTypes.js
/**
* @internal
*/
/**
* @internal
* @summary Type marshaling definitions used by the WASM client.
*
* @description
* Maps supported JavaScript types to allocation and readback handlers used
* when transferring values between JavaScript and the WebAssembly heap.
*
* Each handler exposes:
* - `alloc(value)` — allocates and writes data into WASM memory.
* - `read(ptr, length)` — reconstructs a JavaScript value from WASM memory.
*
* @constant
* @type {Object}
* @since 0.3.0
*/
var WASM_TYPES = {
	void: {
		alloc: () => null,
		read: () => void 0
	},
	Int32Array: {
		alloc: (arr) => {
			const wasmModule = getWasmModule();
			const ptr = wasmModule._malloc(arr.byteLength);
			wasmModule.HEAP32.set(arr, ptr >> 2);
			return ptr;
		},
		read: (ptr, len) => {
			const wasmModule = getWasmModule();
			return new Int32Array(wasmModule.HEAP32.buffer, ptr, len).slice();
		}
	},
	Uint8Array: {
		alloc: (arr) => {
			const wasmModule = getWasmModule();
			const ptr = wasmModule._malloc(arr.byteLength);
			wasmModule.HEAPU8.set(arr, ptr);
			return ptr;
		},
		read: (ptr, len) => {
			return getWasmModule().HEAPU8.slice(ptr, ptr + len);
		}
	},
	Uint8ClampedArray: {
		alloc: (arr) => {
			const wasmModule = getWasmModule();
			const ptr = wasmModule._malloc(arr.byteLength);
			wasmModule.HEAPU8.set(arr, ptr);
			return ptr;
		},
		read: (ptr, len) => {
			const wasmModule = getWasmModule();
			return new Uint8ClampedArray(wasmModule.HEAPU8.slice(ptr, ptr + len));
		}
	},
	string: {
		alloc: (str) => {
			const wasmModule = getWasmModule();
			const len = wasmModule.lengthBytesUTF8(str) + 1;
			const ptr = wasmModule._malloc(len);
			wasmModule.stringToUTF8(str, ptr, len);
			return ptr;
		},
		read: (ptr) => {
			const wasmModule = getWasmModule();
			return ptr ? wasmModule.UTF8ToString(ptr) : null;
		}
	}
};
//#endregion
//#region src/ccall.js
/**
* @internal
*/
/**
* @internal
* @summary Invoke an exported Emscripten function asynchronously.
*
* @description
* Wraps `Module.ccall()` using the currently initialized WASM module.
* All arguments are passed as numeric values, matching the pointer-based
* interface used internally by the library.
*
* @async
* @function ccallAsync
* @param {string} funcName - Exported function name.
* @param {Map<string, *>} argsMap - Ordered function arguments.
* @param {string} returnType - Logical return type.
* @returns {Promise<*>} The raw value returned by the exported function.
* @since 0.3.0
*/
async function ccallAsync(funcName, argsMap, returnType) {
	const wasmModule = getWasmModule();
	const argTypes = Array(argsMap.size).fill("number");
	const retType = returnType === "void" ? null : "number";
	return wasmModule.ccall(funcName, retType, argTypes, [...argsMap.values()], { async: true });
}
//#endregion
//#region src/wasmClient.js
/**
* @packageDocumentation
* Low-level interface for calling into the WASM (Img2Num) module directly.
*
* @internal
*/
/**
* @internal
* @summary Invoke a WASM function with automatic memory management.
*
* @description
* Allocates input buffers, marshals JavaScript values into WASM memory,
* invokes the requested exported function, reads modified buffers and return
* values back into JavaScript, and finally releases all temporary WASM
* allocations.
*
* @async
* @function callWasm
* @param {Object} options
* @param {string} options.funcName - Name of the exported WASM function.
* @param {Object} [options.args={}] - Function arguments.
* @param {Array<{key:string,type:string}>} [options.bufferKeys=[]] - Buffer arguments requiring allocation.
* @param {string} [options.returnType="void"] - Expected return type.
* @returns {Promise<{output:Object, returnValue:any}>}
* @throws {Error} If allocation or the WASM call fails.
* @since 0.0.0
*/
async function callWasm({ funcName, args = {}, bufferKeys = [], returnType = "void" }) {
	await initWasmModule();
	const wasmModule = getWasmModule();
	const pointers = /* @__PURE__ */ new Map();
	const argsMap = new Map(Object.entries(args));
	try {
		for (const { key, type } of bufferKeys) {
			const handler = WASM_TYPES[type];
			if (!handler) throw new Error(`Unsupported type: ${type}`);
			const value = argsMap.get(key);
			const ptr = handler.alloc(value);
			pointers.set(key, {
				ptr,
				type,
				length: value?.length
			});
			argsMap.set(key, ptr);
		}
		const result = await ccallAsync(funcName, argsMap, returnType);
		const output = Object.create(null);
		for (const { key, type } of bufferKeys) {
			const { ptr, length } = pointers.get(key);
			output[key] = WASM_TYPES[type].read(ptr, length);
		}
		let returnValue = result;
		if (returnType !== "void") returnValue = WASM_TYPES[returnType].read(result);
		if (returnType === "string" && result) wasmModule._free(result);
		return {
			output,
			returnValue
		};
	} catch (error) {
		throw new Error(`[Img2Num wasmClient] Error: ${error?.message ?? error}`, { cause: error });
	} finally {
		for (const { ptr } of pointers.values()) wasmModule._free(ptr);
	}
}
//#endregion
//#region src/safeWasmWrappers.js
/**
* @packageDocumentation
* High-level image operations exposed via WASM.
*
* The exports defined here abstract away the manual memory management required
* when importing raw WASM functions, making them more JavaScript-friendly.
*
* @file Safely wraps unsafe WASM (C++) function calls.
*
* @module image-wasm
* @license MIT
* @copyright Ryan Millard 2026
* @author Ryan Millard
* @since 0.0.0
* @description This module provides high-level image processing functions using WASM.
*              Each function handles memory management and exposes a JavaScript-friendly API.
*/
/**
* @summary Apply a Gaussian blur to an image using FFT in WASM.
*
* @description
* Takes a Uint8ClampedArray and its dimensions and applies a Gaussian blur on the Uint8ClampedArray image.
* The `sigma_pixels` parameter determines the blur radius and has a dynamic default value equal to 5% of the image's width.
* Useful for denoising images by applying a low-pass filter. Sped up by a 2-D FFT.
*
* @async
* @function gaussianBlur
* @param {Object} options - The input options.
* @param {Uint8ClampedArray} options.pixels - The image pixel data (flat RGBA array).
* @param {number} options.width - The width of the image.
* @param {number} options.height - The height of the image.
* @param {number} [options.sigma_pixels=width*0.005] - Standard deviation of the Gaussian blur (default=width*0.005; 5% of width).
* @returns {Promise<Uint8ClampedArray>} The blurred image pixels.
* @throws {Error} If the WASM function fails or memory allocation fails.
* @example
* const blurred = await gaussianBlur({ pixels, width, height });
* @todo Fix FFT zero-padding bug around edges of the image.
* @variation Standard Gaussian blur using FFT
* @since 0.0.0
*/
var gaussianBlur = async ({ pixels, width, height, sigma_pixels = width * .005 }) => {
	return (await callWasm({
		funcName: "gaussian_blur_fft",
		args: {
			pixels,
			width,
			height,
			sigma_pixels
		},
		bufferKeys: [{
			key: "pixels",
			type: "Uint8ClampedArray"
		}]
	})).output.pixels;
};
/**
* @summary Apply a bilateral filter to an image using WASM.
*
* @description
* Takes a Uint8ClampedArray and its dimensions and applies a bilateral filter on the Uint8ClampedArray image.
* The `sigma_spatial` and `sigma_range` set weights to the respective Gaussian kernels applied to spatial (x, y) and range (color) data -
* they both have recommended default values applied.
* The default `color_space` is 0, which is CIE LAB, but sRGB can be chosen by setting `color_space` = 1. CIE LAB is more
* accurate, but sRGB is slightly faster.
*
* @async
* @function bilateralFilter
* @param {Object} options - The input options.
* @param {Uint8ClampedArray} options.pixels - The image pixel data (flat RGBA array).
* @param {number} options.width - The width of the image.
* @param {number} options.height - The height of the image.
* @param {number} [options.sigma_spatial=3] - Spatial standard deviation.
* @param {number} [options.sigma_range=50] - Range (color) standard deviation.
* @param {number} [options.color_space=0] - Color space mode (0: CIE LAB; 1: sRGB).
* @returns {Promise<Uint8ClampedArray>} The filtered image pixels.
* @throws {Error} If the WASM function fails.
* @example
* const filtered = await bilateralFilter({ pixels, width, height });
* @variation Standard bilateral filter with default parameters
* @since 0.0.0
*/
var bilateralFilter = async ({ pixels, width, height, sigma_spatial = 3, sigma_range = 50, color_space = 0 }) => {
	return (await callWasm({
		funcName: "bilateral_filter",
		args: {
			pixels,
			width,
			height,
			sigma_spatial,
			sigma_range,
			color_space
		},
		bufferKeys: [{
			key: "pixels",
			type: "Uint8ClampedArray"
		}]
	})).output.pixels;
};
/**
* @summary Apply a black-biased threshold filter to reduce colors in an image.
*
* @description
* Apply a simple sRGB bin-based threshold on the Uint8ClampedArray image.
* The bins in this function are determined by the `num_colors` parameter.
*
* @async
* @function blackThreshold
* @param {Object} options - The input options.
* @param {Uint8ClampedArray} options.pixels - The image pixel data (flat RGBA array).
* @param {number} options.width - The width of the image.
* @param {number} options.height - The height of the image.
* @param {number} options.num_colors - Number of colors to reduce the image to.
* @returns {Promise<Uint8ClampedArray>} The thresholded image pixels.
* @throws {Error} If the WASM function fails.
* @example
* const thresholded = await blackThreshold({ pixels, width, height, num_colors: 16 });
* @see {@link https://en.wikipedia.org/wiki/Color_quantization|Color Quantization Wiki}
* @todo Support different bias levels for black/white thresholds.
* @variation Black-biased threshold with customizable number of colors
* @since 0.0.0
*/
var blackThreshold = async ({ pixels, width, height, num_colors }) => {
	return (await callWasm({
		funcName: "black_threshold_image",
		args: {
			pixels,
			width,
			height,
			num_colors
		},
		bufferKeys: [{
			key: "pixels",
			type: "Uint8ClampedArray"
		}]
	})).output.pixels;
};
/**
* @summary Cluster pixels using the K-Means algorithm in WASM.
*
* @description
* Apply a standard K-Means clustering algorithm to the input image in the specified `color_space`
* (default is 0: CIE LAB, but 1: sRGB can be use) using pre-specified maximum color and iteration counts.
* You can provide the `out_pixels` and `out_labels` arrays,
* however this is atypical in JavaScript (since it is modified in-place and you will need to allocate a sufficiently large array),
* so it is recommended to use the default arguments and returns.
*
* @async
* @function kmeans
* @param {Object} options - The input options.
* @param {Uint8ClampedArray} options.pixels - Original image pixels.
* @param {Uint8ClampedArray} [options.out_pixels=new Uint8ClampedArray(pixels.length)] - Output pixels array.
* @param {Int32Array} [options.out_labels=new Int32Array(pixels.length/4)] - Output labels array.
* @param {number} options.width - Image width.
* @param {number} options.height - Image height.
* @param {number} options.num_colors - Number of color clusters.
* @param {number} [options.max_iter=100] - Maximum number of iterations.
* @param {number} [options.color_space=0] - Color space mode.
* @returns {Promise<{pixels: Uint8ClampedArray, labels: Int32Array}>} Clustered pixels and labels.
* @throws {Error} If the WASM function fails or iterations do not converge.
* @example
* const { pixels: clusteredPixels, labels } = await kmeans({ pixels, width, height, num_colors: 8 });
* @variation K-means clustering with default color space
* @since 0.0.0
*/
var kmeans = async ({ pixels, out_pixels = new Uint8ClampedArray(pixels.length), out_labels = new Int32Array(pixels.length / 4), width, height, num_colors, max_iter = 100, color_space = 0 }) => {
	const result = await callWasm({
		funcName: "kmeans",
		args: {
			pixels,
			out_pixels,
			out_labels,
			width,
			height,
			num_colors,
			max_iter,
			color_space
		},
		bufferKeys: [
			{
				key: "pixels",
				type: "Uint8ClampedArray"
			},
			{
				key: "out_pixels",
				type: "Uint8ClampedArray"
			},
			{
				key: "out_labels",
				type: "Int32Array"
			}
		]
	});
	return {
		pixels: result.output.out_pixels,
		labels: result.output.out_labels
	};
};
/**
* @summary Convert labeled regions to SVG contours.
*
* @description
* Convert an input image and its labeled regions into an SVG.
*
* @async
* @function findContours
* @param {Object} options - The input options.
* @param {Uint8ClampedArray} options.pixels - Original image pixels.
* @param {Int32Array} options.labels - Label array from clustering (e.g., K-Means) or segmentation.
* @param {number} options.width - Image width.
* @param {number} options.height - Image height.
* @param {number} [options.min_area=100] - Minimum area of a region to be considered a contour.
* @param {number} [options.min_thickness=10] - Minimum thickness of a region to be considered a contour.
* @returns {Promise<{svg: string}>} Generated SVG.
* @throws {Error} If the WASM function fails or input labels are invalid.
* @example
* const { svg } = await findContours({ pixels, labels, width, height });
* @variation Converts labeled (from a clustering algorithm, e.g. K-Means) image into an SVG.
* @since 0.0.0
*/
var findContours = async ({ pixels, labels, width, height, min_area = 100, min_thickness = 10 }) => {
	return { svg: (await callWasm({
		funcName: "labels_to_svg",
		args: {
			pixels,
			labels,
			width,
			height,
			min_area,
			min_thickness
		},
		bufferKeys: [{
			key: "pixels",
			type: "Uint8ClampedArray"
		}, {
			key: "labels",
			type: "Int32Array"
		}],
		returnType: "string"
	})).returnValue };
};
/**
* @summary Convert raster images (e.g., JPEG, PNG) to SVGs.
*
* @description
* Convert an input raster image into an SVG. A unification of `bilateralFilter`, `kmeans`, and `findContours`.
*
* @async
* @function imageToSvg
* @param {Object} options - The input options.
* @param {Uint8ClampedArray} options.pixels - Original image pixels.
* @param {number} options.width - Image width.
* @param {number} options.height - Image height.
* @param {number} [options.sigma_spatial=3] - Spatial standard deviation.
* @param {number} [options.sigma_range=50] - Range (color) standard deviation.
* @param {number} [options.num_colors=16] - Number of color clusters.
* @param {number} [options.max_iter=100] - Maximum number of iterations.
* @param {number} [options.min_area=100] - Minimum area of a region to be considered a contour.
* @param {number} [options.min_thickness=10] - Minimum thickness of a region to be considered a contour.
* @param {number} [options.color_space=0] - Color space mode.
* @returns {Promise<{svg: string}>} Generated SVG.
* @throws {Error} If the WASM function fails or input labels are invalid.
* @example
* const { svg } = await findContours({ pixels, labels, width, height });
* @variation Convert a raster image (e.g., PNG, JPG) into an SVG.
* @since 0.0.0
*/
var imageToSvg = async ({ pixels, width, height, sigma_spatial = 3, sigma_range = 50, num_colors = 16, max_iter = 100, min_area = 100, min_thickness = 10, color_space = 0 }) => {
	return { svg: (await callWasm({
		funcName: "image_to_svg",
		args: {
			pixels,
			width,
			height,
			sigma_spatial,
			sigma_range,
			num_colors,
			max_iter,
			min_area,
			min_thickness,
			color_space
		},
		bufferKeys: [{
			key: "pixels",
			type: "Uint8ClampedArray"
		}],
		returnType: "string"
	})).returnValue };
};
//#endregion
export { bilateralFilter, blackThreshold, findContours, gaussianBlur, imageToSvg, imageToUint8ClampedArray, kmeans, terminateWasmModule };

//# sourceMappingURL=img2num.js.map