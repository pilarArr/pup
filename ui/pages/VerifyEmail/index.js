import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { Alert } from 'react-bootstrap';
import { Accounts } from 'meteor/accounts-base';
import { Bert } from 'meteor/themeteorchef:bert';
import { sendWelcomeEmail as sendWelcomeEmailMutation } from '../../mutations/Users.gql';

const VerifyEmail = ({ match, history, sendWelcomeEmail }) => {
  const [error, setError] = useState(null);

  useEffect(() => {
    Accounts.verifyEmail(match.params.token, (verifyEmailError) => {
      if (verifyEmailError) {
        Bert.alert(verifyEmailError.reason, 'danger');
        setError(`${verifyEmailError.reason}. Please try again.`);
      } else {
        setTimeout(() => {
          Bert.alert('All set, thanks!', 'success');
          sendWelcomeEmail();
          history.push('/documents');
        }, 1500);
      }
    });
  }, [match.params.token, error, sendWelcomeEmail, history]);

  return (
    <div className="VerifyEmail">
      <Alert variant={!error ? 'info' : 'danger'}>{!error ? 'Verifying...' : error}</Alert>
    </div>
  );
};

VerifyEmail.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  sendWelcomeEmail: PropTypes.func.isRequired,
};

export default graphql(sendWelcomeEmailMutation, {
  name: 'sendWelcomeEmail',
})(VerifyEmail);
