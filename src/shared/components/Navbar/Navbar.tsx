import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';
import logoImage from '../../../assets/images/logo-white-removebg.png';

/**
 * Navbar - Main navigation component with logo, brand name, and navigation links
 * 
 * @returns JSX element
 */
export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.brand}>
          <img 
            src={logoImage} 
            alt="Xplaino Logo" 
            className={styles.logo}
          />
          <span className={styles.brandName}>Xplaino</span>
        </Link>
        
        <button 
          className={styles.menuToggle}
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span className={styles.hamburger}>
            <span className={styles.line}></span>
            <span className={styles.line}></span>
            <span className={styles.line}></span>
          </span>
        </button>
        
        <div className={styles.navCenter}>
          <div className={`${styles.navLinks} ${isMenuOpen ? styles.navLinksOpen : ''}`}>
            <Link to="/my-learnings" className={styles.navLink} onClick={closeMenu}>
              My Learnings
            </Link>
            <Link to="/report-issue" className={styles.navLink} onClick={closeMenu}>
              Report Issue
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

Navbar.displayName = 'Navbar';

