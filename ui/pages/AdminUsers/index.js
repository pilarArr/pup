import React, { useState } from 'react';
import SearchInput from '../../components/SearchInput';
import PageHeader from '../../components/PageHeader';
import AdminUsersList from '../../components/AdminUsersList';

const AdminUsers = () => {
  const [currentPage, setPage] = useState(1);
  const [search, setSearch] = useState(null);

  return (
    <>
      <PageHeader>
        <h4>Users</h4>
        <div className="ml-auto">
          <SearchInput
            placeholder="Search users..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </PageHeader>
      <AdminUsersList
        search={search}
        currentPage={currentPage}
        perPage={10}
        onChangePage={(newPage) => setPage(newPage)}
      />
    </>
  );
};

AdminUsers.propTypes = {
  // prop: PropTypes.string.isRequired,
};

export default AdminUsers;
