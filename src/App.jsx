import { Routes, Route } from "react-router-dom";
import Home from "@pages/Home";
import EditorPage from "@pages/EditorPage";

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/editor" element={<EditorPage />} />
		</Routes>
	);
}
