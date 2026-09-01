import { Route, Routes } from 'react-router-dom';
import { FloatingSessionWidget } from './components/FloatingSessionWidget';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Learn } from './pages/Learn';
import { Meditate } from './pages/Meditate';

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-sand-50 text-sage-900 dark:bg-sage-900 dark:text-sage-50">
      <div className="sticky top-0 z-20">
        <Navbar />
        <FloatingSessionWidget />
      </div>
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/meditate" element={<Meditate />} />
          <Route path="/learn" element={<Learn />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
