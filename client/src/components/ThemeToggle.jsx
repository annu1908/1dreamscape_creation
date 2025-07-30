import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext'; // path to your context file
import './ThemeToggle.css'
const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useContext(ThemeContext); // use the context

  return (
    <button onClick={toggleTheme} className="theme-toggle-btn" aria-label='Toggle Theme'>
      {darkMode ? '☀️' : '🌙'}
    </button>
  );
};

export default ThemeToggle;