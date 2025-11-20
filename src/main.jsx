import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import '@global-styles/index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<BrowserRouter basename="/Img2Num">
			<App />
		</BrowserRouter>
	</StrictMode>,
)
