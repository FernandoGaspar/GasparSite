import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import Dashboard from '../pages/Dashboard';
import List from '../pages/List';
import Investment from '../pages/Investment';
import EnhancedInvestment from '../pages/Investment/Enhanced';
import Health from '../pages/Health';
import Home from '../pages/Home';
import Tracker from '../pages/Tracker';
import CardList from '../pages/CardList';

const AppRoutes: React.FC = () => (
    <Layout>
        <Switch>
            <Route path="/" exact component={Dashboard} />
            <Route path="/list/:type" exact component={List} />
            <Route path="/investment/enhanced" exact component={EnhancedInvestment} />
            <Route path="/investment" exact component={Investment} />
            <Route path="/health" exact component={Health} />
            <Route path="/home" exact component={Home} />
            <Route path="/tracker" exact component={Tracker} />
            
            <Route path="/CardList/:Banco/:AnoMes" exact component={CardList} />

        </Switch>
    </Layout>
);

export default AppRoutes;
