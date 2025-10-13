"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Mail, User, Shield, ImageIcon, Loader2, Camera } from "lucide-react";
import { toast } from "react-toastify";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getProfile, updateProfile } from "@/services/Auth/userService";
import { UserInfoDTO, UpdateUserRequestDTO } from "@/models/dtos/userDTO";
import { uploadToImageKit } from "@/services/Common/fileService";

export default function ProfileIndex() {
  const [user, setUser] = useState<UserInfoDTO | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<UpdateUserRequestDTO>({
    fullName: "",
    email: "",
    imageUrl: "",
  });
  const [newImage, setNewImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await getProfile();
        if (!res.success)
          throw new Error(res.message || "Failed to fetch profile");

        setUser(res.data);
        setForm({
          fullName: res.data.fullName,
          email: res.data.email,
          imageUrl: res.data.imageUrl || "",
        });
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Unable to fetch profile";
        toast.error(msg, { toastId: "profile-error" });
      }
    };
    fetchUserProfile();
  }, []);

  const handleEditToggle = () => setIsEditing((prev) => !prev);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setLoading(true);
    let finalImageUrl = form.imageUrl;
    try {
      if (newImage) {
        try {
          finalImageUrl = await uploadToImageKit(newImage);
        } catch (uploadErr) {
          throw new Error(
            "Image upload failed. Please try again or use a different image."
          );
        }
      }

      const updatedData = { ...form, imageUrl: finalImageUrl };

      const res = await updateProfile(updatedData);
      if (!res.success) throw new Error(res.message || "Update failed");

      toast.success("Profile updated successfully 🎉");
      setUser({ ...user!, ...updatedData });
      setIsEditing(false);
      setNewImage(null);
      setPreviewUrl(null);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update profile";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-6">
      <Card className="w-full max-w-2xl shadow-xl border border-gray-100 rounded-2xl bg-white/90 backdrop-blur">
        <CardHeader className="flex flex-col items-center text-center">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md mb-3 group">
            <Image
              src={
                previewUrl ||
                form.imageUrl ||
                "https://ik.imagekit.io/i0aiv29ol/Avt%202%20(1).png?updatedAt=1760118073397"
              }
              alt={form.fullName || "Avatar"}
              width={128}
              height={128}
              className="object-cover w-full h-full"
            />

            {isEditing && (
              <>
                <label
                  htmlFor="avatarUpload"
                  className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer opacity-0 group-hover:opacity-100 transition"
                >
                  <Camera className="w-6 h-6 text-white" />
                  <input
                    type="file"
                    id="avatarUpload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </label>
              </>
            )}
          </div>

          <CardTitle className="text-2xl font-semibold text-gray-800">
            {form.fullName || "User"}
          </CardTitle>
          <p className="text-gray-500 text-sm mt-1">{user?.role || "Role"}</p>
        </CardHeader>

        <CardContent className="space-y-4 mt-4 px-8">
          {/* Full Name */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <User className="w-5 h-5 text-gray-600" />
            <div className="w-full">
              <Label htmlFor="fullName" className="text-sm text-gray-500">
                Full Name
              </Label>
              {isEditing ? (
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  disabled={loading}
                />
              ) : (
                <p className="text-gray-800 font-medium">{user?.fullName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <Mail className="w-5 h-5 text-gray-600" />
            <div className="w-full">
              <Label htmlFor="email" className="text-sm text-gray-500">
                Email
              </Label>
              {isEditing ? (
                <Input
                  id="email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading}
                />
              ) : (
                <p className="text-gray-800 font-medium">{user?.email}</p>
              )}
            </div>
          </div>

          {/* Role */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <Shield className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="text-gray-800 font-medium">{user?.role}</p>
            </div>
          </div>
        </CardContent>

        <div className="flex justify-center pb-6 gap-3">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Save Changes
              </Button>
              <Button
                onClick={handleEditToggle}
                variant="outline"
                className="rounded-full border-gray-300"
                disabled={loading}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              onClick={handleEditToggle}
              className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold"
            >
              Edit Profile
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
