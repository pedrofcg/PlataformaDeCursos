import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { usuarioService } from '../../services/usuarioService';
import { planoService } from '../../services/planoService';
import { assinaturaService } from '../../services/assinaturaService';
import { pagamentoService } from '../../services/pagamentoService';
import { Usuario } from '../../models/Usuario';
import { Plano } from '../../models/Plano';
import LoadingSpinner from '../../components/LoadingSpinner';

const CheckoutPage = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);
  const [step, setStep] = useState(1);
  const [selectedUsuario, setSelectedUsuario] = useState<number>(0);
  const [selectedPlano, setSelectedPlano] = useState<Plano | null>(null);
  const [metodoPagamento, setMetodoPagamento] = useState<'Cartão de Crédito' | 'Boleto' | 'PIX'>('PIX');
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState<{ transacaoId: string; assinaturaId: number } | null>(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [u, p] = await Promise.all([usuarioService.getAll(), planoService.getAll()]);
      setUsuarios(u); setPlanos(p);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCheckout = async () => {
    if (!selectedPlano || !selectedUsuario) return;
    setProcessing(true);
    try {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setMonth(endDate.getMonth() + selectedPlano.DuracaoMeses);

      const assinatura = await assinaturaService.create({
        ID_Usuario: selectedUsuario,
        ID_Plano: selectedPlano.id!,
        DataInicio: today.toISOString().split('T')[0],
        DataFim: endDate.toISOString().split('T')[0],
      });

      const transacaoId = `TXN-${metodoPagamento === 'PIX' ? 'PIX' : metodoPagamento === 'Boleto' ? 'BOL' : 'CC'}-${Date.now().toString(36).toUpperCase()}`;

      await pagamentoService.create({
        ID_Assinatura: assinatura.id!,
        ValorPago: selectedPlano.Preco,
        DataPagamento: today.toISOString().split('T')[0],
        MetodoPagamento: metodoPagamento,
        Id_Transacao_Gateway: transacaoId,
      });

      setReceipt({ transacaoId, assinaturaId: assinatura.id! });
      setStep(4);
      showAlertMsg('success', 'Pagamento realizado com sucesso!');
    } catch {
      showAlertMsg('danger', 'Erro ao processar pagamento.');
    } finally {
      setProcessing(false);
    }
  };

  const showAlertMsg = (t: string, m: string) => { setAlert({ type: t, message: m }); setTimeout(() => setAlert(null), 5000); };

  if (loading) return <LoadingSpinner />;

  return (
    <Container className="page-container animate-in">
      <div className="page-header"><h1>Checkout</h1><p>Simulação de assinatura e pagamento</p></div>

      {alert && <Alert className={`alert-custom alert-${alert.type}`} dismissible onClose={() => setAlert(null)}>{alert.message}</Alert>}

      {/* Steps Indicator */}
      <div className="d-flex justify-content-center mb-4 gap-2">
        {['Usuário', 'Plano', 'Pagamento', 'Confirmação'].map((s, i) => (
          <div key={i} className="text-center" style={{ flex: 1, maxWidth: '150px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%', margin: '0 auto 4px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem',
              background: step > i ? 'var(--gradient-primary)' : 'var(--dark-surface)',
              color: step > i ? 'white' : 'var(--text-muted)',
              border: step === i + 1 ? '2px solid var(--primary)' : '1px solid var(--dark-border)',
            }}>{i + 1}</div>
            <small style={{ color: step >= i + 1 ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '0.75rem' }}>{s}</small>
          </div>
        ))}
      </div>

      {/* Step 1: Select User */}
      {step === 1 && (
        <div className="card-custom p-4" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h5 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>👤 Selecione o Usuário</h5>
          <Form.Select value={selectedUsuario} onChange={e => setSelectedUsuario(Number(e.target.value))} className="mb-4">
            <option value={0}>Selecione um usuário...</option>
            {usuarios.map(u => <option key={u.id} value={u.id}>{u.NomeCompleto} ({u.Email})</option>)}
          </Form.Select>
          <div className="text-end">
            <Button className="btn-primary-custom" disabled={!selectedUsuario} onClick={() => setStep(2)}>
              Próximo →
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Select Plan */}
      {step === 2 && (
        <>
          <h5 className="text-center mb-4" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>💎 Escolha um Plano</h5>
          <Row className="g-4 justify-content-center mb-4">
            {planos.map((plano, idx) => (
              <Col key={plano.id} md={6} lg={4}>
                <div
                  className={`pricing-card ${selectedPlano?.id === plano.id ? 'featured' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedPlano(plano)}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {idx === 0 ? '🌱' : idx === 1 ? '🚀' : '💎'}
                  </div>
                  <h5 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{plano.Nome}</h5>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{plano.Descricao}</p>
                  <div className="price">
                    R$ {plano.Preco.toFixed(2).replace('.', ',')}
                    <span>/{plano.DuracaoMeses}m</span>
                  </div>
                  {selectedPlano?.id === plano.id && (
                    <div style={{ color: 'var(--success)', fontWeight: 600, marginTop: '0.5rem' }}>✓ Selecionado</div>
                  )}
                </div>
              </Col>
            ))}
          </Row>
          <div className="d-flex justify-content-center gap-3">
            <Button className="btn-secondary-custom" onClick={() => setStep(1)}>← Voltar</Button>
            <Button className="btn-primary-custom" disabled={!selectedPlano} onClick={() => setStep(3)}>Próximo →</Button>
          </div>
        </>
      )}

      {/* Step 3: Payment */}
      {step === 3 && selectedPlano && (
        <div className="card-custom p-4" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h5 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>💳 Dados do Pagamento</h5>
          <div className="card-custom p-3 mb-4" style={{ background: 'var(--dark-surface)' }}>
            <div className="d-flex justify-content-between">
              <span style={{ color: 'var(--text-secondary)' }}>Plano:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{selectedPlano.Nome}</strong>
            </div>
            <div className="d-flex justify-content-between mt-2">
              <span style={{ color: 'var(--text-secondary)' }}>Valor:</span>
              <strong style={{ color: 'var(--success)' }}>R$ {selectedPlano.Preco.toFixed(2).replace('.', ',')}</strong>
            </div>
            <div className="d-flex justify-content-between mt-2">
              <span style={{ color: 'var(--text-secondary)' }}>Usuário:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{usuarios.find(u => u.id === selectedUsuario)?.NomeCompleto}</strong>
            </div>
          </div>

          <Form.Group className="mb-4">
            <Form.Label>Método de Pagamento</Form.Label>
            <div className="d-flex gap-2">
              {(['PIX', 'Cartão de Crédito', 'Boleto'] as const).map(m => (
                <Button
                  key={m}
                  className={metodoPagamento === m ? 'btn-primary-custom' : 'btn-secondary-custom'}
                  onClick={() => setMetodoPagamento(m)}
                  style={{ flex: 1 }}
                >
                  {m === 'PIX' ? '📱' : m === 'Cartão de Crédito' ? '💳' : '📄'} {m}
                </Button>
              ))}
            </div>
          </Form.Group>

          <div className="d-flex justify-content-between">
            <Button className="btn-secondary-custom" onClick={() => setStep(2)}>← Voltar</Button>
            <Button className="btn-success-custom" onClick={handleCheckout} disabled={processing}>
              {processing ? '⏳ Processando...' : '✅ Confirmar Pagamento'}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && receipt && (
        <div className="card-custom p-4 text-center" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h3 style={{ fontWeight: 800, color: 'var(--success)' }}>Pagamento Confirmado!</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Sua assinatura foi ativada com sucesso.</p>
          
          <div className="card-custom p-3 text-start mb-4" style={{ background: 'var(--dark-surface)' }}>
            <div className="d-flex justify-content-between mb-2">
              <span style={{ color: 'var(--text-muted)' }}>ID da Transação:</span>
              <code style={{ color: 'var(--primary-light)' }}>{receipt.transacaoId}</code>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span style={{ color: 'var(--text-muted)' }}>ID da Assinatura:</span>
              <strong style={{ color: 'var(--text-primary)' }}>#{receipt.assinaturaId}</strong>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span style={{ color: 'var(--text-muted)' }}>Plano:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{selectedPlano?.Nome}</strong>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span style={{ color: 'var(--text-muted)' }}>Valor:</span>
              <strong style={{ color: 'var(--success)' }}>R$ {selectedPlano?.Preco.toFixed(2).replace('.', ',')}</strong>
            </div>
            <div className="d-flex justify-content-between">
              <span style={{ color: 'var(--text-muted)' }}>Método:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{metodoPagamento}</strong>
            </div>
          </div>

          <Button className="btn-primary-custom" onClick={() => { setStep(1); setSelectedPlano(null); setSelectedUsuario(0); setReceipt(null); }}>
            Fazer Nova Assinatura
          </Button>
        </div>
      )}
    </Container>
  );
};

export default CheckoutPage;
