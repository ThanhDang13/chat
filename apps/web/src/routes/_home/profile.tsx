import { createFileRoute } from "@tanstack/react-router";
import ProfileContent from "@web/components/profile/profile-content";
import ProfileHeader from "@web/components/profile/profile-header";
import { ScrollArea } from "@web/components/ui/scroll-area";

export const Route = createFileRoute("/_home/profile")({
  component: ProfilePage
});

function ProfilePage() {
  return (
    <div className="mx-auto flex h-screen w-full max-w-4xl flex-col py-10">
      <ScrollArea className="flex-1 overflow-y-auto px-4">
        <ProfileHeader />
        <ProfileContent />
      </ScrollArea>
    </div>
  );
}
