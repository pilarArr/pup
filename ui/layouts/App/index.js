import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';

import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

import Navigation from '../../components/Navigation';

import Authenticated from '../../components/Authenticated';
import Authorized from '../../components/Authorized';
import Public from '../../components/Public';

import Index from '../../pages/Index';

import Documents from '../../pages/Documents';
import ViewDocument from '../../pages/ViewDocument';
import EditDocument from '../../pages/EditDocument';

import Profile from '../../pages/Profile';
import Signup from '../../pages/Signup';
import Login from '../../pages/Login';
import Logout from '../../pages/Logout';

import VerifyEmail from '../../pages/VerifyEmail';
import RecoverPassword from '../../pages/RecoverPassword';
import ResetPassword from '../../pages/ResetPassword';

import AdminUsers from '../../pages/AdminUsers';
import AdminUser from '../../pages/AdminUser';
import AdminUserSettings from '../../pages/AdminUserSettings';

import NotFound from '../../pages/NotFound';
import Footer from '../../components/Footer';

import Terms from '../../pages/Terms';
import Privacy from '../../pages/Privacy';
import ExamplePage from '../../pages/ExamplePage';

import VerifyEmailAlert from '../../components/VerifyEmailAlert';
import GDPRConsentModal from '../../components/GDPRConsentModal';

import withTrackerSsr from '../../../modules/withTrackerSsr';
import getUserName from '../../../modules/getUserName';

import Styles from './styles';

library.add(fas, far, fab);

const App = ({ loading, authenticated, userId, emailVerified, emailAddress, loggingIn }) => {
  const [ready, setPageReady] = useState(false);
  const [afterLoginPath, setAfterLoginPath] = useState(null);

  useEffect(() => {
    setPageReady(true);
  }, []);

  return (
    <Styles.App ready={ready} loading={`${loading}`}>
      {authenticated && (
        <VerifyEmailAlert
          userId={userId}
          emailVerified={emailVerified}
          emailAddress={emailAddress}
        />
      )}
      {authenticated && <GDPRConsentModal />}
      <Navigation />
      <Container>
        <Switch>
          <Route exact name="index" path="/" component={Index} />

          <Authenticated
            exact
            path="/documents"
            component={Documents}
            setAfterLoginPath={setAfterLoginPath}
            loggingIn={loggingIn}
            authenticated={authenticated}
          />
          <Route exact path="/documents/:_id" component={ViewDocument} />
          <Authenticated
            exact
            path="/documents/:_id/edit"
            component={EditDocument}
            setAfterLoginPath={setAfterLoginPath}
            loggingIn={loggingIn}
            authenticated={authenticated}
          />

          <Authenticated
            exact
            path="/profile"
            component={Profile}
            setAfterLoginPath={setAfterLoginPath}
            loggingIn={loggingIn}
            authenticated={authenticated}
          />
          <Public
            path="/signup"
            component={Signup}
            afterLoginPath={afterLoginPath}
            authenticated={authenticated}
          />
          <Public
            path="/login"
            component={Login}
            afterLoginPath={afterLoginPath}
            authenticated={authenticated}
          />
          <Route path="/logout" render={() => <Logout setAfterLoginPath={setAfterLoginPath} />} />

          <Route name="verify-email" path="/verify-email/:token" component={VerifyEmail} />
          <Route name="recover-password" path="/recover-password" component={RecoverPassword} />
          <Route name="reset-password" path="/reset-password/:token" component={ResetPassword} />

          <Route name="terms" path="/terms" component={Terms} />
          <Route name="privacy" path="/privacy" component={Privacy} />
          <Route name="examplePage" path="/example-page" component={ExamplePage} />

          <Authorized
            exact
            allowedRoles={['admin']}
            path="/admin/users"
            pathAfterFailure="/"
            component={AdminUsers}
          />
          <Authorized
            exact
            allowedRoles={['admin']}
            path="/admin/users/settings"
            pathAfterFailure="/"
            component={AdminUserSettings}
          />
          <Authorized
            exact
            allowedRoles={['admin']}
            path="/admin/users/:_id"
            pathAfterFailure="/"
            component={AdminUser}
          />

          <Route component={NotFound} />
        </Switch>
      </Container>
      <Footer />
    </Styles.App>
  );
};

App.defaultProps = {
  loading: true,
  loggingIn: false,
  userId: '',
  emailAddress: '',
  emailVerified: false,
  authenticated: false,
};

App.propTypes = {
  loading: PropTypes.bool,
  loggingIn: PropTypes.bool,
  userId: PropTypes.string,
  emailAddress: PropTypes.string,
  emailVerified: PropTypes.bool,
  authenticated: PropTypes.bool,
};

export default withTrackerSsr(() => {
  const app = Meteor.subscribe('app');
  const loggingIn = Meteor.loggingIn();
  const user = Meteor.user();
  const userId = Meteor.userId();
  const loading = !app.ready() && !Roles.subscription.ready();
  const name = user && user.profile && user.profile.name && getUserName(user.profile.name);
  const emailAddress = user && user.emails && user.emails[0].address;

  return {
    loading,
    loggingIn,
    authenticated: !loggingIn && !!userId,
    name: name || emailAddress,
    userId,
    emailAddress,
    emailVerified: user && user.emails ? user.emails[0] && user.emails[0].verified : true,
  };
})(App);
