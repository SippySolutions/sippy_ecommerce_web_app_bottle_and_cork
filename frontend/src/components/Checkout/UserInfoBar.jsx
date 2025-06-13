import React from 'react';

const UserInfoBar = ({ user, logout, colorAccent, colorBodyText }) => (
  <div className="mb-4 font-bold" style={{ color: colorAccent }}>
    CHECKOUT
    <span className="ml-2" style={{ color: colorBodyText }}>
      {user
        ? <>Logged in as {user.name || user.email} / {user.email}</>
        : <>Not logged in</>
      }
    </span>
    {user && (
      <button
        className="ml-2 underline"
        style={{ color: colorAccent }}
        onClick={logout}
      >
        Not you? Logout
      </button>
    )}
  </div>
);

export default UserInfoBar;