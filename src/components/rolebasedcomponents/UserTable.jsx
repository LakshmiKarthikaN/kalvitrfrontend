import React from "react";
import { Eye, EyeOff, UserX } from "lucide-react";

const UserTable = ({ users, toggleUserAccess, removeUser, filterStatus }) => {
  const filteredUsers = users.filter((user) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "active") return user.status === "Active";
    if (filterStatus === "inactive") return user.status === "Inactive";
    return true;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h3 className="text-lg font-semibold text-gray-900">
          Users ({filteredUsers.length})
        </h3>
      </div>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left px-6 py-4">User</th>
            <th className="text-left px-6 py-4">Role</th>
            <th className="text-left px-6 py-4">Status</th>
            <th className="text-left px-6 py-4">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </td>
              <td className="px-6 py-4">{user.role}</td>
              <td className="px-6 py-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs ${
                    user.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {user.status}
                </span>
              </td>
              <td className="px-6 py-4 flex gap-2">
                <button
                  onClick={() => toggleUserAccess(user.id)}
                  className="p-2 rounded bg-gray-100 hover:bg-gray-200"
                >
                  {user.access ? <Eye /> : <EyeOff />}
                </button>
                <button
                  onClick={() => removeUser(user.id)}
                  className="p-2 rounded bg-red-100 hover:bg-red-200"
                >
                  <UserX />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
