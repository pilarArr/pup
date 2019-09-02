import React from 'react';
import PropTypes from 'prop-types';
import { Navbar, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Meteor } from 'meteor/meteor';
import PublicNavigation from '../PublicNavigation';
import AuthenticatedNavigation from '../AuthenticatedNavigation';

const Navigation = ({ authenticated, name, userId }) => (
  <Navbar collapseOnSelect bg="light" expand="lg" className="mb-3">
    <Container>
      <LinkContainer to="/">
        <Navbar.Brand>{Meteor.settings.public.productName}</Navbar.Brand>
      </LinkContainer>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav" className={!authenticated && 'justify-content-end'}>
        {authenticated ? (
          <AuthenticatedNavigation name={name} userId={userId} />
        ) : (
          <PublicNavigation />
        )}
      </Navbar.Collapse>
    </Container>
  </Navbar>
);

Navigation.defaultProps = {
  name: '',
  userId: '',
};

Navigation.propTypes = {
  userId: PropTypes.string,
  authenticated: PropTypes.bool.isRequired,
  name: PropTypes.string,
};

export default Navigation;
