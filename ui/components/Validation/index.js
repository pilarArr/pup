import React, { useRef, useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { isNil } from 'lodash';
import PropTypes from 'prop-types';

import useCallbackRef from '../../hooks/useCallbackRef';

let validate;

const Validation = ({ children, rules, messages }) => {
  const [clientModulesReady, setClientModulesReady] = useState(false);
  const [form, formRef] = useCallbackRef();
  const validateInstance = useRef(null);

  const isChildAllowed =
    React.Children.only(children) &&
    (children.type === 'form' || children.type.displayName === 'Form');

  useEffect(() => {
    const loadClientModules = async () => {
      if (Meteor.isClient) {
        const validateModule = await import('../../../modules/client/validate');
        validate = validateModule.default;
        setClientModulesReady(true);
      }
    };
    if (!clientModulesReady) {
      loadClientModules();
    }
  }, [clientModulesReady]);

  useEffect(() => {
    const loadValidation = () => {
      if (!isNil(validateInstance.current)) {
        validateInstance.current.destroy();
      }
      validateInstance.current = validate(form, { rules, messages });
    };
    if (clientModulesReady) {
      loadValidation();
    }
    return () => {
      if (!isNil(validateInstance.current)) {
        validateInstance.current.destroy();
      }
    };
  }, [clientModulesReady, form, messages, rules]);

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
