import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from '@/shared/components/Navbar';
import { Home } from '@/pages/Home';

/**
 * App - Main application component with routing
 * 
 * @returns JSX element
 */
export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<div>About page - Coming soon</div>} />
        <Route path="/contact" element={<div>Contact page - Coming soon</div>} />
        <Route path="/forum" element={<div>Forum page - Coming soon</div>} />
      </Routes>
    </BrowserRouter>
  );
};

