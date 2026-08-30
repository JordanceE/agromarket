import { Link } from 'react-router-dom';
import Icon from './Icon';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link to="/" className="brand brand--footer">
            <span className="brand__mark"><Icon name="leaf" size={25} /></span>
            <span className="brand__text">АГРО<span>МАРКЕТ</span></span>
          </Link>
          <p>Дигитално место каде македонските земјоделци тргуваат директно, чесно и едноставно.</p>
        </div>
        <div>
          <h3>Пазар</h3>
          <Link to="/?listing_type=sell">Се продава</Link>
          <Link to="/?listing_type=buy">Се бара</Link>
          <Link to="/oglas/nov">Постави оглас</Link>
        </div>
        <div>
          <h3>Кориснички профил</h3>
          <Link to="/profil">Мои огласи</Link>
          <Link to="/najava">Најава</Link>
          <Link to="/registracija">Регистрација</Link>
        </div>
        <div className="footer-note">
          <h3>Заедно растеме</h3>
          <p>Поддржете го локалното производство и пронајдете доверливи соработници.</p>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} АгроМаркет</span>
        <span>Направено за македонското земјоделство</span>
      </div>
    </footer>
  );
}
