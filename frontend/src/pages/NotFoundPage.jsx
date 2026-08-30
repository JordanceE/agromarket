import { Link } from 'react-router-dom';
import Icon from '../components/Icon';

export default function NotFoundPage() {
  return <main className="not-found"><div><span className="not-found__number">404</span><Icon name="wheat" size={76} /><h1>Оваа нива е празна.</h1><p>Страницата што ја барате не постои или е преместена.</p><Link className="btn btn--accent btn--large" to="/">Назад на почетна <Icon name="arrow" /></Link></div></main>;
}
