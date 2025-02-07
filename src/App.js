import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginRegister from './components/login-register';
import CalendarioMenstrual from './components/calendar';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginRegister />} />
        <Route path="/calendario" element={<CalendarioMenstrual />} />
      </Routes>
    </Router>
  );
}

export default App;