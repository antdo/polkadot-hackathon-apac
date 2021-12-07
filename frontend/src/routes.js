import ChainState from './pages/ChainState';
import PayHistory from './pages/PayHistory';
import Payments from './pages/Payments';
import ProcessPayment from './pages/ProcessPayment';
import Disputes from './pages/Disputes';
import Resolvers from './pages/Resolvers';
import Faucet from './pages/Faucet';

import { DashboardIcon, HomeIcon, PeopleIcon, ShieldIcon, HistoryIcon, ChangesIcon } from 'evergreen-ui';

export default [
  {
    path: '/',
    name: 'Payments',
    icon: HomeIcon,
    component: Payments,
    exact: true,
  },
  {
    path: '/pay-history',
    name: 'Pay History',
    icon: HistoryIcon,
    component: PayHistory,
    exact: true,
  },
  {
    path: '/payments/:id',
    name: 'Process Payment',
    icon: HomeIcon,
    exact: true,
    sidebarExcluded: true,
    noSidebar: true,
    noTopbar: true,
    component: ProcessPayment,
  },
  {
    path: '/disputes',
    name: 'Disputes',
    icon: ShieldIcon,
    exact: true,
    component: Disputes,
  },
  {
    path: '/resolvers',
    name: 'Resolvers',
    icon: PeopleIcon,
    exact: true,
    component: Resolvers,
  },
  {
    path: '/faucet',
    name: 'Faucet',
    icon: ChangesIcon,
    exact: true,
    component: Faucet,
  },
  {
    path: '/chain-state',
    name: 'Chain State',
    icon: DashboardIcon,
    exact: true,
    component: ChainState,
  },
];
