import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Modal, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { cursoService } from '../../services/cursoService';
import { categoriaService } from '../../services/categoriaService';
import { usuarioService } from '../../services/usuarioService';
import { Curso } from '../../models/Curso';
import { Categoria } from '../../models/Categoria';
import { Usuario } from '../../models/Usuario';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmModal from '../../components/ConfirmModal';

const CursosPage = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [instrutores, setInstrutores] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Curso | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);
  const [filterCategoria, setFilterCategoria] = useState<string>('');
  const [filterNivel, setFilterNivel] = useState<string>('');

  const emptyForm: Omit<Curso, 'id'> = {
    Titulo: '', Descricao: '', ID_Instrutor: 0, ID_Categoria: 0,
    Nivel: 'Iniciante', DataPublicacao: new Date().toISOString().split('T')[0],
    TotalAulas: 0, TotalHoras: 0,
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [c, cat, u] = await Promise.all([
        cursoService.getAll(), categoriaService.getAll(), usuarioService.getAll(),
      ]);
      setCursos(c);
      setCategorias(cat);
      setInstrutores(u);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selected?.id) {
        await cursoService.update(selected.id, form);
        showAlertMsg('success', 'Curso atualizado!');
      } else {
        await cursoService.create(form);
        showAlertMsg('success', 'Curso criado!');
      }
      setShowModal(false);
      resetForm();
      loadAll();
    } catch { showAlertMsg('danger', 'Erro ao salvar.'); }
  };

  const handleEdit = (curso: Curso) => {
    setSelected(curso);
    setForm({ Titulo: curso.Titulo, Descricao: curso.Descricao, ID_Instrutor: curso.ID_Instrutor,
      ID_Categoria: curso.ID_Categoria, Nivel: curso.Nivel, DataPublicacao: curso.DataPublicacao,
      TotalAulas: curso.TotalAulas, TotalHoras: curso.TotalHoras });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      try { await cursoService.delete(deleteId); showAlertMsg('success', 'Curso excluído!'); loadAll(); }
      catch { showAlertMsg('danger', 'Erro ao excluir.'); }
    }
    setShowConfirm(false); setDeleteId(null);
  };

  const resetForm = () => { setForm(emptyForm); setSelected(null); };

  const showAlertMsg = (type: string, message: string) => {
    setAlert({ type, message }); setTimeout(() => setAlert(null), 3000);
  };

  const getCategoriaNome = (id: number) => categorias.find(c => c.id === id)?.Nome || '—';
  const getInstrutorNome = (id: number) => instrutores.find(u => u.id === id)?.NomeCompleto || '—';

  const filtered = cursos.filter(c => {
    if (filterCategoria && c.ID_Categoria !== Number(filterCategoria)) return false;
    if (filterNivel && c.Nivel !== filterNivel) return false;
    return true;
  });

  const getNivelBadge = (nivel: string) => {
    const m: Record<string, string> = { Iniciante: 'badge-iniciante', Intermediário: 'badge-intermediario', Avançado: 'badge-avancado' };
    return `badge-nivel ${m[nivel] || ''}`;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container className="page-container animate-in">
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h1>Cursos</h1>
          <p>Gerencie todos os cursos da plataforma</p>
        </div>
        <Button className="btn-primary-custom" onClick={() => { resetForm(); setShowModal(true); }}>
          + Novo Curso
        </Button>
      </div>

      {alert && <Alert className={`alert-custom alert-${alert.type}`} dismissible onClose={() => setAlert(null)}>{alert.message}</Alert>}

      {/* Filters */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Form.Select value={filterCategoria} onChange={e => setFilterCategoria(e.target.value)}>
            <option value="">Todas as categorias</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.Nome}</option>)}
          </Form.Select>
        </Col>
        <Col md={4}>
          <Form.Select value={filterNivel} onChange={e => setFilterNivel(e.target.value)}>
            <option value="">Todos os níveis</option>
            <option value="Iniciante">Iniciante</option>
            <option value="Intermediário">Intermediário</option>
            <option value="Avançado">Avançado</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Courses Grid */}
      <Row className="g-4">
        {filtered.length === 0 ? (
          <Col><div className="empty-state"><div className="icon">📭</div><p>Nenhum curso encontrado.</p></div></Col>
        ) : filtered.map(curso => (
          <Col key={curso.id} md={6} lg={4}>
            <Card className="card-custom h-100">
              <Card.Body className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className={getNivelBadge(curso.Nivel)}>{curso.Nivel}</span>
                  <small style={{ color: 'var(--text-muted)' }}>{getCategoriaNome(curso.ID_Categoria)}</small>
                </div>
                <Card.Title>{curso.Titulo}</Card.Title>
                <Card.Text className="flex-grow-1">{curso.Descricao}</Card.Text>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                  👨‍🏫 {getInstrutorNome(curso.ID_Instrutor)} &nbsp;•&nbsp; {curso.TotalAulas} aulas &nbsp;•&nbsp; {curso.TotalHoras}h
                </div>
                <div className="d-flex gap-2">
                  <Link to={`/cursos/${curso.id}`} className="btn btn-primary-custom btn-sm flex-grow-1">
                    Ver Detalhes
                  </Link>
                  <Button className="btn-secondary-custom btn-sm" onClick={() => handleEdit(curso)}>✏️</Button>
                  <Button className="btn-danger-custom btn-sm" onClick={() => { setDeleteId(curso.id!); setShowConfirm(true); }}>🗑️</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selected ? 'Editar Curso' : 'Novo Curso'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={8}>
                <Form.Group>
                  <Form.Label>Título</Form.Label>
                  <Form.Control type="text" value={form.Titulo} onChange={e => setForm({...form, Titulo: e.target.value})} required />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Nível</Form.Label>
                  <Form.Select value={form.Nivel} onChange={e => setForm({...form, Nivel: e.target.value as Curso['Nivel']})}>
                    <option value="Iniciante">Iniciante</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Avançado">Avançado</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Descrição</Form.Label>
                  <Form.Control as="textarea" rows={3} value={form.Descricao} onChange={e => setForm({...form, Descricao: e.target.value})} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Instrutor</Form.Label>
                  <Form.Select value={form.ID_Instrutor} onChange={e => setForm({...form, ID_Instrutor: Number(e.target.value)})} required>
                    <option value={0}>Selecione...</option>
                    {instrutores.map(u => <option key={u.id} value={u.id}>{u.NomeCompleto}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Categoria</Form.Label>
                  <Form.Select value={form.ID_Categoria} onChange={e => setForm({...form, ID_Categoria: Number(e.target.value)})} required>
                    <option value={0}>Selecione...</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.Nome}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Data Publicação</Form.Label>
                  <Form.Control type="date" value={form.DataPublicacao} onChange={e => setForm({...form, DataPublicacao: e.target.value})} required />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Total de Aulas</Form.Label>
                  <Form.Control type="number" min={0} value={form.TotalAulas} onChange={e => setForm({...form, TotalAulas: Number(e.target.value)})} required />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Total de Horas</Form.Label>
                  <Form.Control type="number" min={0} value={form.TotalHoras} onChange={e => setForm({...form, TotalHoras: Number(e.target.value)})} required />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button className="btn-secondary-custom" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" className="btn-primary-custom">Salvar</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ConfirmModal show={showConfirm} message="Tem certeza que deseja excluir este curso?" onConfirm={handleDelete} onCancel={() => setShowConfirm(false)} />
    </Container>
  );
};

export default CursosPage;
