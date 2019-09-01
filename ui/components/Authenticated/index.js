import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';

const Authenticated = ({ setAfterLoginPath, loggingIn, authenticated, component, path, exact }) => {
  useEffect(() => {
    if (Meteor.isClient) {
      setAfterLoginPath(`${window.location.pathname}${window.location.search}`);
    }
  }, [setAfterLoginPath]);

  return (
    <Route
      path={path}
      exact={exact}
      render={(props) =>
        authenticated ? (
          React.createElement(component, {
            ...props,
            loggingIn,
            authenticated,
          })
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

Authenticated.defaultProps = {
  loggingIn: false,
  path: '',
  exact: false,
};

Authenticated.propTypes = {
  loggingIn: PropTypes.bool,
  authenticated: PropTypes.bool.isRequired,
  component: PropTypes.func.isRequired,
  setAfterLoginPath: PropTypes.func.isRequired,
  path: PropTypes.string,
  exact: PropTypes.bool,
};

export default Authenticated;
