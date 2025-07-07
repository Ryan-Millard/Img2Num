import { useEffect, useRef, useState } from 'react';
import { loadImageToUint8Array } from './utils/image-utils.js';
import createImageModule from '@wasm/image_utils.js';
import Home from '@pages/Home';

function App() {
	return <Home />
}

export default App;
