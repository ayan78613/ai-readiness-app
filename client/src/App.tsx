import { Routes, Route } from 'react-router-dom';
import { Nav } from './components/Nav';
import { NewAssessment } from './pages/NewAssessment';
import { Results } from './pages/Results';
import { MyHistory } from './pages/MyHistory';
import { AdminDashboard } from './pages/AdminDashboard';

export function App() {
  return (
    <div className="app-shell">
      <Nav />
      <Routes>
        <Route path="/" element={<NewAssessment />} />
        <Route path="/results/:id" element={<Results />} />
        <Route path="/history" element={<MyHistory />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}
