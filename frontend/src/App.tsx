import React from 'react';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import './App.css';

function App() {
  return (
    <MainLayout>
      <HomePage />
    </MainLayout>
  );
}

export default App;