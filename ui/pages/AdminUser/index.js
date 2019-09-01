import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import { Breadcrumb, Tab, Tabs } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Bert } from 'meteor/themeteorchef:bert';
import AdminUserProfile from '../../components/AdminUserProfile';
import UserSettings from '../../components/UserSettings';
import { user as userQuery, users as usersQuery } from '../../queries/Users.gql';
import {
  updateUser as updateUserMutation,
  removeUser as removeUserMutation,
} from '../../mutations/Users.gql';

import Styles from './styles';
import PageHeader from '../../components/PageHeader';

const AdminUser = ({ data, updateUser, removeUser }) => {
  const [activeTab, setTab] = useState('profile');

  const name = data.user && data.user.name;
  const username = data.user && data.user.username;

  return data.user ? (
    <>
      <Breadcrumb>
        <LinkContainer to="/admin/users">
          <Breadcrumb.Item>Users</Breadcrumb.Item>
        </LinkContainer>
        <Breadcrumb.Item active>{name ? `${name.first} ${name.last}` : username}</Breadcrumb.Item>
      </Breadcrumb>
      <PageHeader>
        <h4>
          {name ? `${name.first} ${name.last}` : username}
          {data.user.oAuthProvider && (
            <Styles.ServiceBadge service={data.user.oAuthProvider}>
              {data.user.oAuthProvider}
            </Styles.ServiceBadge>
          )}
        </h4>
      </PageHeader>
      <Tabs
        className="mb-2"
        transition={false}
        activeKey={activeTab}
        onSelect={(selectedTab) => setTab(selectedTab)}
        id="admin-user-tabs"
      >
        <Tab eventKey="profile" title="Profile">
          <AdminUserProfile
            user={data.user}
            updateUser={(options, callback) => {
              // NOTE: Do this to allow us to perform work inside of AdminUserProfile
              // after a successful update. Not ideal, but hey, c'est la vie.
              updateUser(options);
              if (callback) callback();
            }}
            removeUser={removeUser}
          />
        </Tab>
        <Tab eventKey="settings" title="Settings">
          <UserSettings
            isAdmin
            userId={data.user._id}
            settingsFromProps={data.user.settings}
            updateUser={updateUser}
          />
        </Tab>
      </Tabs>
    </>
  ) : (
    ''
  );
};

AdminUser.propTypes = {
  data: PropTypes.object.isRequired,
  updateUser: PropTypes.func.isRequired,
  removeUser: PropTypes.func.isRequired,
};

export default compose(
  graphql(userQuery, {
    options: ({ match }) => ({
      // NOTE: This ensures cache isn't too aggressive when moving between users.
      // Forces Apollo to perform userQuery as a user is loaded instead of falling
      // back to the cache. Users share similar data which gets cached and ends up
      // breaking the UI.
      fetchPolicy: 'no-cache',
      variables: {
        _id: match.params._id,
      },
    }),
  }),
  graphql(updateUserMutation, {
    name: 'updateUser',
    options: ({ match }) => ({
      refetchQueries: [{ query: userQuery, variables: { _id: match.params._id } }],
      onCompleted: () => {
        Bert.alert('User updated!', 'success');
      },
    }),
  }),
  graphql(removeUserMutation, {
    name: 'removeUser',
    options: ({ history }) => ({
      refetchQueries: [{ query: usersQuery }],
      onCompleted: () => {
        Bert.alert('User deleted!', 'success');
        history.push('/admin/users');
      },
    }),
  }),
)(AdminUser);
