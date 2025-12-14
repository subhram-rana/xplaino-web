import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from '@/shared/components/Navbar';
import { PageContent } from '@/shared/components/PageContent';
import { Footer } from '@/shared/components/Footer';
import { Home } from '@/pages/Home';
import { Contact } from '@/pages/Contact';
import { ReportIssue } from '@/pages/ReportIssue';
import { TermsAndConditions } from '@/pages/TermsAndConditions';
import { PrivacyPolicy } from '@/pages/PrivacyPolicy';
import { RefundPolicy } from '@/pages/RefundPolicy';

/**
 * App - Main application component with routing
 * 
 * @returns JSX element
 */
export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <PageContent>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/report-issue" element={<ReportIssue />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/my-learnings" element={<div style={{ padding: '2rem', textAlign: 'center' }}>My Learnings - Coming soon</div>} />
        </Routes>
      </PageContent>
      <Footer />
    </BrowserRouter>
  );
};

