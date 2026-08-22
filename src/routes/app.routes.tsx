import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import Dashboard from '../pages/Dashboard';
import List from '../pages/List';
import Investment from '../pages/Investment';
import Health from '../pages/Health';
import Home from '../pages/Home';
import Tracker from '../pages/Tracker';
import CardList from '../pages/CardList';
import Assistant from '../pages/Assistant';
import Settings from '../pages/Settings';
import RecurringBills from '../pages/RecurringBills';
import SettingsHome from '../pages/SettingsHome';

const AppRoutes: React.FC = () => (
    <Layout>
        <Switch>
            <Route path="/" exact component={Dashboard} />
            <Route path="/list/:type" exact component={List} />
            <Route path="/investment" exact component={Investment} />
            <Route path="/health" exact component={Health} />
            <Route path="/home" exact component={Home} />
            <Route path="/tracker" exact component={Tracker} />
            <Route path="/assistant" exact component={Assistant} />
            <Route path="/settings" exact component={SettingsHome} />
            <Route path="/settings/automations" exact component={Settings} />
            <Route path="/settings/contas-recorrentes" exact component={RecurringBills} />
            
            <Route path="/CardList/:Banco/:AnoMes" exact component={CardList} />

        </Switch>
    </Layout>
);

export default AppRoutes;
