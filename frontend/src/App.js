import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BioLink from "@/components/BioLink";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<BioLink />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
