import React, { useRef, useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { isNil } from 'lodash';
import PropTypes from 'prop-types';

let validate;

const Validation = ({ children, rules, messages }) => {
  const [clientModulesReady, setClientModulesReady] = useState(false);
  const formRef = useRef(null);
  const validateInstance = useRef(null);

  useEffect(() => {
    const loadClientModules = async () => {
      if (Meteor.isClient) {
        const validateModule = await import('../../../modules/client/validate');
        validate = validateModule.default;
        setClientModulesReady(true);
      }
    };

    const loadValidation = () => {
      if (!isNil(validateInstance.current)) {
        validateInstance.current.destroy();
      }
      validateInstance.current = validate(formRef.current, { rules, messages });
    };

    if (!clientModulesReady) {
      loadClientModules();
    } else {
      loadValidation();
    }
    return () => {
      validateInstance.current.destroy();
    };
  }, [clientModulesReady, messages, rules]);

  const isChildAllowed =
    React.Children.only(children) &&
    (children.type === 'form' || children.type.displayName === 'form');

  if (!clientModulesReady) {
    console.warn('[Pup] The client modules are not ready.');
    return null;
  }
  if (!isChildAllowed) {
    console.warn(
      '[Pup] A single <form></form> element is the only allowed child of the Validation component.',
    );
    return null;
  }

  return (
    <>
      {React.cloneElement(children, {
        ref: formRef,
      })}
    </>
  );
};

Validation.propTypes = {
  children: PropTypes.node.isRequired,
  rules: PropTypes.object.isRequired,
  messages: PropTypes.object.isRequired,
};

export default Validation;
