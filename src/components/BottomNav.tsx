import { NavLink } from 'react-router-dom';
import { Dumbbell, House, Settings2, TrendingUp } from 'lucide-react';

const items = [
  { to: '/', label: 'Início', icon: House, end: true },
  { to: '/treinos', label: 'Treinos', icon: Dumbbell, end: false },
  { to: '/evolucao', label: 'Evolução', icon: TrendingUp, end: false },
  { to: '/ajustes', label: 'Ajustes', icon: Settings2, end: false }
];

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      <div className="bottom-nav__inner">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `bottom-nav__item${isActive ? ' is-active' : ''}`}>
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
