import { CreateGroupDialog } from "@web/components/conversation-panel/create-group-dialog";
import { ConversationList } from "@web/components/conversation-panel/conversation-list";
import { SearchUserList } from "@web/components/conversation-panel/search-user-list";
import { Card, CardContent, CardHeader } from "@web/components/ui/card";
import { Input } from "@web/components/ui/input";
import { Separator } from "@web/components/ui/separator";
import { useState } from "react";

export default function ConversationPanel() {
  const [query, setQuery] = useState("");

  const isSearching = query.length > 0;

  return (
    <Card className="flex h-full w-full flex-col gap-0 rounded-none border-0 pb-0">
      {/* Sticky search area */}
      <CardHeader className="bg-background sticky top-0 z-10 pb-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search..."
            aria-label="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <CreateGroupDialog />
        </div>
        {/* Optional text hint below input
        {!isSearching && <p className="text-muted-foreground mt-1 text-xs">Recent conversations</p>} */}
        <Separator className="mt-3" />
      </CardHeader>

      {/* Scrollable content */}
      <CardContent className="flex-1 overflow-y-auto p-0">
        {isSearching ? <SearchUserList keyword={query} /> : <ConversationList />}
      </CardContent>
    </Card>
  );
}
