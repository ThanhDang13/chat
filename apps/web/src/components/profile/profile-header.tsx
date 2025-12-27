import { Card, CardContent } from "@web/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@web/components/ui/avatar";
import { Button } from "@web/components/ui/button";
import { Badge } from "@web/components/ui/badge";
import { Camera, Calendar, Mail, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { createGetProfileQueryOptions } from "@web/lib/tanstack/options/user/get-profile";
import { AvatarWithStatus } from "@web/components/avatar-with-status";

export default function ProfileHeader() {
  const { data: profile, isLoading } = useQuery(createGetProfileQueryOptions());

  if (isLoading || !profile) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
          <div className="relative">
            <AvatarWithStatus
              name={profile.fullname ?? "Unnamed Chat"}
              avatar={profile.avatar}
              isOnline={false}
              size={80}
            />
            {/* <Button
              size="icon"
              variant="outline"
              className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full"
            >
              <Camera />
            </Button> */}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <h1 className="text-2xl font-bold">{profile.fullname}</h1>
              {/* <Badge variant="secondary">Pro Member</Badge> */}
            </div>
            <p className="text-muted-foreground">{profile.bio ?? "No bio available"}</p>
            <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Mail className="size-4" />
                {profile.email}
              </div>
              {/* <div className="flex items-center gap-1">
                <MapPin className="size-4" />
                Unknown Location
              </div> */}
              <div className="flex items-center gap-1">
                <Calendar className="size-4" />
                Joined {new Date(profile.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
