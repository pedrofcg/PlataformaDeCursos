import { useEffect, useState } from 'react';
import { Container, Table, Modal, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { matriculaService } from '../../services/matriculaService';
import { usuarioService } from '../../services/usuarioService';
import { cursoService } from '../../services/cursoService';
import { Matricula } from '../../models/Matricula';
import { Usuario } from '../../models/Usuario';
import { Curso } from '../../models/Curso';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmModal from '../../components/ConfirmModal';

const MatriculasPage = () => {
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);
  const [form, setForm] = useState({ ID_Usuario: 0, ID_Curso: 0, DataMatricula: new Date().toISOString().split('T')[0], DataConclusao: '' });

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [m, u, c] = await Promise.all([matriculaService.getAll(), usuarioService.getAll(), cursoService.getAll()]);
      setMatriculas(m); setUsuarios(u); setCursos(c);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const exists = matriculas.find(m => m.ID_Usuario === form.ID_Usuario && m.ID_Curso === form.ID_Curso);
    if (exists) { showAlertMsg('danger', 'Usuário já matriculado neste curso!'); return; }
    try {
      await matriculaService.create({ ...form, DataConclusao: form.DataConclusao || null });
      showAlertMsg('success', 'Matrícula realizada!');
      setShowModal(false); loadAll();
    } catch { showAlertMsg('danger', 'Erro ao matricular.'); }
  };

  const handleConcluir = async (m: Matricula) => {
    try {
      await matriculaService.update(m.id!, { ...m, DataConclusao: new Date().toISOString().split('T')[0] });
      showAlertMsg('success', 'Curso concluído!'); loadAll();
    } catch { showAlertMsg('danger', 'Erro.'); }
  };

  const handleDelete = async () => {
    if (deleteId) { try { await matriculaService.delete(deleteId); showAlertMsg('success', 'Matrícula excluída!'); loadAll(); } catch { showAlertMsg('danger', 'Erro.'); } }
    setShowConfirm(false); setDeleteId(null);
  };

  const showAlertMsg = (t: string, m: string) => { setAlert({ type: t, message: m }); setTimeout(() => setAlert(null), 3000); };
  const getUsuarioNome = (id: number) => usuarios.find(u => u.id === id)?.NomeCompleto || '—';
  const getCursoTitulo = (id: number) => cursos.find(c => c.id === id)?.Titulo || '—';

  if (loading) return <LoadingSpinner />;

  return (
    <Container className="page-container animate-in">
      <div className="page-header d-flex justify-content-between align-items-center">
        <div><h1>Matrículas</h1><p>Gerencie matrículas de alunos em cursos</p></div>
        <Button className="btn-primary-custom" onClick={() => { setForm({ ID_Usuario: 0, ID_Curso: 0, DataMatricula: new Date().toISOString().split('T')[0], DataConclusao: '' }); setShowModal(true); }}>+ Nova Matrícula</Button>
      </div>

      {alert && <Alert className={`alert-custom alert-${alert.type}`} dismissible onClose={() => setAlert(null)}>{alert.message}</Alert>}

      <div className="table-custom">
        <Table hover responsive>
          <thead><tr><th>ID</th><th>Aluno</th><th>Curso</th><th>Data Matrícula</th><th>Status</th><th>Ações</th></tr></thead>
          <tbody>
            {matriculas.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-4" style={{ color: 'var(--text-muted)' }}>Nenhuma matrícula.</td></tr>
            ) : matriculas.map(m => (
              <tr key={m.id}>
                <td>{m.id}</td>
                <td><strong>{getUsuarioNome(m.ID_Usuario)}</strong></td>
                <td>{getCursoTitulo(m.ID_Curso)}</td>
                <td style={{ color: 'var(--text-muted)' }}>{m.DataMatricula}</td>
                <td>
                  {m.DataConclusao ? (
                    <span className="badge-status badge-concluido">✅ Concluído em {m.DataConclusao}</span>
                  ) : (
                    <span className="badge-status badge-andamento">📖 Em andamento</span>
                  )}
                </td>
                <td>
                  {!m.DataConclusao && <Button className="btn-success-custom btn-sm me-1" onClick={() => handleConcluir(m)}>Concluir</Button>}
                  <Button className="btn-danger-custom btn-sm" onClick={() => { setDeleteId(m.id!); setShowConfirm(true); }}>🗑️</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Nova Matrícula</Modal.Title></Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}><Form.Group><Form.Label>Aluno</Form.Label>
                <Form.Select value={form.ID_Usuario} onChange={e => setForm({...form, ID_Usuario: Number(e.target.value)})} required>
                  <option value={0}>Selecione...</option>
                  {usuarios.map(u => <option key={u.id} value={u.id}>{u.NomeCompleto}</option>)}
                </Form.Select>
              </Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Curso</Form.Label>
                <Form.Select value={form.ID_Curso} onChange={e => setForm({...form, ID_Curso: Number(e.target.value)})} required>
                  <option value={0}>Selecione...</option>
                  {cursos.map(c => <option key={c.id} value={c.id}>{c.Titulo}</option>)}
                </Form.Select>
              </Form.Group></Col>
            </Row>
            <Form.Group className="mt-3"><Form.Label>Data da Matrícula</Form.Label>
              <Form.Control type="date" value={form.DataMatricula} onChange={e => setForm({...form, DataMatricula: e.target.value})} required />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button className="btn-secondary-custom" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" className="btn-primary-custom">Matricular</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ConfirmModal show={showConfirm} message="Excluir esta matrícula?" onConfirm={handleDelete} onCancel={() => setShowConfirm(false)} />
    </Container>
  );
};

export default MatriculasPage;
