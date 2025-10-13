"use client";
import { useEffect, useMemo, useState } from "react";
import { Edit, Eye, Trash } from "lucide-react";
import { deleteUser, getUsers, updateUser } from "@/services/Auth/userService";
import { PagedResult } from "@/models/dtos/commonDTO";
import { UserListItemDTO } from "@/models/dtos/userDTO";
import { toast } from "react-toastify";
import { SearchBar } from "@/components/common/searchbar";
import { ConfirmDeleteDialog } from "@/components/common/confirmDialog";
import { PaginationBar } from "@/components/common/pagination";
import { UserDialog } from "@/components/users/userDialog";

export default function UserIndex() {
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PagedResult<UserListItemDTO> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<UserListItemDTO | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editActive, setEditActive] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async (resetSkip = false) => {
    if (resetSkip) setSkip(0);
    setLoading(true);
    try {
      const params: string[] = [];
      if (query)
        params.push(
          `$filter=contains(tolower(fullName),'${query.toLowerCase()}') or contains(tolower(email),'${query.toLowerCase()}')`
        );
      if (skip) params.push(`$skip=${skip}`);
      if (pageSize) params.push(`$top=${pageSize}`);
      params.push(`$orderby=CreatedDate desc`);
      const q = params.join("&");

      const res = await getUsers(q);
      if (!res.success) throw new Error(res.message || "Error");
      setData(res.data);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to load users", {
        toastId: "users-load-error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [skip, pageSize]);

  const totalPages = useMemo(() => {
    if (!data) return 1;
    return Math.max(1, Math.ceil((data.totalCount ?? 0) / pageSize));
  }, [data, pageSize]);

  const currentPage = Math.floor(skip / pageSize) + 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">Users</h2>
          <div className="text-sm text-gray-500">Manage application users</div>
        </div>
      </div>

      <div className="bg-white shadow rounded p-4">
        {/* 🔍 Search */}
        <SearchBar
          value={query}
          loading={loading}
          placeholder="Search by name or email"
          onChange={setQuery}
          onSearch={() => load(true)}
        />

        {/* Table */}
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-gray-600">
                  <th className="p-2">#</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Role</th>
                  <th className="p-2">Active</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.items?.length ? (
                  data.items.map((u, idx) => (
                    <tr key={u.userId} className="border-t hover:bg-gray-50">
                      <td className="p-2">{idx + 1 + skip}</td>
                      <td className="p-2 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-gray-500">
                          {u.imageUrl ? (
                            <img
                              src={u.imageUrl}
                              alt={u.fullName}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <span>{u.fullName.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <span>{u.fullName}</span>
                      </td>
                      <td className="p-2">{u.email}</td>
                      <td
                        className={`p-2 font-medium ${
                          u.role.toLowerCase() === "admin"
                            ? "text-orange-600"
                            : "text-blue-600"
                        }`}
                      >
                        {u.role}
                      </td>
                      <td
                        className={`p-2 font-medium ${
                          u.active ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {u.active ? "Active" : "Inactive"}
                      </td>
                      <td className="p-2 flex gap-2">
                        {/* 👁 View */}
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => {
                            setSelected(u);
                            setEditMode(false);
                            setDialogOpen(true);
                          }}
                        >
                          <Eye className="w-5 h-5" />
                        </button>

                        {/* ✏ Edit */}
                        {u.role.toLowerCase() !== "admin" && (
                          <>
                            <button
                              className="text-green-600 hover:text-green-800"
                              onClick={() => {
                                setSelected(u);
                                setEditMode(true);
                                setEditFullName(u.fullName);
                                setEditActive(!!u.active);
                                setDialogOpen(true);
                              }}
                            >
                              <Edit className="w-5 h-5" />
                            </button>

                            {/* 🗑 Delete */}
                            <ConfirmDeleteDialog
                              name={u.fullName}
                              trigger={
                                <button className="text-red-600 hover:text-red-800">
                                  <Trash className="w-5 h-5" />
                                </button>
                              }
                              onConfirm={async () => {
                                try {
                                  const res = await deleteUser(u.userId);
                                  if (!res.success)
                                    throw new Error(
                                      res.message || "Delete failed"
                                    );
                                  toast.success(`Deleted user ${u.fullName}`);
                                  setData((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          items: prev.items.filter(
                                            (it) => it.userId !== u.userId
                                          ),
                                          totalCount:
                                            (prev.totalCount ?? 0) - 1,
                                        }
                                      : prev
                                  );
                                } catch (err: any) {
                                  toast.error(err?.message ?? "Delete failed");
                                }
                              }}
                            />
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={data?.totalCount}
          loading={loading}
          onChange={(page) => setSkip((page - 1) * pageSize)}
        />
      </div>

      {/* User Dialog */}
      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={selected}
        editMode={editMode}
        onUpdated={(updated) =>
          setData((prev) =>
            prev
              ? {
                  ...prev,
                  items: prev.items.map((it) =>
                    it.userId === updated.userId ? { ...it, ...updated } : it
                  ),
                }
              : prev
          )
        }
      />
    </div>
  );
}
