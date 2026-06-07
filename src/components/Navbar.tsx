import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const AppNavbar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Navbar expand="lg" fixed="top" className="navbar-custom">
      <Container>
        <Navbar.Brand as={Link} to="/">
          🎓 PedroPlatform
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="ms-auto">
            <Nav.Link
              as={Link}
              to="/"
              className={isActive('/') ? 'active' : ''}
            >
              Dashboard
            </Nav.Link>

            <NavDropdown title="📚 Acadêmico" id="academic-dropdown">
              <NavDropdown.Item as={Link} to="/categorias">
                Categorias
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/cursos">
                Cursos
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/trilhas">
                Trilhas
              </NavDropdown.Item>
            </NavDropdown>

            <NavDropdown title="👤 Usuários" id="users-dropdown">
              <NavDropdown.Item as={Link} to="/usuarios">
                Usuários
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/matriculas">
                Matrículas
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/progresso">
                Progresso
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/avaliacoes">
                Avaliações
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/certificados">
                Certificados
              </NavDropdown.Item>
            </NavDropdown>

            <NavDropdown title="💰 Financeiro" id="financial-dropdown">
              <NavDropdown.Item as={Link} to="/planos">
                Planos
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/checkout">
                Checkout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
