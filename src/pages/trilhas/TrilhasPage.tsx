import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Modal, Form, Button, Alert, Table } from 'react-bootstrap';
import { trilhaService } from '../../services/trilhaService';
import { trilhaCursoService } from '../../services/trilhaCursoService';
import { cursoService } from '../../services/cursoService';
import { categoriaService } from '../../services/categoriaService';
import { Trilha } from '../../models/Trilha';
import { TrilhaCurso } from '../../models/TrilhaCurso';
import { Curso } from '../../models/Curso';
import { Categoria } from '../../models/Categoria';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmModal from '../../components/ConfirmModal';

const TrilhasPage = () => {
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddCursoModal, setShowAddCursoModal] = useState(false);
  const [selected, setSelected] = useState<Trilha | null>(null);
  const [trilhaCursos, setTrilhaCursos] = useState<TrilhaCurso[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);
  const [form, setForm] = useState({ Titulo: '', Descricao: '', ID_Categoria: 0 });
  const [addCursoForm, setAddCursoForm] = useState({ ID_Curso: 0, Ordem: 1 });

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [t, cat, c] = await Promise.all([trilhaService.getAll(), categoriaService.getAll(), cursoService.getAll()]);
      setTrilhas(t); setCategorias(cat); setCursos(c);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selected?.id) { await trilhaService.update(selected.id, form); showAlertMsg('success', 'Trilha atualizada!'); }
      else { await trilhaService.create(form); showAlertMsg('success', 'Trilha criada!'); }
      setShowModal(false); loadAll();
    } catch { showAlertMsg('danger', 'Erro ao salvar.'); }
  };

  const handleEdit = (t: Trilha) => {
    setSelected(t); setForm({ Titulo: t.Titulo, Descricao: t.Descricao, ID_Categoria: t.ID_Categoria }); setShowModal(true);
  };

  const handleDelete = async () => {
    if (deleteId) { try { await trilhaService.delete(deleteId); showAlertMsg('success', 'Trilha excluída!'); loadAll(); } catch { showAlertMsg('danger', 'Erro.'); } }
    setShowConfirm(false); setDeleteId(null);
  };

  const handleViewDetail = async (t: Trilha) => {
    setSelected(t);
    try { const tc = await trilhaCursoService.getByTrilha(t.id!); setTrilhaCursos(tc); } catch { setTrilhaCursos([]); }
    setShowDetailModal(true);
  };

  const handleAddCurso = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await trilhaCursoService.create({ ID_Trilha: selected!.id!, ID_Curso: addCursoForm.ID_Curso, Ordem: addCursoForm.Ordem });
      showAlertMsg('success', 'Curso adicionado à trilha!');
      const tc = await trilhaCursoService.getByTrilha(selected!.id!);
      setTrilhaCursos(tc);
      setShowAddCursoModal(false);
    } catch { showAlertMsg('danger', 'Erro ao adicionar curso.'); }
  };

  const handleRemoveCurso = async (tcId: number) => {
    try {
      await trilhaCursoService.delete(tcId);
      const tc = await trilhaCursoService.getByTrilha(selected!.id!);
      setTrilhaCursos(tc);
      showAlertMsg('success', 'Curso removido da trilha!');
    } catch { showAlertMsg('danger', 'Erro.'); }
  };

  const showAlertMsg = (t: string, m: string) => { setAlert({ type: t, message: m }); setTimeout(() => setAlert(null), 3000); };
  const getCategoriaNome = (id: number) => categorias.find(c => c.id === id)?.Nome || '—';
  const getCursoTitulo = (id: number) => cursos.find(c => c.id === id)?.Titulo || '—';

  if (loading) return <LoadingSpinner />;

  return (
    <Container className="page-container animate-in">
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div><h1>Trilhas de Conhecimento</h1><p>Organize cursos em trilhas de aprendizado</p></div>
        <Button className="btn-primary-custom" onClick={() => { setSelected(null); setForm({ Titulo: '', Descricao: '', ID_Categoria: 0 }); setShowModal(true); }}>+ Nova Trilha</Button>
      </div>

      {alert && <Alert className={`alert-custom alert-${alert.type}`} dismissible onClose={() => setAlert(null)}>{alert.message}</Alert>}

      <Row className="g-4">
        {trilhas.length === 0 ? (
          <Col><div className="empty-state"><div className="icon">🛤️</div><p>Nenhuma trilha cadastrada.</p></div></Col>
        ) : trilhas.map(t => (
          <Col key={t.id} md={6} lg={4}>
            <Card className="card-custom h-100">
              <Card.Body className="d-flex flex-column">
                <div className="card-icon" style={{ background: 'rgba(0, 206, 201, 0.15)' }}>🛤️</div>
                <Card.Title>{t.Titulo}</Card.Title>
                <Card.Text className="flex-grow-1">{t.Descricao}</Card.Text>
                <small style={{ color: 'var(--text-muted)' }} className="mb-3">🏷️ {getCategoriaNome(t.ID_Categoria)}</small>
                <div className="d-flex gap-2">
                  <Button className="btn-primary-custom btn-sm flex-grow-1" onClick={() => handleViewDetail(t)}>Ver Cursos</Button>
                  <Button className="btn-secondary-custom btn-sm" onClick={() => handleEdit(t)}>✏️</Button>
                  <Button className="btn-danger-custom btn-sm" onClick={() => { setDeleteId(t.id!); setShowConfirm(true); }}>🗑️</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>{selected ? 'Editar Trilha' : 'Nova Trilha'}</Modal.Title></Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3"><Form.Label>Título</Form.Label><Form.Control type="text" value={form.Titulo} onChange={e => setForm({...form, Titulo: e.target.value})} required /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Descrição</Form.Label><Form.Control as="textarea" rows={3} value={form.Descricao} onChange={e => setForm({...form, Descricao: e.target.value})} required /></Form.Group>
            <Form.Group><Form.Label>Categoria</Form.Label>
              <Form.Select value={form.ID_Categoria} onChange={e => setForm({...form, ID_Categoria: Number(e.target.value)})} required>
                <option value={0}>Selecione...</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.Nome}</option>)}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button className="btn-secondary-custom" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" className="btn-primary-custom">Salvar</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered size="lg">
        <Modal.Header closeButton><Modal.Title>🛤️ {selected?.Titulo} — Cursos</Modal.Title></Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-end mb-3">
            <Button className="btn-primary-custom btn-sm" onClick={() => { setAddCursoForm({ ID_Curso: 0, Ordem: trilhaCursos.length + 1 }); setShowAddCursoModal(true); }}>+ Adicionar Curso</Button>
          </div>
          {trilhaCursos.length === 0 ? (
            <div className="empty-state"><p>Nenhum curso nesta trilha.</p></div>
          ) : (
            <div className="table-custom">
              <Table hover responsive>
                <thead><tr><th>Ordem</th><th>Curso</th><th>Ação</th></tr></thead>
                <tbody>
                  {trilhaCursos.map(tc => (
                    <tr key={tc.id}><td><strong style={{ color: 'var(--primary-light)' }}>#{tc.Ordem}</strong></td><td>{getCursoTitulo(tc.ID_Curso)}</td><td><Button className="btn-danger-custom btn-sm" onClick={() => handleRemoveCurso(tc.id!)}>Remover</Button></td></tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Add Curso Modal */}
      <Modal show={showAddCursoModal} onHide={() => setShowAddCursoModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Adicionar Curso à Trilha</Modal.Title></Modal.Header>
        <Form onSubmit={handleAddCurso}>
          <Modal.Body>
            <Form.Group className="mb-3"><Form.Label>Curso</Form.Label>
              <Form.Select value={addCursoForm.ID_Curso} onChange={e => setAddCursoForm({...addCursoForm, ID_Curso: Number(e.target.value)})} required>
                <option value={0}>Selecione...</option>
                {cursos.map(c => <option key={c.id} value={c.id}>{c.Titulo}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group><Form.Label>Ordem</Form.Label><Form.Control type="number" min={1} value={addCursoForm.Ordem} onChange={e => setAddCursoForm({...addCursoForm, Ordem: Number(e.target.value)})} required /></Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button className="btn-secondary-custom" onClick={() => setShowAddCursoModal(false)}>Cancelar</Button>
            <Button type="submit" className="btn-primary-custom">Adicionar</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ConfirmModal show={showConfirm} message="Excluir esta trilha?" onConfirm={handleDelete} onCancel={() => setShowConfirm(false)} />
    </Container>
  );
};

export default TrilhasPage;
