import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import useGoogleAnalytics from "@hooks/useGoogleAnalytics";
import NavBar from "@components/NavBar";
import Home from "@pages/Home";
import Editor from "@pages/Editor";
import Loading from "@pages/Loading";

const Credits = lazy(() => import("@pages/Credits"));
const About = lazy(() => import("@pages/About"));

export default function App() {
  useGoogleAnalytics();
  return (
    <>
      <NavBar />

      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Suspense>
    </>
  );
}
