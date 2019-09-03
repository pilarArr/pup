import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ListGroup, Form } from 'react-bootstrap';
import ToggleSwitch from '../ToggleSwitch';
import BlankState from '../BlankState';
import unfreezeApolloCacheValue from '../../../modules/unfreezeApolloCacheValue';
import delay from '../../../modules/delay';
import Styles from './styles';

const SettingValue = ({ type, keyName, value, onChange }) => {
  switch (type) {
    case 'boolean':
      return (
        <ToggleSwitch
          id={keyName}
          toggled={value === 'true'}
          onToggle={() => {
            onChange({ key: keyName, value: `${!(value === 'true')}` });
          }}
        />
      );
    case 'number':
      return (
        <Form.Control
          type="number"
          value={value}
          onChange={(event) => onChange({ key: keyName, value: parseInt(event.target.value, 10) })}
        />
      );
    case 'string':
      return (
        <Form.Control
          value={value}
          onChange={(event) => onChange({ key: keyName, value: event.target.value })}
        />
      );
    default:
      throw new Error();
  }
};

SettingValue.propTypes = {
  type: PropTypes.string.isRequired,
  keyName: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

const UserSettings = ({ settingsFromProps, userId, updateUser, isAdmin }) => {
  const [settings, setSettings] = useState(unfreezeApolloCacheValue([...settingsFromProps]));

  const handleUpdateSetting = (setting) => {
    const settingsUpdate = [...settings];
    const settingToUpdate = settingsUpdate.find(({ _id }) => _id === setting._id);

    settingToUpdate.value = setting.value;

    if (!userId) settingToUpdate.lastUpdatedByUser = new Date().toISOString();

    setSettings(settingsUpdate);
    delay(() => {
      updateUser({
        variables: {
          user: {
            _id: userId,
            settings: settingsUpdate,
          },
        },
      });
    }, 750);
  };

  return (
    <>
      <ListGroup>
        {settings.length > 0 ? (
          settings.map(({ _id, key, label, type, value }) => (
            <Styles.Setting key={key} className="clearfix">
              <p>{label}</p>
              <div>
                <SettingValue
                  type={type}
                  keyName={key}
                  value={value}
                  onChange={(update) => handleUpdateSetting({ ...update, _id })}
                />
              </div>
            </Styles.Setting>
          ))
        ) : (
          <BlankState
            icon={{ style: 'solid', symbol: 'cogs' }}
            title={`No settings to manage ${isAdmin ? 'for this user' : 'yet'}.`}
            subtitle={`${
              isAdmin ? 'GDPR-specific settings intentionally excluded. ' : ''
            } When there are settings to manage, they'll appear here.`}
          />
        )}
      </ListGroup>
    </>
  );
};

UserSettings.defaultProps = {
  userId: null,
  isAdmin: false,
  settingsFromProps: [],
  updateUser: null,
};

UserSettings.propTypes = {
  userId: PropTypes.string,
  isAdmin: PropTypes.bool,
  settingsFromProps: PropTypes.array,
  updateUser: PropTypes.func,
};

export default UserSettings;
