import { Container } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="footer-custom">
      <Container className="text-center">
        <p>
          © {new Date().getFullYear()} <strong>PedroPlatform</strong> — Plataforma
          de Cursos Online. Todos os direitos reservados.
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
