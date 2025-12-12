import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Practice from "./pages/Practice";
import Generator from "./pages/Generator";
import Test from "./pages/Test";
import TestResolve from "./pages/TestResolve";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ padding: "20px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/generator" element={<Generator />} />
          <Route path="/test" element={<Test />} />
          <Route path="/test/resolve" element={<TestResolve />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}