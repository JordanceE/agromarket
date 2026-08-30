import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { initials } from '../utils';
import Icon from './Icon';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navClass = ({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`;

  return (
    <header className="site-header">
      <div className="announcement">
        <div className="container announcement__inner">
          <span>Македонски пазар, директно од производителите</span>
          <span className="announcement__trust"><Icon name="shield" size={15} /> Безбедно и едноставно огласување</span>
        </div>
      </div>
      <div className="navbar-wrap">
        <nav className="container navbar" aria-label="Главна навигација">
          <Link to="/" className="brand" aria-label="АгроМаркет — почетна">
            <span className="brand__mark"><Icon name="leaf" size={25} strokeWidth={2} /></span>
            <span className="brand__text">АГРО<span>МАРКЕТ</span></span>
          </Link>

          <div className={`nav-menu ${menuOpen ? 'is-open' : ''}`}>
            <NavLink to="/" className={navClass} end>Огласи</NavLink>
            {user && <NavLink to="/profil" className={navClass}>Мој профил</NavLink>}
            {isAdmin && <NavLink to="/admin" className={navClass}>Администрација</NavLink>}
          </div>

          <div className="navbar__actions">
            {user ? (
              <>
                <Link to="/oglas/nov" className="btn btn--accent btn--nav"><Icon name="plus" size={18} /> Нов оглас</Link>
                <div className="account-menu">
                  <Link to="/profil" className="account-pill" aria-label="Отвори го мојот профил">
                    <span className="avatar avatar--small">{initials(user.name)}</span>
                    <span className="account-pill__name">{user.name?.split(' ')[0]}</span>
                  </Link>
                  <button className="icon-button logout-button" onClick={handleLogout} aria-label="Одјави се" title="Одјави се"><Icon name="logout" /></button>
                </div>
              </>
            ) : (
              <>
                <Link to="/najava" className="nav-login">Најави се</Link>
                <Link to="/registracija" className="btn btn--primary btn--nav">Регистрирај се</Link>
              </>
            )}
            <button className="mobile-toggle icon-button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label="Отвори мени">
              <Icon name={menuOpen ? 'close' : 'menu'} />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
