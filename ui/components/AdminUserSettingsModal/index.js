import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Col, Form } from 'react-bootstrap';
import { camelCase } from 'lodash';
import Validation from '../Validation';
import InputHint from '../InputHint';
import ToggleSwitch from '../ToggleSwitch';
import delay from '../../../modules/delay';

const initialState = {
  keyName: '',
  isGDPR: false,
  settingType: 'boolean',
  value: '',
  label: '',
};

const AdminUserSettingsModal = ({ show, onHide, setting, updateUserSetting, addUserSetting }) => {
  const [keyName, setKeyName] = useState(initialState.keyName);
  const [isGDPR, toggleGDPR] = useState(initialState.isGDPR);
  const [settingType, setSettingType] = useState(initialState.settingType);
  const [value, setValue] = useState(initialState.value);
  const [label, setLabel] = useState(initialState.label);

  useEffect(() => {
    if (setting) {
      setKeyName(setting.key);
      toggleGDPR(setting.isGDPR);
      setSettingType(setting.type);
      setValue(setting.value);
      setLabel(setting.label);
    } else {
      setKeyName(initialState.keyName);
      toggleGDPR(initialState.isGDPR);
      setSettingType(initialState.settingType);
      setValue(initialState.value);
      setLabel(initialState.label);
    }
  }, [setting]);

  const handleSubmit = (form) => {
    const mutation = setting ? updateUserSetting : addUserSetting;
    const settingToAddOrUpdate = {
      isGDPR,
      key: form.keyName.value,
      label: form.label.value.trim(),
      type: form.type.value,
      value: form.defaultValue.value,
    };

    if (setting) {
      settingToAddOrUpdate._id = setting._id;
      const confirmUpdate = confirm(
        "Are you sure? This will overwrite this setting for all users immediately. If you're changing the Key Name or Type, double-check that your UI can support this to avoid rendering errors.",
      );
      if (!confirmUpdate) return;
    }

    mutation({
      variables: {
        setting: settingToAddOrUpdate,
      },
    });

    onHide();
  };

  const handleSetKeyName = (event) => {
    event.persist();
    setKeyName(event.target.value.trim());
    delay(() => setKeyName((prevKeyName) => camelCase(prevKeyName)), 300);
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header>
        <Modal.Title>
          {setting ? 'Edit ' : 'Add a '}
          User Setting
        </Modal.Title>
      </Modal.Header>
      <Validation
        rules={{
          keyName: {
            required: true,
          },
          label: {
            required: true,
          },
        }}
        messages={{
          keyName: {
            required: "What's a good keyName for this?",
          },
          label: {
            required: "What's a good label for this?",
          },
        }}
        submitHandler={(form) => {
          handleSubmit(form);
        }}
      >
        <Form onSubmit={(event) => event.preventDefault()}>
          <Modal.Body>
            <Form.Row>
              <Form.Group as={Col} xs={12} md={6}>
                <Form.Label>Key Name</Form.Label>
                <Form.Control
                  name="keyName"
                  value={keyName}
                  onChange={handleSetKeyName}
                  placeholder="canWeSendYouMarketingEmails"
                />
              </Form.Group>
              <Form.Group as={Col} xs={12} md={6}>
                <Form.Label>Is this a GDPR setting?</Form.Label>
                <ToggleSwitch toggled={isGDPR} onToggle={toggleGDPR} />
              </Form.Group>
            </Form.Row>
            <Form.Group>
              <Form.Label>Label</Form.Label>
              <Form.Control
                name="label"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="Can we send you marketing emails?"
              />
              <InputHint>This is what users will see in their settings panel.</InputHint>
            </Form.Group>
            <Form.Row>
              <Col xs={12} md={6}>
                <Form.Label>Type</Form.Label>
                <Form.Control
                  as="select"
                  name="type"
                  value={settingType}
                  onChange={(event) => setSettingType(event.target.value)}
                >
                  <option value="boolean">Boolean (true/false)</option>
                  <option value="number">Number</option>
                  <option value="string">String</option>
                </Form.Control>
              </Col>
              <Col xs={12} md={6}>
                <Form.Label>Default Value</Form.Label>
                {settingType === 'boolean' && (
                  <Form.Control
                    as="select"
                    name="defaultValue"
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                  >
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </Form.Control>
                )}
                {settingType === 'number' && (
                  <Form.Control
                    type="number"
                    name="defaultValue"
                    value={value}
                    onChange={(event) => setValue(parseInt(event.target.value, 10))}
                    placeholder={5}
                  />
                )}
                {settingType === 'string' && (
                  <Form.Control
                    name="defaultValue"
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Squirrel?!"
                  />
                )}
              </Col>
            </Form.Row>
          </Modal.Body>
          <Modal.Footer>
            <Button type="submit" variant="success">
              {setting ? 'Save' : 'Add'}
              {' Setting'}
            </Button>
          </Modal.Footer>
        </Form>
      </Validation>
    </Modal>
  );
};

AdminUserSettingsModal.defaultProps = {
  setting: null,
};

AdminUserSettingsModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  setting: PropTypes.object,
  addUserSetting: PropTypes.func.isRequired,
  updateUserSetting: PropTypes.func.isRequired,
};

export default AdminUserSettingsModal;
