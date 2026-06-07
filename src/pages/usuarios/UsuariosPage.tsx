import { useEffect, useState } from 'react';
import { Container, Table, Modal, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { usuarioService } from '../../services/usuarioService';
import { Usuario } from '../../models/Usuario';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmModal from '../../components/ConfirmModal';

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Usuario | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);
  const [form, setForm] = useState({ NomeCompleto: '', Email: '', SenhaHash: '', DataCadastro: new Date().toISOString().split('T')[0] });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const data = await usuarioService.getAll(); setUsuarios(data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Check email uniqueness
    const exists = usuarios.find(u => u.Email === form.Email && u.id !== selected?.id);
    if (exists) { showAlertMsg('danger', 'Email já cadastrado!'); return; }
    try {
      if (selected?.id) { await usuarioService.update(selected.id, form); showAlertMsg('success', 'Usuário atualizado!'); }
      else { await usuarioService.create(form); showAlertMsg('success', 'Usuário cadastrado!'); }
      setShowModal(false); setSelected(null); load();
    } catch { showAlertMsg('danger', 'Erro ao salvar.'); }
  };

  const handleEdit = (u: Usuario) => {
    setSelected(u); setForm({ NomeCompleto: u.NomeCompleto, Email: u.Email, SenhaHash: u.SenhaHash, DataCadastro: u.DataCadastro });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (deleteId) { try { await usuarioService.delete(deleteId); showAlertMsg('success', 'Excluído!'); load(); } catch { showAlertMsg('danger', 'Erro.'); } }
    setShowConfirm(false); setDeleteId(null);
  };

  const showAlertMsg = (t: string, m: string) => { setAlert({ type: t, message: m }); setTimeout(() => setAlert(null), 3000); };

  if (loading) return <LoadingSpinner />;

  return (
    <Container className="page-container animate-in">
      <div className="page-header d-flex justify-content-between align-items-center">
        <div><h1>Usuários</h1><p>Cadastre alunos e instrutores</p></div>
        <Button className="btn-primary-custom" onClick={() => { setSelected(null); setForm({ NomeCompleto: '', Email: '', SenhaHash: '', DataCadastro: new Date().toISOString().split('T')[0] }); setShowModal(true); }}>+ Novo Usuário</Button>
      </div>

      {alert && <Alert className={`alert-custom alert-${alert.type}`} dismissible onClose={() => setAlert(null)}>{alert.message}</Alert>}

      <div className="table-custom">
        <Table hover responsive>
          <thead><tr><th>ID</th><th>Nome Completo</th><th>Email</th><th>Data Cadastro</th><th>Ações</th></tr></thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-4" style={{ color: 'var(--text-muted)' }}>Nenhum usuário.</td></tr>
            ) : usuarios.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td><strong>{u.NomeCompleto}</strong></td>
                <td style={{ color: 'var(--primary-light)' }}>{u.Email}</td>
                <td style={{ color: 'var(--text-muted)' }}>{u.DataCadastro}</td>
                <td>
                  <Button className="btn-secondary-custom btn-sm me-1" onClick={() => handleEdit(u)}>✏️</Button>
                  <Button className="btn-danger-custom btn-sm" onClick={() => { setDeleteId(u.id!); setShowConfirm(true); }}>🗑️</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>{selected ? 'Editar Usuário' : 'Novo Usuário'}</Modal.Title></Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3"><Form.Label>Nome Completo</Form.Label>
              <Form.Control type="text" value={form.NomeCompleto} onChange={e => setForm({...form, NomeCompleto: e.target.value})} required />
            </Form.Group>
            <Row className="g-3">
              <Col md={7}><Form.Group><Form.Label>Email</Form.Label>
                <Form.Control type="email" value={form.Email} onChange={e => setForm({...form, Email: e.target.value})} required />
              </Form.Group></Col>
              <Col md={5}><Form.Group><Form.Label>Data Cadastro</Form.Label>
                <Form.Control type="date" value={form.DataCadastro} onChange={e => setForm({...form, DataCadastro: e.target.value})} required />
              </Form.Group></Col>
            </Row>
            <Form.Group className="mt-3"><Form.Label>Senha</Form.Label>
              <Form.Control type="password" value={form.SenhaHash} onChange={e => setForm({...form, SenhaHash: e.target.value})} required />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button className="btn-secondary-custom" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" className="btn-primary-custom">Salvar</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ConfirmModal show={showConfirm} message="Excluir este usuário?" onConfirm={handleDelete} onCancel={() => setShowConfirm(false)} />
    </Container>
  );
};

export default UsuariosPage;
