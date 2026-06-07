import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, ProgressBar } from 'react-bootstrap';
import { usuarioService } from '../../services/usuarioService';
import { cursoService } from '../../services/cursoService';
import { matriculaService } from '../../services/matriculaService';
import { moduloService } from '../../services/moduloService';
import { aulaService } from '../../services/aulaService';
import { progressoService } from '../../services/progressoService';
import { certificadoService } from '../../services/certificadoService';
import { Usuario } from '../../models/Usuario';
import { Curso } from '../../models/Curso';
import { Matricula } from '../../models/Matricula';
import { Modulo } from '../../models/Modulo';
import { Aula } from '../../models/Aula';
import { ProgressoAula } from '../../models/ProgressoAula';
import LoadingSpinner from '../../components/LoadingSpinner';

const ProgressoPage = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [selectedUsuario, setSelectedUsuario] = useState<number>(0);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [selectedCurso, setSelectedCurso] = useState<number>(0);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [aulasMap, setAulasMap] = useState<Record<number, Aula[]>>({});
  const [progressos, setProgressos] = useState<ProgressoAula[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      try { const [u, c] = await Promise.all([usuarioService.getAll(), cursoService.getAll()]); setUsuarios(u); setCursos(c); }
      catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const onUsuarioChange = async (userId: number) => {
    setSelectedUsuario(userId);
    setSelectedCurso(0);
    setModulos([]); setAulasMap({}); setProgressos([]);
    if (userId > 0) {
      try { const m = await matriculaService.getByUsuario(userId); setMatriculas(m); }
      catch { setMatriculas([]); }
    } else { setMatriculas([]); }
  };

  const onCursoChange = async (cursoId: number) => {
    setSelectedCurso(cursoId);
    if (cursoId > 0) {
      setLoadingContent(true);
      try {
        const [mods, progs] = await Promise.all([moduloService.getByCurso(cursoId), progressoService.getByUsuario(selectedUsuario)]);
        setModulos(mods);
        setProgressos(progs);
        const aMap: Record<number, Aula[]> = {};
        for (const mod of mods) { aMap[mod.id!] = await aulaService.getByModulo(mod.id!); }
        setAulasMap(aMap);
      } catch (e) { console.error(e); }
      finally { setLoadingContent(false); }
    }
  };

  const isAulaConcluida = (aulaId: number) => progressos.some(p => p.ID_Aula === aulaId && p.Status === 'Concluído');

  const handleToggleAula = async (aulaId: number) => {
    const existing = progressos.find(p => p.ID_Aula === aulaId && p.ID_Usuario === selectedUsuario);
    try {
      if (existing) {
        await progressoService.delete(existing.id!);
      } else {
        await progressoService.create({ ID_Usuario: selectedUsuario, ID_Aula: aulaId, DataConclusao: new Date().toISOString().split('T')[0], Status: 'Concluído' });
      }
      const progs = await progressoService.getByUsuario(selectedUsuario);
      setProgressos(progs);
    } catch { showAlertMsg('danger', 'Erro ao atualizar progresso.'); }
  };

  const getAllAulas = (): Aula[] => Object.values(aulasMap).flat();
  const totalAulas = getAllAulas().length;
  const aulasConc = getAllAulas().filter(a => isAulaConcluida(a.id!)).length;
  const percent = totalAulas > 0 ? Math.round((aulasConc / totalAulas) * 100) : 0;

  const handleGerarCertificado = async () => {
    if (percent < 100) { showAlertMsg('danger', 'Complete todas as aulas primeiro!'); return; }
    try {
      const code = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      await certificadoService.create({
        ID_Usuario: selectedUsuario,
        ID_Curso: selectedCurso,
        ID_Trilha: null,
        CodigoVerificacao: code,
        DataEmissao: new Date().toISOString().split('T')[0],
      });
      showAlertMsg('success', `Certificado gerado! Código: ${code}`);
    } catch { showAlertMsg('danger', 'Erro ao gerar certificado.'); }
  };

  const showAlertMsg = (t: string, m: string) => { setAlert({ type: t, message: m }); setTimeout(() => setAlert(null), 5000); };

  if (loading) return <LoadingSpinner />;

  return (
    <Container className="page-container animate-in">
      <div className="page-header"><h1>Progresso de Aulas</h1><p>Acompanhe e marque aulas concluídas</p></div>

      {alert && <Alert className={`alert-custom alert-${alert.type}`} dismissible onClose={() => setAlert(null)}>{alert.message}</Alert>}

      <Row className="g-3 mb-4">
        <Col md={5}>
          <Form.Label>Selecione o Aluno</Form.Label>
          <Form.Select value={selectedUsuario} onChange={e => onUsuarioChange(Number(e.target.value))}>
            <option value={0}>Selecione um aluno...</option>
            {usuarios.map(u => <option key={u.id} value={u.id}>{u.NomeCompleto}</option>)}
          </Form.Select>
        </Col>
        <Col md={5}>
          <Form.Label>Curso Matriculado</Form.Label>
          <Form.Select value={selectedCurso} onChange={e => onCursoChange(Number(e.target.value))} disabled={!selectedUsuario}>
            <option value={0}>Selecione um curso...</option>
            {matriculas.map(m => <option key={m.id} value={m.ID_Curso}>{cursos.find(c => c.id === m.ID_Curso)?.Titulo}</option>)}
          </Form.Select>
        </Col>
      </Row>

      {loadingContent ? <LoadingSpinner /> : selectedCurso > 0 && (
        <>
          {/* Progress Bar */}
          <div className="card-custom p-4 mb-4">
            <div className="d-flex justify-content-between mb-2">
              <strong style={{ color: 'var(--text-primary)' }}>Progresso Geral</strong>
              <span style={{ color: 'var(--primary-light)', fontWeight: 700 }}>{percent}%</span>
            </div>
            <div className="progress-custom">
              <ProgressBar now={percent} />
            </div>
            <div className="d-flex justify-content-between mt-2">
              <small style={{ color: 'var(--text-muted)' }}>{aulasConc} de {totalAulas} aulas concluídas</small>
              {percent === 100 && (
                <Button className="btn-success-custom btn-sm" onClick={handleGerarCertificado}>
                  🏅 Gerar Certificado
                </Button>
              )}
            </div>
          </div>

          {/* Modules & Lessons Checklist */}
          {modulos.map(mod => (
            <div key={mod.id} className="card-custom p-3 mb-3">
              <h6 style={{ color: 'var(--primary-light)', fontWeight: 700, marginBottom: '1rem' }}>
                #{mod.Ordem} — {mod.Titulo}
              </h6>
              {(aulasMap[mod.id!] || []).map(aula => (
                <div key={aula.id} className="d-flex align-items-center p-2 mb-1" style={{ background: 'var(--dark-surface)', borderRadius: '8px' }}>
                  <Form.Check
                    type="checkbox"
                    checked={isAulaConcluida(aula.id!)}
                    onChange={() => handleToggleAula(aula.id!)}
                    className="me-3"
                  />
                  <div className="flex-grow-1">
                    <span style={{ color: isAulaConcluida(aula.id!) ? 'var(--success)' : 'var(--text-primary)', textDecoration: isAulaConcluida(aula.id!) ? 'line-through' : 'none' }}>
                      {aula.Titulo}
                    </span>
                    <span className={`badge-tipo ${aula.TipoConteudo === 'Vídeo' ? 'badge-video' : aula.TipoConteudo === 'Texto' ? 'badge-texto' : 'badge-quiz'} ms-2`}>
                      {aula.TipoConteudo}
                    </span>
                  </div>
                  <small style={{ color: 'var(--text-muted)' }}>{aula.DuracaoMinutos} min</small>
                </div>
              ))}
            </div>
          ))}
        </>
      )}
    </Container>
  );
};

export default ProgressoPage;
