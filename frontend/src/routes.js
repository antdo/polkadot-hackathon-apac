import ChainState from './pages/ChainState';
import DashBoard from './pages/Dashboard';
import Payments from './pages/Payments';

import { DashboardIcon, HomeIcon, PeopleIcon, ShieldIcon } from 'evergreen-ui';

export default [
  {
    path: '/',
    name: 'Payments',
    icon: HomeIcon,
    exact: true,
    private: true,
    component: Payments,
  },
  {
    path: '/disputes',
    name: 'Disputes',
    icon: ShieldIcon,
    exact: true,
    private: true,
    component: DashBoard,
  },
  {
    path: '/governance',
    name: 'Governance',
    icon: PeopleIcon,
    exact: true,
    private: true,
    component: DashBoard,
  },
  {
    path: '/chain-state',
    name: 'Chain State',
    icon: DashboardIcon,
    exact: true,
    private: true,
    component: ChainState,
  },
];
