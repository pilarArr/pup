import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { compose, graphql, withApollo } from 'react-apollo';
import FileSaver from 'file-saver';
import base64ToBlob from 'b64-to-blob';
import { Row, Col, Form, Button, Tabs, Tab } from 'react-bootstrap';
import { capitalize } from 'lodash';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Bert } from 'meteor/themeteorchef:bert';
import Validation from '../../components/Validation';
import PageHeader from '../../components/PageHeader';
import InputHint from '../../components/InputHint';
import AccountPageFooter from '../../components/AccountPageFooter';
import UserSettings from '../../components/UserSettings';
import { user as userQuery, exportUserData as exportUserDataQuery } from '../../queries/Users.gql';
import {
  updateUser as updateUserMutation,
  removeUser as removeUserMutation,
} from '../../mutations/Users.gql';
import Styles from './styles';

const OAuthUserProfile = ({ user }) => (
  <div key={user.oAuthProvider} className={`LoggedInWith ${user.oAuthProvider}`}>
    <img src={`/${user.oAuthProvider}.svg`} alt={user.oAuthProvider} />
    <p>
      {`You're logged in with ${capitalize(user.oAuthProvider)} using the email address ${
        user.emailAddress
      }.`}
    </p>
    <Button
      className={`btn btn-${user.oAuthProvider}`}
      href={
        {
          facebook: 'https://www.facebook.com/settings',
          google: 'https://myaccount.google.com/privacy#personalinfo',
          github: 'https://github.com/settings/profile',
        }[user.oAuthProvider]
      }
      target="_blank"
    >
      {`Edit Profile on ${capitalize(user.oAuthProvider)}`}
    </Button>
  </div>
);
OAuthUserProfile.propTypes = {
  user: PropTypes.object.isRequired,
};

const PasswordUserProfile = ({ user }) => (
  <>
    <Form.Row>
      <Form.Group as={Col} xs={6}>
        <Form.Label>First Name</Form.Label>
        <Form.Control type="text" name="firstName" defaultValue={user.name.first} />
      </Form.Group>
      <Form.Group as={Col} xs={6}>
        <Form.Label>Last Name</Form.Label>
        <Form.Control type="text" name="lastName" defaultValue={user.name.last} />
      </Form.Group>
    </Form.Row>
    <Form.Group>
      <Form.Label>Email Address</Form.Label>
      <Form.Control type="email" name="emailAddress" defaultValue={user.emailAddress} />
    </Form.Group>
    <Form.Group>
      <Form.Label>Current Password</Form.Label>
      <Form.Control type="password" name="currentPassword" />
    </Form.Group>
    <Form.Group>
      <Form.Label>New Password</Form.Label>
      <Form.Control type="password" name="newPassword" />
      <InputHint>Use at least six characters.</InputHint>
    </Form.Group>
    <Button type="submit" variant="success">
      Save Profile
    </Button>
  </>
);
PasswordUserProfile.propTypes = {
  user: PropTypes.object.isRequired,
};

const getUserType = (user) => (user.oAuthProvider ? 'oauth' : 'password');

const ProfileForm = ({ user }) => {
  if (user) {
    switch (getUserType(user)) {
      case 'oauth':
        return <OAuthUserProfile user={user} />;
      case 'password':
        return <PasswordUserProfile user={user} />;
      default:
        throw new Error();
    }
  }
  return '';
};
ProfileForm.propTypes = {
  user: PropTypes.object.isRequired,
};

