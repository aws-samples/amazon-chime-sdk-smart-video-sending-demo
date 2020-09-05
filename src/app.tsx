// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import MeetingProvider from './providers/MeetingProvider';
import ErrorProvider from './providers/ErrorProvider';
import DeviceSetup from './containers/DeviceSetup';
import MeetingView from './containers/MeetingView';
import MeetingForm from './containers/MeetingForm';
import routes from './constants/routes';

const App: FC = () => {
  return (
    <Router>
      <ErrorProvider>
        <MeetingProvider>
            <Switch>
              <Route path={routes.HOME} exact component={MeetingForm} />
              <Route path={routes.DEVICE} component={DeviceSetup} />
              <Route path={routes.MEETING} component={MeetingView} />
            </Switch>
        </MeetingProvider>
      </ErrorProvider>
    </Router>
  );
}

export default App;
