import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import { compose, graphql } from 'react-apollo';
import UserSettings from '../UserSettings';
import { userSettings as userSettingsQuery } from '../../queries/Users.gql';
import { updateUser as updateUserMutation } from '../../mutations/Users.gql';
import unfreezeApolloCacheValue from '../../../modules/unfreezeApolloCacheValue';
import Styles from './styles';

const GDPRConsentModal = ({ data, updateUser }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (data && data.user && data.user.settings) {
      let gdprComplete = true;
      const gdprSettings = data.user.settings.filter((setting) => setting.isGDPR === true);
      gdprSettings.forEach(({ lastUpdatedByUser }) => {
        if (!lastUpdatedByUser) gdprComplete = false;
      });
      setShow(!gdprComplete);
    }
  }, [data]);

  const handleSaveSettings = () => {
    if (data && data.user && data.user.settings) {
      updateUser({
        variables: {
          user: {
            settings: unfreezeApolloCacheValue(data && data.user && data.user.settings).map(
              (setting) => {
                const settingToUpdate = setting;
                settingToUpdate.lastUpdatedByUser = new Date().toISOString();
                return settingToUpdate;
              },
            ),
          },
        },
        refetchQueries: [{ query: userSettingsQuery }],
      });
    }
  };

  return (
    <Styles.GDPRConsentModal backdrop="static" show={show} onHide={() => setShow(false)}>
      <Modal.Header>
        <Modal.Title>GDPR Consent</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          {"In cooperation with the European Union's (EU) "}
          <a href="https://www.eugdpr.org/" target="_blank" rel="noopener noreferrer">
            {'General Data Protection Regulation'}
          </a>
          {
            ' (GDPR), we need to obtain your consent for how we make use of your data. Please review each of the settings below to customize your experience.'
          }
        </p>
        <UserSettings settingsFromProps={data.user && data.user.settings} updateUser={updateUser} />
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="success"
          onClick={() => {
            handleSaveSettings();
            setShow(false);
          }}
        >
          Save Settings
        </Button>
      </Modal.Footer>
    </Styles.GDPRConsentModal>
  );
};

GDPRConsentModal.propTypes = {
  data: PropTypes.object.isRequired,
  updateUser: PropTypes.func.isRequired,
};

export default compose(
  graphql(userSettingsQuery),
  graphql(updateUserMutation, {
    name: 'updateUser',
  }),
)(GDPRConsentModal);
