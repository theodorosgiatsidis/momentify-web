import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AdminApp } from './admin/AdminApp';
import { MemoryPage } from './pages/MemoryPage';
import { Toaster } from './lib/toast';

function App() {
  return (
    <ThemeProvider>
      <Toaster />
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/memory/:slug" element={<MemoryPage />} />
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
