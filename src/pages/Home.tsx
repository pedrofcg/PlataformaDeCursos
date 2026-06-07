import { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { cursoService } from '../services/cursoService';
import { usuarioService } from '../services/usuarioService';
import { categoriaService } from '../services/categoriaService';
import { matriculaService } from '../services/matriculaService';
import { certificadoService } from '../services/certificadoService';
import { Curso } from '../models/Curso';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const [stats, setStats] = useState({
    cursos: 0,
    usuarios: 0,
    categorias: 0,
    matriculas: 0,
    certificados: 0,
  });
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cursosData, usuariosData, categoriasData, matriculasData, certData] =
        await Promise.all([
          cursoService.getAll(),
          usuarioService.getAll(),
          categoriaService.getAll(),
          matriculaService.getAll(),
          certificadoService.getAll(),
        ]);
      setStats({
        cursos: cursosData.length,
        usuarios: usuariosData.length,
        categorias: categoriasData.length,
        matriculas: matriculasData.length,
        certificados: certData.length,
      });
      setCursos(cursosData.slice(0, 4));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNivelBadge = (nivel: string) => {
    const classes: Record<string, string> = {
      Iniciante: 'badge-iniciante',
      Intermediário: 'badge-intermediario',
      Avançado: 'badge-avancado',
    };
    return `badge-nivel ${classes[nivel] || ''}`;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container className="page-container animate-in">
      {/* Hero */}
      <div className="hero-section mb-4">
        <h1>
          Bem-vindo ao <span>PedroPlatform</span>
        </h1>
        <p>
          Gerencie cursos, alunos, trilhas de conhecimento e todo o ciclo
          acadêmico e financeiro em um só lugar.
        </p>
        <Link to="/cursos" className="btn btn-primary-custom mt-3">
          Explorar Cursos →
        </Link>
      </div>

      {/* Stats */}
      <Row className="g-3 mb-4">
        {[
          { label: 'Cursos', value: stats.cursos, icon: '📚', color: '#6c5ce7' },
          { label: 'Usuários', value: stats.usuarios, icon: '👤', color: '#00cec9' },
          { label: 'Categorias', value: stats.categorias, icon: '🏷️', color: '#fd79a8' },
          { label: 'Matrículas', value: stats.matriculas, icon: '📝', color: '#fdcb6e' },
          { label: 'Certificados', value: stats.certificados, icon: '🏅', color: '#00b894' },
        ].map((stat) => (
          <Col key={stat.label} xs={6} md>
            <div className="stat-card">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
                <div
                  className="stat-icon"
                  style={{ background: `${stat.color}20` }}
                >
                  {stat.icon}
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Recent Courses */}
      <div className="page-header">
        <h1>Cursos em Destaque</h1>
        <p>Os cursos mais recentes da plataforma</p>
      </div>

      <Row className="g-4">
        {cursos.map((curso) => (
          <Col key={curso.id} md={6} lg={3}>
            <Card className="card-custom h-100">
              <Card.Body>
                <span className={getNivelBadge(curso.Nivel)}>{curso.Nivel}</span>
                <Card.Title className="mt-3">{curso.Titulo}</Card.Title>
                <Card.Text>{curso.Descricao}</Card.Text>
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <small style={{ color: 'var(--text-muted)' }}>
                    {curso.TotalAulas} aulas • {curso.TotalHoras}h
                  </small>
                  <Link
                    to={`/cursos/${curso.id}`}
                    className="btn btn-primary-custom btn-sm"
                  >
                    Ver mais
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Quick Links */}
      <Row className="g-3 mt-4">
        {[
          { to: '/usuarios', icon: '👤', title: 'Gerenciar Usuários', desc: 'Cadastre e gerencie alunos e instrutores' },
          { to: '/matriculas', icon: '📝', title: 'Matrículas', desc: 'Inscreva alunos em cursos disponíveis' },
          { to: '/progresso', icon: '📊', title: 'Acompanhar Progresso', desc: 'Monitore a evolução dos alunos' },
          { to: '/planos', icon: '💎', title: 'Planos e Assinaturas', desc: 'Gerencie planos e pagamentos' },
        ].map((link) => (
          <Col key={link.to} md={6} lg={3}>
            <Link to={link.to} style={{ textDecoration: 'none' }}>
              <Card className="card-custom h-100">
                <Card.Body>
                  <div
                    className="card-icon"
                    style={{ background: 'rgba(108, 92, 231, 0.1)', fontSize: '1.5rem' }}
                  >
                    {link.icon}
                  </div>
                  <Card.Title>{link.title}</Card.Title>
                  <Card.Text>{link.desc}</Card.Text>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Home;
