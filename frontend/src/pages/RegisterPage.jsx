import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../services/api';

export default function RegisterPage() {
  const { user, register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', location: '', password: '', password_confirmation: '' });
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  if (user) return <Navigate to="/profil" replace />;
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    if (form.password !== form.password_confirmation) return setError('Лозинките не се совпаѓаат.');
    if (!accepted) return setError('Потребно е да ги прифатите условите за користење.');
    setBusy(true);
    setError('');
    try {
      await register(form);
      navigate('/profil', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Регистрацијата не успеа. Проверете ги податоците.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page auth-page--register">
      <section className="auth-aside">
        <div className="auth-aside__content">
          <div className="eyebrow eyebrow--light"><span /> ПРИКЛУЧЕТЕ СЕ</div>
          <h1>Добрата зделка<br />почнува со <em>доверба.</em></h1>
          <p>Отворете бесплатен профил и станете дел од заедница создадена за земјоделците.</p>
          <div className="auth-benefit"><Icon name="shield" /><span>Јасен профил и транспарентни оценки</span></div>
          <div className="auth-benefit"><Icon name="leaf" /><span>Огласи за машини, култури и производи</span></div>
        </div>
        <div className="auth-landscape"><span /><span /><Icon name="wheat" size={82} /></div>
      </section>
      <section className="auth-form-wrap">
        <form className="auth-form auth-form--wide" onSubmit={submit}>
          <div className="auth-form__head"><span className="form-icon"><Icon name="plus" size={24} /></span><h2>Креирајте профил</h2><p>Потребна е само една минута.</p></div>
          {error && <div className="form-alert" role="alert"><Icon name="warning" size={18} />{error}</div>}
          <div className="form-grid">
            <div className="field field--full"><label htmlFor="register-name">Име и презиме</label><input id="register-name" name="name" required value={form.name} onChange={update} placeholder="Марко Стојанов" autoComplete="name" /></div>
            <div className="field"><label htmlFor="register-email">Е-пошта</label><input id="register-email" name="email" type="email" required value={form.email} onChange={update} placeholder="ime@primer.mk" autoComplete="email" /></div>
            <div className="field"><label htmlFor="register-phone">Телефон</label><input id="register-phone" name="phone" type="tel" required value={form.phone} onChange={update} placeholder="070 123 456" autoComplete="tel" /></div>
            <div className="field field--full"><label htmlFor="register-location">Место</label><div className="input-with-icon"><Icon name="location" size={18} /><input id="register-location" name="location" required value={form.location} onChange={update} placeholder="Кавадарци" /></div></div>
            <div className="field"><label htmlFor="register-password">Лозинка</label><input id="register-password" name="password" type="password" minLength="8" required value={form.password} onChange={update} autoComplete="new-password" placeholder="Најмалку 8 знаци" /></div>
            <div className="field"><label htmlFor="register-confirm">Повтори лозинка</label><input id="register-confirm" name="password_confirmation" type="password" minLength="8" required value={form.password_confirmation} onChange={update} autoComplete="new-password" placeholder="Повторете ја лозинката" /></div>
          </div>
          <label className="checkbox-row"><input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} /><span>Ги прифаќам условите за користење и политиката за приватност.</span></label>
          <button className="btn btn--primary btn--full btn--large" disabled={busy}>{busy ? <><span className="spinner spinner--button" /> Се креира…</> : <>Креирај профил <Icon name="arrow" /></>}</button>
          <p className="auth-switch">Веќе имате профил? <Link to="/najava">Најавете се</Link></p>
        </form>
      </section>
    </main>
  );
}
