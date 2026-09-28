import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { useAuth } from '../hooks/auth';
import SharedActivity from '../pages/SharedActivity';
import AssignedActivities from '../pages/AssignedActivities';

import App from './app.routes';
import Auth from './auth.routes';

const Routes: React.FC = () => {
    const { logged } = useAuth();

    return (
        <BrowserRouter>
            <Switch>
                <Route path="/activity-share" exact component={SharedActivity}/>
                <Route path="/assigned-activities" exact component={AssignedActivities}/>
                <Route render={() => logged ? <App/> : <Auth/>}/>
            </Switch>
        </BrowserRouter>
    );
}

export default Routes;
