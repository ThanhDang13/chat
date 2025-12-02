import {
  SidebarHeader,
  SidebarInput,
  SidebarSeparator,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarFooter
} from "@web/components/ui/sidebar";
import { CreateGroupDialog } from "@web/components/chat/sidebar/create-group-dialog";
import { ConversationList } from "@web/components/chat/sidebar/conversation-list";
import { SearchUserList } from "@web/components/chat/sidebar/search-user-list";
import React, { useState } from "react";

export const ChatSidebarContent = () => {
  const [query, setQuery] = useState("");

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <SidebarInput
            placeholder="Find users..."
            aria-label="Find users"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <CreateGroupDialog />
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="py-0">
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="h-[85vh] overflow-y-auto">
              {query.length > 0 ? <SearchUserList keyword={query} /> : <ConversationList />}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
};
