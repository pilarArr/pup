import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { DropdownButton, Dropdown, Form } from 'react-bootstrap';
import { Mutation } from 'react-apollo';
import { Bert } from 'meteor/themeteorchef:bert';
import Icon from '../Icon';
import { editDocument as editDocumentQuery, documents } from '../../queries/Documents.gql';
import { updateDocument, removeDocument } from '../../mutations/Documents.gql';
import delay from '../../../modules/delay';
import { timeago } from '../../../modules/dates';

import {
  StyledDocumentEditor,
  DocumentEditorHeader,
  DocumentEditorTitle,
  DocumentEditorBody,
  DocumentEditorFooter,
} from './styles';

const DocumentEditor = ({ doc, history }) => {
  const formRef = useRef();
  const [saving, setSaving] = useState(false);
  const [mutation, setMutation] = useState('updateDocument');

  const handleUpdateDocument = (mutate) => {
    setSaving(true);
    delay(() => {
      mutate({
        variables: {
          _id: doc._id,
          title: formRef.current.title.value.trim(),
          body: formRef.current.body.value.trim(),
        },
        refetchQueries: [{ query: editDocumentQuery }],
      });
    }, 300);
  };

  const handleSetVisibility = (mutate, isPublic) => {
    setSaving(true);
    mutate({
      variables: {
        _id: doc._id,
        isPublic: isPublic === 'public',
      },
    });
  };

  const handleRemoveDocument = (mutate) => {
    if (confirm('Are you sure? This is permanent!')) {
      setMutation('removeDocument');
      mutate({
        variables: {
          _id: doc._id,
        },
      });
    }
  };

  const settingsIcon = (
    <span>
      <Icon iconStyle="solid" icon="cog" />
    </span>
  );

  return (
    <Mutation
      ignoreResults
      mutation={{ updateDocument, removeDocument }[mutation]}
      refetchQueries={mutation === 'removeDocument' ? [{ query: documents }] : []}
      awaitRefetchQueries
      onCompleted={() => {
        if (mutation === 'updateDocument') {
          // NOTE: Delay set of saving to false so UI changes aren't jarring.
          setTimeout(() => setSaving(false), 1000);
        }

        if (mutation === 'removeDocument') {
          history.push('/documents');
          Bert.alert('Document removed!', 'success');
        }
      }}
      onError={(error) => {
        Bert.alert(error.message, 'danger');
      }}
    >
      {(mutate) => (
        <>
          <DocumentEditorHeader className="clearfix">
            <p>
              {saving ? (
                <em>Saving...</em>
              ) : (
                <span>{`Last edit was ${timeago(doc.updatedAt)}`}</span>
              )}
            </p>
            <DropdownButton variant="light" title={settingsIcon} id="set-document-public">
              <Dropdown.Item as="button" onClick={() => history.push(`/documents/${doc._id}`)}>
                <Icon iconStyle="solid" icon="external-link-alt" />
                {' View Document'}
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Header>Visibility</Dropdown.Header>
              <Dropdown.Item
                className={doc.isPublic && 'active'}
                as="button"
                eventKey="1"
                onClick={() => handleSetVisibility(mutate, 'public')}
              >
                <Icon iconStyle="solid" icon="unlock" />
                {' Public'}
              </Dropdown.Item>
              <Dropdown.Item
                className={!doc.isPublic && 'active'}
                as="button"
                eventKey="2"
                onClick={() => handleSetVisibility(mutate, 'private')}
              >
                <Icon iconStyle="solid" icon="lock" />
                {' Private'}
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item as="button" onClick={() => handleRemoveDocument(mutate)}>
                <span className="text-danger">Delete Document</span>
              </Dropdown.Item>
            </DropdownButton>
          </DocumentEditorHeader>
          <StyledDocumentEditor>
            <Form ref={formRef} onSubmit={(event) => event.preventDefault()}>
              <DocumentEditorTitle>
                <Form.Label>Title</Form.Label>
                <Form.Control
                  name="title"
                  defaultValue={doc && doc.title}
                  placeholder="Document Title"
                  onChange={() => handleUpdateDocument(mutate)}
                />
              </DocumentEditorTitle>
              <DocumentEditorBody>
                <Form.Label>Body</Form.Label>
                <Form.Control
                  as="textarea"
                  name="body"
                  defaultValue={doc && doc.body}
                  placeholder="This is my document. There are many like it, but this one is mine."
                  onChange={() => handleUpdateDocument(mutate)}
                />
              </DocumentEditorBody>
            </Form>
          </StyledDocumentEditor>
          <DocumentEditorFooter className="clearfix">
            <span>
              <svg width="63" height="39" viewBox="0 0 256 158" preserveAspectRatio="xMinYMin meet">
                <path d="M238.371 157.892H18.395C8.431 157.892 0 149.462 0 139.497V18.395C0 8.431 8.431 0 18.395 0h219.21C247.569 0 256 8.431 256 18.395v121.102c0 9.964-7.665 18.395-17.629 18.395zM18.395 12.263c-3.066 0-6.132 3.066-6.132 6.132v121.102c0 3.832 3.066 6.132 6.132 6.132h219.21c3.832 0 6.132-3.066 6.132-6.132V18.395c0-3.832-3.066-6.132-6.132-6.132H18.395zM36.79 121.102V36.79h24.527l24.527 30.66 24.527-30.66h24.527v84.312h-24.527V72.814l-24.527 30.66-24.527-30.66v48.288H36.79zm154.06 0l-36.79-40.623h24.527V36.79h24.527v42.923h24.527l-36.79 41.389z" />
              </svg>
              <p>
                <a
                  href="https://www.markdownguide.org/basic-syntax"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Markdown Supported
                </a>
              </p>
            </span>
          </DocumentEditorFooter>
        </>
      )}
    </Mutation>
  );
};

DocumentEditor.defaultProps = {
  doc: null,
};

DocumentEditor.propTypes = {
  doc: PropTypes.object,
  history: PropTypes.object.isRequired,
};

export default DocumentEditor;
