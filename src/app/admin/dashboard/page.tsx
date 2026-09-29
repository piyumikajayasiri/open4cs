import React from "react";
import Link from "next/link";

const AdminDashboard = () => {
  return (
    <div>
      <Link
        href="/admin/gemstones"
        className="block rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md"
      >
        <h2 className="text-xl font-semibold text-gray-900">Gemstones</h2>

        <p className="mt-2 text-sm text-gray-600">
          Manage gemstone varieties used by the Open 4Cs system.
        </p>
      </Link>
    </div>
  );
};

export default AdminDashboard;
