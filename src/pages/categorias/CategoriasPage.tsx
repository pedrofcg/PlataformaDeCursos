import { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Modal, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { categoriaService } from '../../services/categoriaService';
import { cursoService } from '../../services/cursoService';
import { Categoria } from '../../models/Categoria';
import { Curso } from '../../models/Curso';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmModal from '../../components/ConfirmModal';

const CategoriasPage = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cursosPorCategoria, setCursosPorCategoria] = useState<Record<number, Curso[]>>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCursosModal, setShowCursosModal] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);
  const [form, setForm] = useState({ Nome: '', Descricao: '' });

  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    try {
      const data = await categoriaService.getAll();
      setCategorias(data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedCategoria?.id) {
        await categoriaService.update(selectedCategoria.id, form);
        showAlert('success', 'Categoria atualizada com sucesso!');
      } else {
        await categoriaService.create(form);
        showAlert('success', 'Categoria criada com sucesso!');
      }
      setShowModal(false);
      resetForm();
      loadCategorias();
    } catch (error) {
      showAlert('danger', 'Erro ao salvar categoria.');
    }
  };

  const handleEdit = (categoria: Categoria) => {
    setSelectedCategoria(categoria);
    setForm({ Nome: categoria.Nome, Descricao: categoria.Descricao });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await categoriaService.delete(deleteId);
        showAlert('success', 'Categoria excluída!');
        loadCategorias();
      } catch (error) {
        showAlert('danger', 'Erro ao excluir.');
      }
    }
    setShowConfirm(false);
    setDeleteId(null);
  };

  const handleViewCursos = async (categoria: Categoria) => {
    try {
      const cursos = await cursoService.getByCategoria(categoria.id!);
      setCursosPorCategoria({ [categoria.id!]: cursos });
      setSelectedCategoria(categoria);
      setShowCursosModal(true);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const resetForm = () => {
    setForm({ Nome: '', Descricao: '' });
    setSelectedCategoria(null);
  };

  const showAlert = (type: string, message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 3000);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container className="page-container animate-in">
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1>Categorias</h1>
          <p>Gerencie as categorias dos cursos</p>
        </div>
        <Button
          className="btn-primary-custom"
          onClick={() => { resetForm(); setShowModal(true); }}
        >
          + Nova Categoria
        </Button>
      </div>

      {alert && (
        <Alert className={`alert-custom alert-${alert.type}`} dismissible onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      <div className="table-custom">
        <Table hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Descrição</th>
              <th style={{ width: '220px' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {categorias.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-4" style={{ color: 'var(--text-muted)' }}>Nenhuma categoria cadastrada</td></tr>
            ) : (
              categorias.map((cat) => (
                <tr key={cat.id}>
                  <td>{cat.id}</td>
                  <td><strong>{cat.Nome}</strong></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{cat.Descricao}</td>
                  <td>
                    <Button className="btn-primary-custom btn-sm me-1" onClick={() => handleViewCursos(cat)}>
                      📚 Cursos
                    </Button>
                    <Button className="btn-secondary-custom btn-sm me-1" onClick={() => handleEdit(cat)}>
                      ✏️
                    </Button>
                    <Button className="btn-danger-custom btn-sm" onClick={() => { setDeleteId(cat.id!); setShowConfirm(true); }}>
                      🗑️
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Modal Create/Edit */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{selectedCategoria ? 'Editar Categoria' : 'Nova Categoria'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nome da categoria"
                value={form.Nome}
                onChange={(e) => setForm({ ...form, Nome: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Descreva a categoria"
                value={form.Descricao}
                onChange={(e) => setForm({ ...form, Descricao: e.target.value })}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button className="btn-secondary-custom" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" className="btn-primary-custom">Salvar</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Cursos por Categoria */}
      <Modal show={showCursosModal} onHide={() => setShowCursosModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Cursos — {selectedCategoria?.Nome}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCategoria && cursosPorCategoria[selectedCategoria.id!]?.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📭</div>
              <p>Nenhum curso nesta categoria.</p>
            </div>
          ) : (
            <Row className="g-3">
              {selectedCategoria &&
                cursosPorCategoria[selectedCategoria.id!]?.map((curso) => (
                  <Col key={curso.id} md={6}>
                    <div className="card-custom p-3">
                      <h6 style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{curso.Titulo}</h6>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{curso.Descricao}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className={`badge-nivel ${curso.Nivel === 'Iniciante' ? 'badge-iniciante' : curso.Nivel === 'Intermediário' ? 'badge-intermediario' : 'badge-avancado'}`}>
                          {curso.Nivel}
                        </span>
                        <Link to={`/cursos/${curso.id}`} className="btn btn-primary-custom btn-sm">
                          Detalhes
                        </Link>
                      </div>
                    </div>
                  </Col>
                ))}
            </Row>
          )}
        </Modal.Body>
      </Modal>

      <ConfirmModal
        show={showConfirm}
        message="Tem certeza que deseja excluir esta categoria?"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </Container>
  );
};

export default CategoriasPage;
