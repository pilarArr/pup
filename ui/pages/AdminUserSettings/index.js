import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, ListGroup, ListGroupItem } from 'react-bootstrap';
import { compose, graphql } from 'react-apollo';
import styled from 'styled-components';
import { Bert } from 'meteor/themeteorchef:bert';
import AdminUserSettingsModal from '../../components/AdminUserSettingsModal';
import BlankState from '../../components/BlankState';
import userSettingsQuery from '../../queries/UserSettings.gql';
import {
  addUserSetting as addUserSettingMutation,
  updateUserSetting as updateUserSettingMutation,
  removeUserSetting as removeUserSettingMutation,
} from '../../mutations/UserSettings.gql';
import PageHeader from '../../components/PageHeader';

const Setting = styled(ListGroupItem)`
  display: flex;
  align-items: center;
  justify-content: space-between;

  p {
    margin: 0;
    word-break: break-word;
  }

  .btn:last-child {
    margin-left: 10px;
    margin-right: -5px;
  }
`;

const AdminUserSettings = ({ removeUserSetting, data, addUserSetting, updateUserSetting }) => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [currentSetting, setCurrentSetting] = useState(null);

  const handleDeleteSetting = (settingId) => {
    if (
      confirm(
        "Are you sure? Before deleting this setting make sure that it's no longer in use in your application!",
      )
    ) {
      removeUserSetting({
        variables: {
          _id: settingId,
        },
      });
    }
  };
  return (
    <>
      <PageHeader>
        <h4>User Settings</h4>
        <Button
          variant="success"
          className="ml-auto"
          onClick={() => {
            setShowSettingsModal(true);
            setCurrentSetting(null);
          }}
        >
          Add Setting
        </Button>
      </PageHeader>
      {data.userSettings && data.userSettings.length > 0 ? (
        <ListGroup>
          {data.userSettings.map((setting) => (
            <Setting key={setting._id}>
              <p>{setting.key}</p>
              <div>
                <Button
                  variant="light"
                  onClick={() => {
                    setShowSettingsModal(true);
                    setCurrentSetting(setting);
                  }}
                >
                  Edit
                </Button>
                <Button variant="danger" onClick={() => handleDeleteSetting(setting._id)}>
                  Delete
                </Button>
              </div>
            </Setting>
          ))}
        </ListGroup>
      ) : (
        <BlankState
          icon={{ style: 'solid', symbol: 'cog' }}
          title="No user settings here, friend."
          subtitle="Add your first setting by clicking the button below."
          action={{
            style: 'success',
            onClick: () => {
              setShowSettingsModal(true);
              setCurrentSetting(null);
            },
            label: 'Create Your First Setting',
          }}
        />
      )}
      <AdminUserSettingsModal
        show={showSettingsModal}
        onHide={() => {
          setShowSettingsModal(false);
          setCurrentSetting(null);
        }}
        setting={currentSetting}
        addUserSetting={addUserSetting}
        updateUserSetting={updateUserSetting}
      />
    </>
  );
};

AdminUserSettings.propTypes = {
  data: PropTypes.object.isRequired,
  addUserSetting: PropTypes.func.isRequired,
  updateUserSetting: PropTypes.func.isRequired,
  removeUserSetting: PropTypes.func.isRequired,
};

export default compose(
  graphql(userSettingsQuery),
  graphql(addUserSettingMutation, {
    name: 'addUserSetting',
    options: () => ({
      refetchQueries: [{ query: userSettingsQuery }],
      onCompleted: () => {
        Bert.alert('Setting added!', 'success');
      },
    }),
  }),
  graphql(updateUserSettingMutation, {
    name: 'updateUserSetting',
    options: () => ({
      refetchQueries: [{ query: userSettingsQuery }],
      onCompleted: () => {
        Bert.alert('Setting updated!', 'success');
      },
    }),
  }),
  graphql(removeUserSettingMutation, {
    name: 'removeUserSetting',
    options: () => ({
      refetchQueries: [{ query: userSettingsQuery }],
      onCompleted: () => {
        Bert.alert('Setting removed!', 'success');
      },
    }),
  }),
)(AdminUserSettings);
