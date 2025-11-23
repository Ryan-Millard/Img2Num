import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import NavBar from "@components/NavBar";
import Home from "@pages/Home";
import Editor from "@pages/Editor";
import Loading from "@pages/Loading";

const Credits = lazy(() => import('@pages/Credits'));

export default function App() {
	return (
		<>
			<NavBar />

			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/editor" element={<Editor />} />
				<Route
					path="/credits"
					element={
						<Suspense fallback={<Loading />}>
							<Credits />
						</Suspense>
					}
				/>
			</Routes>
		</>
	);
}
