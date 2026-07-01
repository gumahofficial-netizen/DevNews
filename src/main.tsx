import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { seedDatabase } from './services/dbSeeder';

// Trigger database seeder on application startup
seedDatabase().catch((err) => console.error("Database seeding bypassed or failed:", err));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
