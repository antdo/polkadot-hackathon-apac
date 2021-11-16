import ChainState from './pages/ChainState';
import DashBoard from './pages/Dashboard';
import Payments from './pages/Payments';
import ProcessPayment from './pages/ProcessPayment';

import { DashboardIcon, HomeIcon, PeopleIcon, ShieldIcon } from 'evergreen-ui';

export default [
  {
    path: '/',
    name: 'Payments',
    icon: HomeIcon,
    component: Payments,
    exact: true,
  },
  {
    path: '/payments/:id',
    name: 'ProcessPayment',
    icon: HomeIcon,
    exact: true,
    sidebarExcluded: true,
    component: ProcessPayment,
  },
  {
    path: '/disputes',
    name: 'Disputes',
    icon: ShieldIcon,
    exact: true,
    component: DashBoard,
  },
  {
    path: '/governance',
    name: 'Governance',
    icon: PeopleIcon,
    exact: true,
    component: DashBoard,
  },
  {
    path: '/chain-state',
    name: 'Chain State',
    icon: DashboardIcon,
    exact: true,
    component: ChainState,
  },
];
