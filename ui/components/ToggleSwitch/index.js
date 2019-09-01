import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../Icon';
import Styles from './styles';

const ToggleSwitch = ({ toggled, onToggle, onLabel, offLabel }) => {
  return (
    <Styles.ToggleSwitch toggled={toggled} onClick={() => onToggle(!toggled)}>
      <div className="handle">
        <span className="handle-label">
          {toggled
            ? onLabel || <Icon iconStyle="solid" icon="check" />
            : offLabel || <Icon iconStyle="solid" icon="times" />}
        </span>
      </div>
    </Styles.ToggleSwitch>
  );
};

ToggleSwitch.propTypes = {
  toggled: PropTypes.bool,
  onLabel: PropTypes.string,
  offLabel: PropTypes.string,
  onToggle: PropTypes.func,
};

ToggleSwitch.defaultProps = {
  toggled: false,
  onLabel: '',
  offLabel: '',
  onToggle: () => {},
};

export default ToggleSwitch;
