import React from 'react';

const MyDetails = ({ userDetails, handleInputChange, handleSaveChanges, handleDeleteAccount }) => {
  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--color-primary)] mb-4">MY DETAILS</h2>
      <form className="space-y-4">
        <div>
          <label className="block text-gray-700 font-bold mb-2">Name *</label>
          <input
            type="text"
            name="name"
            value={userDetails.name}
            onChange={handleInputChange}
            className="w-full border rounded px-4 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-bold mb-2">Email *</label>
          <input
            type="email"
            name="email"
            value={userDetails.email}
            onChange={handleInputChange}
            className="w-full border rounded px-4 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-bold mb-2">Phone *</label>
          <input
            type="tel"
            name="phone"
            value={userDetails.phone}
            onChange={handleInputChange}
            className="w-full border rounded px-4 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-bold mb-2">Date of Birth</label>
          <input
            type="date"
            name="dob"
            value={userDetails.dob}
            onChange={handleInputChange}
            className="w-full border rounded px-4 py-2"
          />
        </div>
        <button
          type="button"
          onClick={handleSaveChanges}
          className="bg-[var(--color-primary)] text-white px-6 py-2 rounded hover:bg-[var(--color-primaryHover)]"
        >
          Save Changes
        </button>
      </form>
      <hr className="my-6" />
      <button
        onClick={handleDeleteAccount}
        className="text-red-500 hover:text-red-700 text-sm"
      >
        Delete Account
      </button>
    </div>
  );
};

export default MyDetails;