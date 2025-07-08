import { useEffect } from 'react';
import Home from '@pages/Home';

function App() {
	useEffect(() => {
		document.documentElement.classList.add('dark');
	}, []); // empty dependency array = run once after mount

	return <Home />;
}

export default App;
