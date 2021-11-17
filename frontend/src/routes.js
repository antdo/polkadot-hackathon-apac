import ChainState from './pages/ChainState';
import DashBoard from './pages/Dashboard';
import Payments from './pages/Payments';
import ProcessPayment from './pages/ProcessPayment';
import DisputeResolution from './pages/DisputeResolution';
import Governance from './pages/Governance';

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
    component: DisputeResolution,
  },
  {
    path: '/governance',
    name: 'Governance',
    icon: PeopleIcon,
    exact: true,
    component: Governance,
  },
  {
    path: '/chain-state',
    name: 'Chain State',
    icon: DashboardIcon,
    exact: true,
    component: ChainState,
  },
];
