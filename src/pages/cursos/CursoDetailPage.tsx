import { useEffect, useState } from 'react';
import { Container, Row, Col, Accordion, Modal, Form, Button, Alert } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { cursoService } from '../../services/cursoService';
import { moduloService } from '../../services/moduloService';
import { aulaService } from '../../services/aulaService';
import { categoriaService } from '../../services/categoriaService';
import { usuarioService } from '../../services/usuarioService';
import { avaliacaoService } from '../../services/avaliacaoService';
import { Curso } from '../../models/Curso';
import { Modulo } from '../../models/Modulo';
import { Aula } from '../../models/Aula';
import { Avaliacao } from '../../models/Avaliacao';
import LoadingSpinner from '../../components/LoadingSpinner';
import StarRating from '../../components/StarRating';

const CursoDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [curso, setCurso] = useState<Curso | null>(null);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [aulasPorModulo, setAulasPorModulo] = useState<Record<number, Aula[]>>({});
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [categoriaNome, setCategoriaNome] = useState('');
  const [instrutorNome, setInstrutorNome] = useState('');
  const [usuariosMap, setUsuariosMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);

  // Module form
  const [showModuloModal, setShowModuloModal] = useState(false);
  const [moduloForm, setModuloForm] = useState({ Titulo: '', Ordem: 1 });
  const [editModulo, setEditModulo] = useState<Modulo | null>(null);

  // Aula form
  const [showAulaModal, setShowAulaModal] = useState(false);
  const [aulaForm, setAulaForm] = useState({ Titulo: '', TipoConteudo: 'Vídeo' as Aula['TipoConteudo'], URL_Conteudo: '', DuracaoMinutos: 0, Ordem: 1 });
  const [aulaModuloId, setAulaModuloId] = useState<number>(0);
  const [editAula, setEditAula] = useState<Aula | null>(null);

  useEffect(() => { if (id) loadCurso(Number(id)); }, [id]);

  const loadCurso = async (cursoId: number) => {
    try {
      const [c, mods, avs, users] = await Promise.all([
        cursoService.getById(cursoId),
        moduloService.getByCurso(cursoId),
        avaliacaoService.getByCurso(cursoId),
        usuarioService.getAll(),
      ]);
      setCurso(c);
      setModulos(mods);
      setAvaliacoes(avs);
      const uMap: Record<number, string> = {};
      users.forEach(u => { uMap[u.id!] = u.NomeCompleto; });
      setUsuariosMap(uMap);
      setInstrutorNome(uMap[c.ID_Instrutor] || '—');

      try { const cat = await categoriaService.getById(c.ID_Categoria); setCategoriaNome(cat.Nome); } catch { setCategoriaNome('—'); }

      const aulasMap: Record<number, Aula[]> = {};
      for (const mod of mods) {
        const aulas = await aulaService.getByModulo(mod.id!);
        aulasMap[mod.id!] = aulas;
      }
      setAulasPorModulo(aulasMap);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSaveModulo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editModulo?.id) {
        await moduloService.update(editModulo.id, { ...moduloForm, ID_Curso: curso!.id! });
      } else {
        await moduloService.create({ ...moduloForm, ID_Curso: curso!.id! });
      }
      setShowModuloModal(false);
      setEditModulo(null);
      setModuloForm({ Titulo: '', Ordem: modulos.length + 1 });
      showAlertMsg('success', 'Módulo salvo!');
      loadCurso(curso!.id!);
    } catch { showAlertMsg('danger', 'Erro ao salvar módulo.'); }
  };

  const handleDeleteModulo = async (modId: number) => {
    try { await moduloService.delete(modId); showAlertMsg('success', 'Módulo excluído!'); loadCurso(curso!.id!); }
    catch { showAlertMsg('danger', 'Erro ao excluir módulo.'); }
  };

  const handleSaveAula = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editAula?.id) {
        await aulaService.update(editAula.id, { ...aulaForm, ID_Modulo: aulaModuloId });
      } else {
        await aulaService.create({ ...aulaForm, ID_Modulo: aulaModuloId });
      }
      setShowAulaModal(false);
      setEditAula(null);
      showAlertMsg('success', 'Aula salva!');
      loadCurso(curso!.id!);
    } catch { showAlertMsg('danger', 'Erro ao salvar aula.'); }
  };

  const handleDeleteAula = async (aulaId: number) => {
    try { await aulaService.delete(aulaId); showAlertMsg('success', 'Aula excluída!'); loadCurso(curso!.id!); }
    catch { showAlertMsg('danger', 'Erro ao excluir aula.'); }
  };

  const showAlertMsg = (type: string, message: string) => {
    setAlert({ type, message }); setTimeout(() => setAlert(null), 3000);
  };

  const getTipoBadge = (tipo: string) => {
    const m: Record<string, string> = { 'Vídeo': 'badge-video', 'Texto': 'badge-texto', 'Quiz': 'badge-quiz' };
    return `badge-tipo ${m[tipo] || ''}`;
  };

  if (loading) return <LoadingSpinner />;
  if (!curso) return <Container className="page-container"><p>Curso não encontrado.</p></Container>;

  return (
    <Container className="page-container animate-in">
      <Link to="/cursos" className="btn btn-secondary-custom btn-sm mb-3">← Voltar</Link>

      {alert && <Alert className={`alert-custom alert-${alert.type}`} dismissible onClose={() => setAlert(null)}>{alert.message}</Alert>}

      {/* Course Info */}
      <div className="card-custom p-4 mb-4">
        <Row>
          <Col md={8}>
            <span className={`badge-nivel ${curso.Nivel === 'Iniciante' ? 'badge-iniciante' : curso.Nivel === 'Intermediário' ? 'badge-intermediario' : 'badge-avancado'}`}>
              {curso.Nivel}
            </span>
            <h2 className="mt-2" style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{curso.Titulo}</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{curso.Descricao}</p>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              👨‍🏫 {instrutorNome} &nbsp;|&nbsp; 🏷️ {categoriaNome} &nbsp;|&nbsp; 📅 {curso.DataPublicacao}
            </div>
          </Col>
          <Col md={4} className="text-end">
            <div className="stat-card mt-2">
              <div className="stat-value">{curso.TotalAulas}</div>
              <div className="stat-label">Aulas</div>
              <div className="stat-label mt-1">{curso.TotalHoras} horas de conteúdo</div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Modules & Lessons */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>📖 Módulos e Aulas</h4>
        <Button className="btn-primary-custom btn-sm" onClick={() => { setEditModulo(null); setModuloForm({ Titulo: '', Ordem: modulos.length + 1 }); setShowModuloModal(true); }}>
          + Módulo
        </Button>
      </div>

      {modulos.length === 0 ? (
        <div className="empty-state"><div className="icon">📭</div><p>Nenhum módulo cadastrado.</p></div>
      ) : (
        <Accordion className="accordion-custom" defaultActiveKey="0">
          {modulos.map((mod, idx) => (
            <Accordion.Item key={mod.id} eventKey={String(idx)}>
              <Accordion.Header>
                <span className="me-2" style={{ color: 'var(--primary-light)', fontWeight: 700 }}>#{mod.Ordem}</span>
                {mod.Titulo}
                <span className="ms-auto me-3" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {aulasPorModulo[mod.id!]?.length || 0} aulas
                </span>
              </Accordion.Header>
              <Accordion.Body>
                <div className="d-flex justify-content-end mb-2 gap-2">
                  <Button className="btn-primary-custom btn-sm" onClick={() => { setAulaModuloId(mod.id!); setEditAula(null); setAulaForm({ Titulo: '', TipoConteudo: 'Vídeo', URL_Conteudo: '', DuracaoMinutos: 0, Ordem: (aulasPorModulo[mod.id!]?.length || 0) + 1 }); setShowAulaModal(true); }}>
                    + Aula
                  </Button>
                  <Button className="btn-secondary-custom btn-sm" onClick={() => { setEditModulo(mod); setModuloForm({ Titulo: mod.Titulo, Ordem: mod.Ordem }); setShowModuloModal(true); }}>✏️</Button>
                  <Button className="btn-danger-custom btn-sm" onClick={() => handleDeleteModulo(mod.id!)}>🗑️</Button>
                </div>
                {aulasPorModulo[mod.id!]?.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nenhuma aula neste módulo.</p>
                ) : (
                  aulasPorModulo[mod.id!]?.map(aula => (
                    <div key={aula.id} className="d-flex justify-content-between align-items-center p-2 mb-2" style={{ background: 'var(--dark-surface)', borderRadius: '8px' }}>
                      <div>
                        <span style={{ color: 'var(--primary-light)', fontWeight: 600, marginRight: '8px' }}>#{aula.Ordem}</span>
                        <span style={{ color: 'var(--text-primary)' }}>{aula.Titulo}</span>
                        <span className={`${getTipoBadge(aula.TipoConteudo)} ms-2`}>{aula.TipoConteudo}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '8px' }}>{aula.DuracaoMinutos} min</span>
                      </div>
                      <div className="d-flex gap-1">
                        <Button className="btn-secondary-custom btn-sm" onClick={() => { setAulaModuloId(mod.id!); setEditAula(aula); setAulaForm({ Titulo: aula.Titulo, TipoConteudo: aula.TipoConteudo, URL_Conteudo: aula.URL_Conteudo, DuracaoMinutos: aula.DuracaoMinutos, Ordem: aula.Ordem }); setShowAulaModal(true); }}>✏️</Button>
                        <Button className="btn-danger-custom btn-sm" onClick={() => handleDeleteAula(aula.id!)}>🗑️</Button>
                      </div>
                    </div>
                  ))
                )}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}

      {/* Avaliações */}
      <h4 className="mt-4 mb-3" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>⭐ Avaliações</h4>
      {avaliacoes.length === 0 ? (
        <div className="empty-state"><p style={{ color: 'var(--text-muted)' }}>Nenhuma avaliação ainda.</p></div>
      ) : (
        avaliacoes.map(av => (
          <div key={av.id} className="card-custom p-3 mb-2">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>{usuariosMap[av.ID_Usuario] || 'Usuário'}</strong>
                <div className="mt-1"><StarRating rating={av.Nota} readonly /></div>
                {av.Comentario && <p className="mt-2 mb-0" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{av.Comentario}</p>}
              </div>
              <small style={{ color: 'var(--text-muted)' }}>{av.DataAvaliacao}</small>
            </div>
          </div>
        ))
      )}

      {/* Modulo Modal */}
      <Modal show={showModuloModal} onHide={() => setShowModuloModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>{editModulo ? 'Editar Módulo' : 'Novo Módulo'}</Modal.Title></Modal.Header>
        <Form onSubmit={handleSaveModulo}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Título</Form.Label>
              <Form.Control type="text" value={moduloForm.Titulo} onChange={e => setModuloForm({...moduloForm, Titulo: e.target.value})} required />
            </Form.Group>
            <Form.Group>
              <Form.Label>Ordem</Form.Label>
              <Form.Control type="number" min={1} value={moduloForm.Ordem} onChange={e => setModuloForm({...moduloForm, Ordem: Number(e.target.value)})} required />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button className="btn-secondary-custom" onClick={() => setShowModuloModal(false)}>Cancelar</Button>
            <Button type="submit" className="btn-primary-custom">Salvar</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Aula Modal */}
      <Modal show={showAulaModal} onHide={() => setShowAulaModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>{editAula ? 'Editar Aula' : 'Nova Aula'}</Modal.Title></Modal.Header>
        <Form onSubmit={handleSaveAula}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Título</Form.Label>
              <Form.Control type="text" value={aulaForm.Titulo} onChange={e => setAulaForm({...aulaForm, Titulo: e.target.value})} required />
            </Form.Group>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Tipo</Form.Label>
                  <Form.Select value={aulaForm.TipoConteudo} onChange={e => setAulaForm({...aulaForm, TipoConteudo: e.target.value as Aula['TipoConteudo']})}>
                    <option value="Vídeo">Vídeo</option>
                    <option value="Texto">Texto</option>
                    <option value="Quiz">Quiz</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Duração (min)</Form.Label>
                  <Form.Control type="number" min={0} value={aulaForm.DuracaoMinutos} onChange={e => setAulaForm({...aulaForm, DuracaoMinutos: Number(e.target.value)})} required />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mt-3">
              <Form.Label>URL do Conteúdo</Form.Label>
              <Form.Control type="url" value={aulaForm.URL_Conteudo} onChange={e => setAulaForm({...aulaForm, URL_Conteudo: e.target.value})} required />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Ordem</Form.Label>
              <Form.Control type="number" min={1} value={aulaForm.Ordem} onChange={e => setAulaForm({...aulaForm, Ordem: Number(e.target.value)})} required />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button className="btn-secondary-custom" onClick={() => setShowAulaModal(false)}>Cancelar</Button>
            <Button type="submit" className="btn-primary-custom">Salvar</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default CursoDetailPage;
