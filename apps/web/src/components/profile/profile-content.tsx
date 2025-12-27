import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@web/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@web/components/ui/card";
import { Input } from "@web/components/ui/input";
import { Label } from "@web/components/ui/label";
import { Textarea } from "@web/components/ui/textarea";
import { Button } from "@web/components/ui/button";
import { Switch } from "@web/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@web/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@web/components/ui/avatar";
import { createGetProfileQueryOptions } from "@web/lib/tanstack/options/user/get-profile";
import { createUpdateProfileMutationOptions } from "@web/lib/tanstack/options/user/update-profile";
import { createChangePasswordMutationOptions } from "@web/lib/tanstack/options/user/change-password";
import { Separator } from "@web/components/ui/separator";
import { ModeToggle } from "@web/components/mode-toggle";
import { uploadFile } from "@web/lib/s3/upload";
import { Camera } from "lucide-react";
import { AvatarWithStatus } from "@web/components/avatar-with-status";

type ProfileType = {
  id: string;
  fullname: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  mutedAll: boolean;
  theme: string;
  avatar?: string | null;
  bio?: string | null;
};

type PasswordsType = { oldPassword: string; newPassword: string };

export default function ProfileContent() {
  const { data: profile, refetch } = useQuery(createGetProfileQueryOptions());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateProfileMutation = useMutation({
    ...createUpdateProfileMutationOptions(),
    onSuccess: () => {
      refetch();
      toast.success("Profile updated successfully!");
    },
    onError: (err) => {
      toast.error("Failed to update profile: " + err.message);
    }
  });

  const changePasswordMutation = useMutation({
    ...createChangePasswordMutationOptions(),
    onSuccess: () => {
      setPasswords({ oldPassword: "", newPassword: "" });
      toast.success("Password changed successfully!");
    },
    onError: (err) => {
      toast.error("Failed to change password: " + err.message);
    }
  });

  const [localProfile, setLocalProfile] = useState<ProfileType | undefined>(profile);
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined | null>(
    localProfile?.avatar
  );
  const [passwords, setPasswords] = useState<PasswordsType>({ oldPassword: "", newPassword: "" });

  useEffect(() => {
    if (profile) setLocalProfile(profile);
  }, [profile]);

  if (!localProfile) return <div>Loading...</div>;

  const handleProfileChange = (field: keyof ProfileType, value: unknown) => {
    setLocalProfile((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleAvatarChange = (file: File) => {
    setSelectedAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    let avatarUrl = localProfile.avatar;

    if (selectedAvatar) {
      try {
        avatarUrl = await uploadFile(selectedAvatar, "avatars");
      } catch (err) {
        toast.error("Failed to upload avatar");
        return;
      }
    }

    updateProfileMutation.mutate({ ...localProfile, avatar: avatarUrl });
  };

  return (
    <Tabs defaultValue="profile" className="space-y-6 pt-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="profile">Profile & Preferences</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>

      {/* PROFILE */}
      <TabsContent value="profile" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile & Preferences</CardTitle>
            <CardDescription>Update your basic information and account preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <AvatarWithStatus
                  name={localProfile.fullname ?? "Unnamed Chat"}
                  avatar={avatarPreview ?? localProfile.avatar}
                  isOnline={false}
                  size={60}
                />

                <input
                  type="file"
                  accept="image/*"
                  id="avatar-upload"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAvatarChange(file);
                  }}
                />

                <label
                  htmlFor="avatar-upload"
                  className="absolute -right-2 -bottom-2 cursor-pointer"
                >
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 rounded-full p-1"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera />
                  </Button>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={localProfile.fullname}
                  onChange={(e) => handleProfileChange("fullname", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={localProfile.email} disabled />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                rows={3}
                value={localProfile.bio || ""}
                onChange={(e) => handleProfileChange("bio", e.target.value)}
                placeholder="Tell something about yourself..."
              />
            </div>

            {/* Preferences */}
            <div className="space-y-4">
              {/* Mute All */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label>Mute All Conversations</Label>
                  <Switch
                    checked={localProfile.mutedAll}
                    onCheckedChange={(value) => handleProfileChange("mutedAll", value)}
                  />
                </div>
                <p className="text-muted-foreground text-sm">
                  Disable all notifications from conversations.
                </p>
                <Separator />
              </div>

              {/* Theme */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label>Theme</Label>

                  <ModeToggle
                    className="h-8 w-8"
                    value={localProfile.theme}
                    onChange={(newTheme) => handleProfileChange("theme", newTheme)}
                  />
                </div>
                <p className="text-muted-foreground text-sm">
                  Choose your preferred application theme.
                </p>
                <Separator />
              </div>
            </div>

            <Button onClick={() => handleSaveProfile()}>Save Profile</Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* SECURITY */}
      <TabsContent value="security" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your account password.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Old Password</Label>
              <Input
                type="password"
                value={passwords.oldPassword}
                onChange={(e) => setPasswords((prev) => ({ ...prev, oldPassword: e.target.value }))}
              />
            </div>
            <Button onClick={() => changePasswordMutation.mutate(passwords)}>Save Password</Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
