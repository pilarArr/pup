import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { Meteor } from 'meteor/meteor';
import SEO from '../../components/SEO';
import BlankState from '../../components/BlankState';
import Comments from '../../components/Comments';
import { document as documentQuery } from '../../queries/Documents.gql';
import parseMarkdown from '../../../modules/parseMarkdown';

import { StyledViewDocument, DocumentBody } from './styles';

const ViewDocument = ({ data }) => {
  const [sortBy, setSortBy] = useState('newestFirst');

  useEffect(() => {
    if (Meteor.isClient && Meteor.userId()) data.refetch();
  }, [data]);

  const handleChangeCommentSort = (event) => {
    event.persist();
    setSortBy(event.target.value);
    data.refetch({ sortBy: event.target.value });
  };

  if (!data.loading && data.document) {
    return (
      <>
        <StyledViewDocument>
          <SEO
            title={data.document && data.document.title}
            description={data.document && data.document.body}
            url={`documents/${data.document && data.document._id}`}
            contentType="article"
            published={data.document && data.document.createdAt}
            updated={data.document && data.document.updatedAt}
            twitter="clvrbgl"
          />
          <>
            <h1>{data.document && data.document.title}</h1>
            <DocumentBody
              dangerouslySetInnerHTML={{
                __html: parseMarkdown(data.document && data.document.body),
              }}
            />
          </>
        </StyledViewDocument>
        <Comments
          documentId={data.document && data.document._id}
          comments={data.document && data.document.comments}
          sortBy={sortBy}
          onChangeSortBy={handleChangeCommentSort}
        />
      </>
    );
  }

  if (!data.loading && !data.document) {
    return (
      <BlankState
        icon={{ style: 'solid', symbol: 'file-alt' }}
        title="No document here, friend!"
        subtitle="Make sure to double check the URL! If it's correct, this is probably a private document."
      />
    );
  }

  return null;
};

ViewDocument.propTypes = {
  data: PropTypes.object.isRequired,
};

export default graphql(documentQuery, {
  options: ({ match }) => ({
    variables: {
      _id: match.params._id,
      sortBy: 'newestFirst',
    },
  }),
})(ViewDocument);