const Profile = ({ client, data, updateUser, removeUser }) => {
  const [activeTab, setActiveTab] = useState('profile');

  const handleExportData = async (event) => {
    event.preventDefault();
    const { dataToExport } = await client.query({
      query: exportUserDataQuery,
    });

    FileSaver.saveAs(base64ToBlob(dataToExport.exportUserData.zip), `${Meteor.userId()}.zip`);
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure? This will permanently delete your account and all of its data.')) {
      removeUser();
    }
  };

  const handleSubmit = (form) => {
    updateUser({
      variables: {
        user: {
          email: form.emailAddress.value,
          profile: {
            name: {
              first: form.firstName.value,
              last: form.lastName.value,
            },
          },
        },
      },
    });

    if (form.newPassword.value) {
      Accounts.changePassword(form.currentPassword.value, form.newPassword.value, (error) => {
        const updateForm = form;
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          updateForm.currentPassword.value = '';
          updateForm.newPassword.value = '';
        }
      });
    }
  };

  return data.user ? (
    <Styles.Profile>
      <PageHeader>
        <h4>
          {data.user.name ? `${data.user.name.first} ${data.user.name.last}` : data.user.username}
        </h4>
      </PageHeader>
      <Tabs
        transition={false}
        activeKey={activeTab}
        onSelect={(newTab) => setActiveTab(newTab)}
        id="user-tabs"
      >
        <Tab eventKey="profile" title="Profile">
          <Row>
            <Col xs={12} md={6} lg={4}>
              <Validation
                rules={{
                  firstName: {
                    required: true,
                  },
                  lastName: {
                    required: true,
                  },
                  emailAddress: {
                    required: true,
                    email: true,
                  },
                  currentPassword: {
                    required: (form, blah) => {
                      console.info(form, blah);
                      // Only required if newPassword field has a value.
                      return document.querySelector('[name="newPassword"]').value.length > 0;
                    },
                  },
                  newPassword: {
                    required() {
                      // Only required if currentPassword field has a value.
                      return document.querySelector('[name="currentPassword"]').value.length > 0;
                    },
                    minlength: 6,
                  },
                }}
                messages={{
                  firstName: {
                    required: "What's your first name?",
                  },
                  lastName: {
                    required: "What's your last name?",
                  },
                  emailAddress: {
                    required: 'Need an email address here.',
                    email: 'Is this email address correct?',
                  },
                  currentPassword: {
                    required: 'Need your current password if changing.',
                  },
                  newPassword: {
                    required: 'Need your new password if changing.',
                  },
                }}
                submitHandler={(form) => handleSubmit(form)}
              >
                <Form onSubmit={(event) => event.preventDefault()}>
                  <ProfileForm user={data.user} />
                </Form>
              </Validation>
              <AccountPageFooter>
                <p>
                  <Button variant="link" className="btn-export" onClick={handleExportData}>
                    Export my data
                  </Button>
                  {' - '}
                  Download all of your documents as .txt files in a .zip
                </p>
              </AccountPageFooter>
              <AccountPageFooter>
                <Button variant="danger" onClick={handleDeleteAccount}>
                  Delete My Account
                </Button>
              </AccountPageFooter>
            </Col>
          </Row>
        </Tab>
        <Tab eventKey="settings" title="Settings">
          <UserSettings settingsFromProps={data.user.settings} updateUser={updateUser} />
        </Tab>
      </Tabs>
    </Styles.Profile>
  ) : (
    ''
  );
};

Profile.propTypes = {
  data: PropTypes.object.isRequired,
  updateUser: PropTypes.func.isRequired,
  removeUser: PropTypes.func.isRequired,
  client: PropTypes.object.isRequired,
};

export default compose(
  graphql(userQuery),
  graphql(updateUserMutation, {
    name: 'updateUser',
    options: () => ({
      refetchQueries: [{ query: userQuery }],
      onCompleted: () => {
        Bert.alert('Profile updated!', 'success');
      },
      onError: (error) => {
        Bert.alert(error.message, 'danger');
      },
    }),
  }),
  graphql(removeUserMutation, {
    name: 'removeUser',
    options: () => ({
      onCompleted: () => {
        Bert.alert('User removed!', 'success');
      },
      onError: (error) => {
        Bert.alert(error.message, 'danger');
      },
    }),
  }),
)(withApollo(Profile));
