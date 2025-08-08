import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './Components/HomePage';
import BusinessCalculator from './Components/BusinessCalculator';
import IndividualCalculator from './Components/IndividualCalculator';
// import Swap from'./Components/Swap'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/business-calculator" element={<BusinessCalculator />} />
        <Route path="/individual-calculator" element={<IndividualCalculator />} />
      </Routes>
    </Router>
  );
}

export default App;