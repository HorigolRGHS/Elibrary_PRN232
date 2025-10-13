"use client";
import { FC, useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera } from "lucide-react";
import { toast } from "react-toastify";
import { uploadToImageKit } from "@/services/Common/fileService";
import { updateUser } from "@/services/Auth/userService";
import { UserDialogProps } from "@/models/interfaces/user";

export const UserDialog: FC<UserDialogProps> = ({
  open,
  onOpenChange,
  user,
  editMode,
  onUpdated,
}) => {
  const [editFullName, setEditFullName] = useState(user?.fullName ?? "");
  const [editActive, setEditActive] = useState(!!user?.active);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setEditFullName(user.fullName);
      setEditActive(!!user.active);
      setAvatarPreview(user.imageUrl ?? null);
      setAvatarFile(null);
    }
  }, [user, editMode]);

  if (!user) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      let imageUrl: string | undefined;
      if (avatarFile) {
        imageUrl = await uploadToImageKit(avatarFile);
      }

      const payload: any = {
        userId: user.userId,
        fullName: editFullName,
        active: editActive,
      };
      if (imageUrl) payload.imageUrl = imageUrl;

      const res = await updateUser(payload);
      if (!res.success) throw new Error(res.message || "Update failed");

      toast.success("User updated");

      onUpdated({
        userId: user.userId,
        fullName: editFullName,
        active: editActive,
        imageUrl: imageUrl ?? user.imageUrl,
      });

      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message ?? "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] rounded-xl">
        <DialogHeader>
          <DialogTitle>{editMode ? "Edit user" : "User details"}</DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border shadow-sm mb-2 group">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="preview"
                  className="object-cover w-full h-full"
                />
              ) : user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt="avatar"
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              {editMode && (
                <>
                  <label
                    htmlFor={`avatarUpload-${user.userId}`}
                    className={`absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer opacity-0 group-hover:opacity-100 transition ${
                      saving ? "pointer-events-none opacity-30" : ""
                    }`}
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </label>
                  <input
                    id={`avatarUpload-${user.userId}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={saving}
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setAvatarFile(f);
                      setAvatarPreview(f ? URL.createObjectURL(f) : null);
                    }}
                  />
                </>
              )}
            </div>
          </div>

          {/* Full name */}
          <div>
            <div className="text-sm text-gray-600">Full name</div>
            {editMode ? (
              <input
                className="w-full border rounded px-2 py-1 disabled:opacity-50"
                value={editFullName}
                disabled={saving}
                onChange={(e) => setEditFullName(e.target.value)}
              />
            ) : (
              <div className="font-medium">{user.fullName}</div>
            )}
          </div>

          {/* Active */}
          <div>
            <div className="text-sm text-gray-600">Active</div>
            {editMode ? (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editActive}
                  disabled={saving}
                  onChange={(e) => setEditActive(e.target.checked)}
                />
                <span
                  className={`font-medium ${
                    editActive ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {editActive ? "Active" : "Inactive"}
                </span>
              </label>
            ) : (
              <div
                className={`font-medium ${
                  user.active ? "text-green-600" : "text-red-500"
                }`}
              >
                {user.active ? "Active" : "Inactive"}
              </div>
            )}
          </div>

          <div>
            <div className="text-sm text-gray-600">Created At</div>
            <div>{new Date(user.createdDate).toLocaleString()}</div>
          </div>
        </div>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <DialogClose asChild>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={saving}
            >
              Close
            </button>
          </DialogClose>
          {editMode && (
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
