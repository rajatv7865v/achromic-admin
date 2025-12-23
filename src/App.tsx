import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Event from "./pages/Event";
import Magzine from "./pages/Magzine";
import Speaker from "./pages/Speaker";
import Category from "./pages/category";
import Agenda from "./pages/Agenda";
import Dashboard from "./pages/Dashboard";
import Partner from "./pages/Partner";
import Sponsor from "./pages/Sponsor";
import Registeration from "./pages/Registeration";
import Enquiry from "./pages/Enquiry";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";

const App: React.FC = () => {
  return (
    <Routes>
      {/* Default route – redirect to Login */}
      <Route path='/' element={<Navigate to='/login' replace />} />

      {/* Authentication routes */}
      <Route path='/login' element={<Login />} />
      <Route path='/forgot-password' element={<ForgotPassword />} />

      {/* Dashboard routes */}
      <Route path='/dashboard' element={<Dashboard />} />
      <Route path='/event' element={<Event />} />
      <Route path='/magzine' element={<Magzine />} />
      <Route path='/speaker' element={<Speaker />} />
      <Route path='/category' element={<Category />} />
      <Route path='/agenda' element={<Agenda />} />
      <Route path='/partner' element={<Partner />} />
      <Route path='/sponsor' element={<Sponsor />} />
      <Route path='/registeration' element={<Registeration />} />
      <Route path='/enquiry' element={<Enquiry />} />

      {/* Simple fallback for unknown routes */}
      <Route path='*' element={<div>Page not found</div>} />
    </Routes>
  );
};

export default App;

