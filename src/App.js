import { Routes, Route } from "react-router-dom";
import Home from "./components/Newpage.jsx"
import Setting from "./components/Settings.jsx"
import Dashboardv2 from "./components/Dashboardv2.jsx"
import Page from "./components/Newpage.jsx"
import Page3 from "./components/Page.jsx"
import Page2 from "./components/Page2.jsx"

function App() {
  return (
    <div>
        <Routes>
        <Route path="/" element={<Home />} /> 
        </Routes>
      
    </div>
  );
}

export default App;
