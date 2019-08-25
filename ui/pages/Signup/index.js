import React from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { graphql } from 'react-apollo';
import { Accounts } from 'meteor/accounts-base';
import { Bert } from 'meteor/themeteorchef:bert';
import { sendVerificationEmail as sendVerificationEmailMutation } from '../../mutations/Users.gql';
import Validation from '../../components/Validation';
import PageHeader from '../../components/PageHeader';
import InputHint from '../../components/InputHint';
import OAuthLoginButtons from '../../components/OAuthLoginButtons';
import AccountPageFooter from '../../components/AccountPageFooter';
import StyledSignup from './styles';

const handleSubmit = (form, history, sendVerificationEmail) => {
  Accounts.createUser(
    {
      email: form.emailAddress.value,
      password: form.password.value,
      profile: {
        name: {
          first: form.firstName.value,
          last: form.lastName.value,
        },
      },
    },
    (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        sendVerificationEmail();
        Bert.alert('Welcome!', 'success');
        history.push('/documents');
      }
    },
  );
};

const validationRules = {
  rules: {
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
    password: {
      required: true,
      minlength: 6,
    },
  },
  messages: {
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
    password: {
      required: 'Need a password here.',
      minlength: 'Please use at least six characters.',
    },
  },
};

const Signup = ({ history, sendVerificationEmail }) => (
  <StyledSignup>
    <Row>
      <Col xs={12}>
        <PageHeader>
          <h4>Sign Up</h4>
        </PageHeader>
        <Row>
          <Col xs={12}>
            <OAuthLoginButtons
              emailMessage={{
                offset: 97,
                text: 'Sign Up with an Email Address',
              }}
            />
          </Col>
        </Row>
        <Validation
          {...validationRules}
          submitHandler={(form) => handleSubmit(form, history, sendVerificationEmail)}
        >
          <Form onSubmit={(event) => event.preventDefault()}>
            <Row>
              <Col xs={6}>
                <Form.Group>
                  <Form.Label>First Name</Form.Label>
                  <Form.Control name="firstName" placeholder="First Name" />
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group>
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control name="lastName" placeholder="Last Name" />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group>
              <Form.Label>Email Address</Form.Label>
              <Form.Control type="email" name="emailAddress" placeholder="Email Address" />
            </Form.Group>
            <Form.Group>
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" name="password" placeholder="Password" />
              <InputHint>Use at least six characters.</InputHint>
            </Form.Group>
            <Button type="submit" variant="success" block>
              Sign Up
            </Button>
            <AccountPageFooter>
              <p>
                Already have an account?
                <Link to="/login">Log In</Link>
                {'.'}
              </p>
            </AccountPageFooter>
          </Form>
        </Validation>
      </Col>
    </Row>
  </StyledSignup>
);

Signup.propTypes = {
  history: PropTypes.object.isRequired,
  sendVerificationEmail: PropTypes.func.isRequired,
};

export default graphql(sendVerificationEmailMutation, {
  name: 'sendVerificationEmail',
})(Signup);
