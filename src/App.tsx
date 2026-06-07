import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppNavbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import CategoriasPage from './pages/categorias/CategoriasPage';
import CursosPage from './pages/cursos/CursosPage';
import CursoDetailPage from './pages/cursos/CursoDetailPage';
import TrilhasPage from './pages/trilhas/TrilhasPage';
import UsuariosPage from './pages/usuarios/UsuariosPage';
import MatriculasPage from './pages/matriculas/MatriculasPage';
import ProgressoPage from './pages/progresso/ProgressoPage';
import AvaliacoesPage from './pages/avaliacoes/AvaliacoesPage';
import CertificadosPage from './pages/certificados/CertificadosPage';
import PlanosPage from './pages/planos/PlanosPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import './App.css';

function App() {
  return (
    <Router>
      <AppNavbar />
      <div style={{ paddingTop: '76px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categorias" element={<CategoriasPage />} />
          <Route path="/cursos" element={<CursosPage />} />
          <Route path="/cursos/:id" element={<CursoDetailPage />} />
          <Route path="/trilhas" element={<TrilhasPage />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/matriculas" element={<MatriculasPage />} />
          <Route path="/progresso" element={<ProgressoPage />} />
          <Route path="/avaliacoes" element={<AvaliacoesPage />} />
          <Route path="/certificados" element={<CertificadosPage />} />
          <Route path="/planos" element={<PlanosPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
