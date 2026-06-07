import { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Alert } from 'react-bootstrap';
import { certificadoService } from '../../services/certificadoService';
import { usuarioService } from '../../services/usuarioService';
import { cursoService } from '../../services/cursoService';
import { Certificado } from '../../models/Certificado';
import { Usuario } from '../../models/Usuario';
import { Curso } from '../../models/Curso';
import LoadingSpinner from '../../components/LoadingSpinner';

const CertificadosPage = () => {
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certificado | null>(null);
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [c, u, cur] = await Promise.all([certificadoService.getAll(), usuarioService.getAll(), cursoService.getAll()]);
      setCertificados(c); setUsuarios(u); setCursos(cur);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const getUsuarioNome = (id: number) => usuarios.find(u => u.id === id)?.NomeCompleto || '—';
  const getCursoTitulo = (id: number) => cursos.find(c => c.id === id)?.Titulo || '—';

  if (loading) return <LoadingSpinner />;

  return (
    <Container className="page-container animate-in">
      <div className="page-header"><h1>Certificados</h1><p>Certificados emitidos pela plataforma</p></div>

      {alert && <Alert className={`alert-custom alert-${alert.type}`} dismissible onClose={() => setAlert(null)}>{alert.message}</Alert>}

      {/* Selected Certificate Visual */}
      {selectedCert && (
        <div className="certificate-card mb-4">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', letterSpacing: '3px', textTransform: 'uppercase' }}>Certificado de Conclusão</p>
            <div className="cert-title">PedroPlatform</div>
            <p style={{ color: 'var(--text-secondary)', margin: '1.5rem 0 0.5rem', fontSize: '1rem' }}>Certifica que</p>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, margin: '0.5rem 0' }}>
              {getUsuarioNome(selectedCert.ID_Usuario)}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              concluiu com sucesso o curso
            </p>
            <h4 style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
              {getCursoTitulo(selectedCert.ID_Curso)}
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1.5rem' }}>
              Emitido em: {selectedCert.DataEmissao}
            </p>
            <div className="cert-code">
              🔑 {selectedCert.CodigoVerificacao}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-custom">
        <Table hover responsive>
          <thead><tr><th>ID</th><th>Aluno</th><th>Curso</th><th>Código de Verificação</th><th>Data Emissão</th><th>Ação</th></tr></thead>
          <tbody>
            {certificados.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-4" style={{ color: 'var(--text-muted)' }}>Nenhum certificado emitido.</td></tr>
            ) : certificados.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td><strong>{getUsuarioNome(c.ID_Usuario)}</strong></td>
                <td>{getCursoTitulo(c.ID_Curso)}</td>
                <td><code style={{ color: 'var(--primary-light)', background: 'rgba(108,92,231,0.1)', padding: '2px 8px', borderRadius: '4px' }}>{c.CodigoVerificacao}</code></td>
                <td style={{ color: 'var(--text-muted)' }}>{c.DataEmissao}</td>
                <td>
                  <button className="btn btn-primary-custom btn-sm" onClick={() => setSelectedCert(c)}>
                    👁️ Visualizar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Container>
  );
};

export default CertificadosPage;
