import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import useGoogleAnalytics from "@hooks/useGoogleAnalytics";
import NavBar from "@components/NavBar";
import ExternalRedirect from "@components/ExternalRedirect";
import Home from "@pages/Home";
import Editor from "@pages/Editor";
import Loading from "@pages/Loading";

export default function App() {
  useGoogleAnalytics();
  return (
    <>
      <NavBar />

      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/about" element={<Navigate to="/" replace />} />
          <Route path="/credits" element={<ExternalRedirect to="https://img2num.dev/hall-of-fame" />} />
        </Routes>
      </Suspense>
    </>
  );
}
