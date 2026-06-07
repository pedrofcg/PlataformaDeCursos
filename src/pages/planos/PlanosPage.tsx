import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Modal, Form, Button, Alert } from 'react-bootstrap';
import { planoService } from '../../services/planoService';
import { Plano } from '../../models/Plano';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmModal from '../../components/ConfirmModal';

const PlanosPage = () => {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Plano | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);
  const [form, setForm] = useState({ Nome: '', Descricao: '', Preco: 0, DuracaoMeses: 1 });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setPlanos(await planoService.getAll()); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selected?.id) { await planoService.update(selected.id, form); showAlertMsg('success', 'Plano atualizado!'); }
      else { await planoService.create(form); showAlertMsg('success', 'Plano criado!'); }
      setShowModal(false); setSelected(null); load();
    } catch { showAlertMsg('danger', 'Erro.'); }
  };

  const handleEdit = (p: Plano) => {
    setSelected(p); setForm({ Nome: p.Nome, Descricao: p.Descricao, Preco: p.Preco, DuracaoMeses: p.DuracaoMeses }); setShowModal(true);
  };

  const handleDelete = async () => {
    if (deleteId) { try { await planoService.delete(deleteId); showAlertMsg('success', 'Excluído!'); load(); } catch { showAlertMsg('danger', 'Erro.'); } }
    setShowConfirm(false); setDeleteId(null);
  };

  const showAlertMsg = (t: string, m: string) => { setAlert({ type: t, message: m }); setTimeout(() => setAlert(null), 3000); };

  const getFeatures = (plano: Plano): string[] => {
    const base = ['Acesso aos cursos', `Duração: ${plano.DuracaoMeses} ${plano.DuracaoMeses === 1 ? 'mês' : 'meses'}`];
    if (plano.Preco > 50) base.push('Certificados inclusos');
    if (plano.Preco > 80) base.push('Mentorias exclusivas', 'Acesso ilimitado');
    return base;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container className="page-container animate-in">
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div><h1>Planos e Assinaturas</h1><p>Escolha o plano ideal para cada aluno</p></div>
        <Button className="btn-primary-custom" onClick={() => { setSelected(null); setForm({ Nome: '', Descricao: '', Preco: 0, DuracaoMeses: 1 }); setShowModal(true); }}>+ Novo Plano</Button>
      </div>

      {alert && <Alert className={`alert-custom alert-${alert.type}`} dismissible onClose={() => setAlert(null)}>{alert.message}</Alert>}

      <Row className="g-4 justify-content-center">
        {planos.length === 0 ? (
          <Col><div className="empty-state"><div className="icon">💎</div><p>Nenhum plano cadastrado.</p></div></Col>
        ) : planos.map((plano, idx) => (
          <Col key={plano.id} md={6} lg={4}>
            <div className={`pricing-card ${idx === 1 ? 'featured' : ''}`}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                {idx === 0 ? '🌱' : idx === 1 ? '🚀' : '💎'}
              </div>
              <h4 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{plano.Nome}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{plano.Descricao}</p>
              <div className="price">
                R$ {plano.Preco.toFixed(2).replace('.', ',')}
                <span>/{plano.DuracaoMeses === 1 ? 'mês' : `${plano.DuracaoMeses} meses`}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '1.5rem 0', textAlign: 'left' }}>
                {getFeatures(plano).map((f, i) => (
                  <li key={i} style={{ padding: '0.4rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--success)', marginRight: '8px' }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <div className="d-flex gap-2 justify-content-center">
                <Button className="btn-secondary-custom btn-sm" onClick={() => handleEdit(plano)}>✏️ Editar</Button>
                <Button className="btn-danger-custom btn-sm" onClick={() => { setDeleteId(plano.id!); setShowConfirm(true); }}>🗑️</Button>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>{selected ? 'Editar Plano' : 'Novo Plano'}</Modal.Title></Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3"><Form.Label>Nome</Form.Label><Form.Control type="text" value={form.Nome} onChange={e => setForm({...form, Nome: e.target.value})} required /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Descrição</Form.Label><Form.Control as="textarea" rows={2} value={form.Descricao} onChange={e => setForm({...form, Descricao: e.target.value})} required /></Form.Group>
            <Row className="g-3">
              <Col md={6}><Form.Group><Form.Label>Preço (R$)</Form.Label><Form.Control type="number" step="0.01" min={0} value={form.Preco} onChange={e => setForm({...form, Preco: Number(e.target.value)})} required /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Duração (meses)</Form.Label><Form.Control type="number" min={1} value={form.DuracaoMeses} onChange={e => setForm({...form, DuracaoMeses: Number(e.target.value)})} required /></Form.Group></Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button className="btn-secondary-custom" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" className="btn-primary-custom">Salvar</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ConfirmModal show={showConfirm} message="Excluir este plano?" onConfirm={handleDelete} onCancel={() => setShowConfirm(false)} />
    </Container>
  );
};

export default PlanosPage;
