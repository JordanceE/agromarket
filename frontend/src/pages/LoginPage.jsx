import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../services/api';

export default function LoginPage() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (user) return <Navigate to="/profil" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(form);
      navigate(location.state?.from?.pathname || '/profil', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Е-поштата или лозинката не се точни.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-aside">
        <div className="auth-aside__content">
          <div className="eyebrow eyebrow--light"><span /> ДОБРЕДОЈДОВТЕ НАЗАД</div>
          <h1>Вашиот пазар<br />е секогаш <em>отворен.</em></h1>
          <p>Најавете се за да ги уредувате огласите и да се поврзете со земјоделци од цела Македонија.</p>
          <div className="auth-benefit"><Icon name="check" /><span>Управувајте со активни и завршени огласи</span></div>
          <div className="auth-benefit"><Icon name="check" /><span>Оценувајте производи и градете доверба</span></div>
          <div className="auth-benefit"><Icon name="check" /><span>Контактирајте директно, без посредници</span></div>
        </div>
        <div className="auth-landscape"><span /><span /><Icon name="tractor" size={88} /></div>
      </section>
      <section className="auth-form-wrap">
        <form className="auth-form" onSubmit={submit}>
          <div className="auth-form__head"><span className="form-icon"><Icon name="user" size={25} /></span><h2>Најава</h2><p>Внесете ги вашите податоци за пристап.</p></div>
          {error && <div className="form-alert" role="alert"><Icon name="warning" size={18} />{error}</div>}
          <div className="field"><label htmlFor="login-email">Е-пошта</label><div className="input-with-icon"><Icon name="mail" size={18} /><input id="login-email" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ime@primer.mk" /></div></div>
          <div className="field"><div className="label-row"><label htmlFor="login-password">Лозинка</label></div><input id="login-password" type="password" autoComplete="current-password" required minLength="8" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Најмалку 8 знаци" /></div>
          <button className="btn btn--primary btn--full btn--large" disabled={busy}>{busy ? <><span className="spinner spinner--button" /> Се најавувате…</> : <>Најави се <Icon name="arrow" /></>}</button>
          <p className="auth-switch">Немате профил? <Link to="/registracija">Регистрирајте се бесплатно</Link></p>
        </form>
      </section>
    </main>
  );
}
