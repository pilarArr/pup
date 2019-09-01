import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';

const Public = ({ authenticated, afterLoginPath, component, path, exact }) => (
  <Route
    path={path}
    exact={exact}
    render={(props) =>
      !authenticated ? (
        React.createElement(component, {
          ...props,
        })
      ) : (
        <Redirect to={afterLoginPath || '/documents'} />
      )
    }
  />
);

Public.defaultProps = {
  path: '',
  exact: false,
  afterLoginPath: null,
};

Public.propTypes = {
  authenticated: PropTypes.bool.isRequired,
  component: PropTypes.func.isRequired,
  afterLoginPath: PropTypes.string,
  path: PropTypes.string,
  exact: PropTypes.bool,
};

export default Public;
