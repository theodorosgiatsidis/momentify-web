import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminApp } from './admin/AdminApp';
import { MemoryPage } from './pages/MemoryPage';

function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/memory/:slug" element={<MemoryPage />} />
      <Route path="/" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

export default App;
