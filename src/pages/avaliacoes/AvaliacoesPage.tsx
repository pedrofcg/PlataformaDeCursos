import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { avaliacaoService } from '../../services/avaliacaoService';
import { usuarioService } from '../../services/usuarioService';
import { cursoService } from '../../services/cursoService';
import { Avaliacao } from '../../models/Avaliacao';
import { Usuario } from '../../models/Usuario';
import { Curso } from '../../models/Curso';
import LoadingSpinner from '../../components/LoadingSpinner';
import StarRating from '../../components/StarRating';
import ConfirmModal from '../../components/ConfirmModal';

const AvaliacoesPage = () => {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filterCurso, setFilterCurso] = useState<number>(0);
  const [form, setForm] = useState({ ID_Usuario: 0, ID_Curso: 0, Nota: 5, Comentario: '', DataAvaliacao: new Date().toISOString().split('T')[0] });

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [a, u, c] = await Promise.all([avaliacaoService.getAll(), usuarioService.getAll(), cursoService.getAll()]);
      setAvaliacoes(a); setUsuarios(u); setCursos(c);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await avaliacaoService.create({ ...form, Comentario: form.Comentario || null });
      showAlertMsg('success', 'Avaliação enviada!');
      setForm({ ID_Usuario: 0, ID_Curso: 0, Nota: 5, Comentario: '', DataAvaliacao: new Date().toISOString().split('T')[0] });
      loadAll();
    } catch { showAlertMsg('danger', 'Erro.'); }
  };

  const handleDelete = async () => {
    if (deleteId) { try { await avaliacaoService.delete(deleteId); showAlertMsg('success', 'Excluída!'); loadAll(); } catch { showAlertMsg('danger', 'Erro.'); } }
    setShowConfirm(false); setDeleteId(null);
  };

  const showAlertMsg = (t: string, m: string) => { setAlert({ type: t, message: m }); setTimeout(() => setAlert(null), 3000); };
  const getUsuarioNome = (id: number) => usuarios.find(u => u.id === id)?.NomeCompleto || '—';
  const getCursoTitulo = (id: number) => cursos.find(c => c.id === id)?.Titulo || '—';

  const filtered = filterCurso > 0 ? avaliacoes.filter(a => a.ID_Curso === filterCurso) : avaliacoes;

  if (loading) return <LoadingSpinner />;

  return (
    <Container className="page-container animate-in">
      <div className="page-header"><h1>Avaliações</h1><p>Avaliações dos alunos sobre os cursos</p></div>

      {alert && <Alert className={`alert-custom alert-${alert.type}`} dismissible onClose={() => setAlert(null)}>{alert.message}</Alert>}

      {/* New Review Form */}
      <div className="card-custom p-4 mb-4">
        <h5 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>📝 Nova Avaliação</h5>
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={4}>
              <Form.Group><Form.Label>Aluno</Form.Label>
                <Form.Select value={form.ID_Usuario} onChange={e => setForm({...form, ID_Usuario: Number(e.target.value)})} required>
                  <option value={0}>Selecione...</option>
                  {usuarios.map(u => <option key={u.id} value={u.id}>{u.NomeCompleto}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group><Form.Label>Curso</Form.Label>
                <Form.Select value={form.ID_Curso} onChange={e => setForm({...form, ID_Curso: Number(e.target.value)})} required>
                  <option value={0}>Selecione...</option>
                  {cursos.map(c => <option key={c.id} value={c.id}>{c.Titulo}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Nota</Form.Label>
                <div className="mt-1">
                  <StarRating rating={form.Nota} onRate={(n) => setForm({...form, Nota: n})} />
                </div>
              </Form.Group>
            </Col>
            <Col md={10}>
              <Form.Group><Form.Label>Comentário (opcional)</Form.Label>
                <Form.Control as="textarea" rows={2} value={form.Comentario} onChange={e => setForm({...form, Comentario: e.target.value})} placeholder="Deixe seu comentário..." />
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button type="submit" className="btn-primary-custom w-100">Enviar</Button>
            </Col>
          </Row>
        </Form>
      </div>

      {/* Filter */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Select value={filterCurso} onChange={e => setFilterCurso(Number(e.target.value))}>
            <option value={0}>Todos os cursos</option>
            {cursos.map(c => <option key={c.id} value={c.id}>{c.Titulo}</option>)}
          </Form.Select>
        </Col>
      </Row>

      {/* Reviews List */}
      {filtered.length === 0 ? (
        <div className="empty-state"><div className="icon">⭐</div><p>Nenhuma avaliação encontrada.</p></div>
      ) : filtered.map(av => (
        <div key={av.id} className="card-custom p-3 mb-2">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <strong style={{ color: 'var(--text-primary)' }}>{getUsuarioNome(av.ID_Usuario)}</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>sobre</span>
                <span style={{ color: 'var(--primary-light)', fontSize: '0.85rem' }}>{getCursoTitulo(av.ID_Curso)}</span>
              </div>
              <StarRating rating={av.Nota} readonly />
              {av.Comentario && <p className="mt-2 mb-0" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{av.Comentario}</p>}
            </div>
            <div className="d-flex flex-column align-items-end gap-2">
              <small style={{ color: 'var(--text-muted)' }}>{av.DataAvaliacao}</small>
              <Button className="btn-danger-custom btn-sm" onClick={() => { setDeleteId(av.id!); setShowConfirm(true); }}>🗑️</Button>
            </div>
          </div>
        </div>
      ))}

      <ConfirmModal show={showConfirm} message="Excluir avaliação?" onConfirm={handleDelete} onCancel={() => setShowConfirm(false)} />
    </Container>
  );
};

export default AvaliacoesPage;
