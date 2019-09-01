import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';
import { withRouter } from 'react-router';
import { Roles } from 'meteor/alanning:roles';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';

const Authorized = ({
  history,
  loading,
  userId,
  userRoles,
  userIsInRoles,
  pathAfterFailure,
  component,
  path,
  exact,
}) => {
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!userId) history.push(pathAfterFailure || '/');

    if (!loading && userRoles.length > 0) {
      if (!userIsInRoles) {
        history.push(pathAfterFailure || '/');
      } else {
        setAuthorized(true);
      }
    }
  }, [userId, loading, userRoles, userIsInRoles, history, pathAfterFailure]);

  return authorized ? (
    <Route
      path={path}
      exact={exact}
      render={(props) => React.createElement(component, { ...props })}
    />
  ) : (
    <div />
  );
};

Authorized.defaultProps = {
  allowedGroup: null,
  userId: null,
  exact: false,
  userRoles: [],
  userIsInRoles: false,
  pathAfterFailure: '/login',
};

Authorized.propTypes = {
  loading: PropTypes.bool.isRequired,
  // eslint-disable-next-line
  allowedRoles: PropTypes.array.isRequired,
  // eslint-disable-next-line
  allowedGroup: PropTypes.string,
  userId: PropTypes.string,
  component: PropTypes.func.isRequired,
  path: PropTypes.string.isRequired,
  exact: PropTypes.bool,
  history: PropTypes.object.isRequired,
  userRoles: PropTypes.array,
  userIsInRoles: PropTypes.bool,
  pathAfterFailure: PropTypes.string,
};

export default withRouter(
  withTracker(({ allowedRoles, allowedGroup }) => {
    if (Meteor.isClient) {
      return {
        loading: Meteor.isClient ? !Roles.subscription.ready() : true,
        userId: Meteor.userId(),
        userRoles: Roles.getRolesForUser(Meteor.userId()),
        userIsInRoles: Roles.userIsInRole(Meteor.userId(), allowedRoles, allowedGroup),
      };
    }
    return {};
  })(Authorized),
);
