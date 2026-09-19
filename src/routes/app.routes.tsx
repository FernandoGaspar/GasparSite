import React, { lazy, Suspense } from 'react';
import { Switch, Route } from 'react-router-dom';
import Layout from '../components/Layout';

const Dashboard = lazy(() => import('../pages/Dashboard'));
const List = lazy(() => import('../pages/List'));
const Investment = lazy(() => import('../pages/Investment'));
const Health = lazy(() => import('../pages/Health'));
const Home = lazy(() => import('../pages/Home'));
const Tracker = lazy(() => import('../pages/Tracker'));
const CardList = lazy(() => import('../pages/CardList'));
const Assistant = lazy(() => import('../pages/Assistant'));
const Settings = lazy(() => import('../pages/Settings'));
const RecurringBills = lazy(() => import('../pages/RecurringBills'));
const SettingsHome = lazy(() => import('../pages/SettingsHome'));
const Planning = lazy(() => import('../pages/Planning'));
const Activities = lazy(() => import('../pages/Activities'));
const AIContext = lazy(() => import('../pages/AIContext'));
const BudgetSettings = lazy(() => import('../pages/BudgetSettings'));
const Communications = lazy(() => import('../pages/Communications'));

const AppRoutes: React.FC = () => (
    <Layout>
      <Suspense fallback={<div role="status">Carregando…</div>}>
        <Switch>
            <Route path="/" exact component={Dashboard} />
            <Route path="/list/:type" exact component={List} />
            <Route path="/investment" exact component={Investment} />
            <Route path="/health" exact component={Health} />
            <Route path="/home" exact component={Home} />
            <Route path="/tracker" exact component={Tracker} />
            <Route path="/assistant" exact component={Assistant} />
            <Route path="/planning" exact component={Planning} />
            <Route path="/activities" exact component={Activities} />
            <Route path="/communications" exact component={Communications} />
            <Route path="/ai-context" exact component={AIContext} />
            <Route path="/settings" exact component={SettingsHome} />
            <Route path="/settings/automations" exact component={Settings} />
            <Route path="/settings/contas-recorrentes" exact component={RecurringBills} />
            <Route path="/settings/budget" exact component={BudgetSettings} />
            
            <Route path="/CardList/:Banco/:AnoMes" exact component={CardList} />

        </Switch>
      </Suspense>
    </Layout>
);

export default AppRoutes;
