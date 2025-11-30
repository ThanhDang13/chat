import React, { useEffect, useRef } from "react";
import { Plus, Loader2, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@web/components/ui/dialog";
import { Input } from "@web/components/ui/input";
import { Button } from "@web/components/ui/button";
import { Label } from "@web/components/ui/label";
import { ScrollArea } from "@web/components/ui/scroll-area";
import { Checkbox } from "@web/components/ui/checkbox";
import { createInfiniteSearchUsersQueryOptions } from "@web/lib/tanstack/options/search/search";
import axiosInstance from "@web/lib/axios/instance";
import { SearchItemAvatar } from "@web/components/chat/sidebar/search-item-avatar";
import { useVirtualizer } from "@tanstack/react-virtual";

const createGroupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  participantIds: z.array(z.string().uuid()).min(1, "At least one participant required")
});

type CreateGroupForm = z.infer<typeof createGroupSchema>;

interface CreateGroupDialogProps {
  triggerClassName?: string;
}

export const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({ triggerClassName }) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [keyword, setKeyword] = React.useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<CreateGroupForm>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      participantIds: []
    }
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isFetching, isError } =
    useInfiniteQuery(createInfiniteSearchUsersQueryOptions({ keyword, limit: 5 }));

  const users = data?.pages.flatMap((page) => page.data ?? []) ?? [];

  const virtualizer = useVirtualizer({
    count: users.length,
    estimateSize: () => 56,
    getScrollElement: () => scrollAreaRef.current,
    overscan: 0
  });

  const virtualItems = virtualizer.getVirtualItems();

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;

    if (lastItem.index >= users.length - 1) {
      fetchNextPage();
    }
  }, [virtualItems, hasNextPage, isFetchingNextPage, fetchNextPage, users.length]);

  const createGroupMutation = useMutation({
    mutationKey: ["create", "group"],
    mutationFn: async (values: CreateGroupForm) => {
      const res = await axiosInstance.post("/conversations/group", values);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setOpen(false);
      form.reset();
      setKeyword("");
    }
  });

  const onSubmit = form.handleSubmit((values) => {
    createGroupMutation.mutate(values);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={`hover:bg-accent text-muted-foreground flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${triggerClassName ?? ""}`}
        >
          <Plus className="h-5 w-5" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>Add members and set a group name for your new chat.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Group Name</Label>
            <Input id="name" {...form.register("name")} placeholder="Enter group name..." />
            {form.formState.errors.name && (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          {/* Search field */}
          <div>
            <Label htmlFor="search">Search Members</Label>
            <div className="relative mt-1">
              <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
              <Input
                id="search"
                placeholder="Search users..."
                className="pl-8"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              {isFetching && (
                <Loader2 className="text-muted-foreground absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 animate-spin" />
              )}
            </div>
          </div>

          {/* User list */}
          <div>
            <Label>Members</Label>
            <ScrollArea className=""></ScrollArea>
            <ScrollArea
              ref={scrollAreaRef}
              className="no-scrollbar mt-2 h-48 gap-1 overflow-y-auto rounded-md border p-2"
              onScroll={(e) => {
                const target = e.currentTarget;
                if (
                  hasNextPage &&
                  !isFetchingNextPage &&
                  target.scrollTop + target.clientHeight >= target.scrollHeight - 100
                ) {
                  fetchNextPage();
                }
              }}
            >
              {isLoading ? (
                <p className="text-muted-foreground p-2 text-center text-sm">Loading users...</p>
              ) : isError ? (
                <p className="text-destructive p-2 text-center text-sm">Failed to load users</p>
              ) : users.length === 0 ? (
                <p className="text-muted-foreground p-2 text-center text-sm">No users found</p>
              ) : (
                <div className="relative" style={{ height: `${virtualizer.getTotalSize()}px` }}>
                  {virtualItems.map((vItem) => {
                    const user = users[vItem.index];
                    return (
                      <div
                        key={vItem.key}
                        style={{
                          transform: `translateY(${vItem.start}px)`,
                          height: `${vItem.size}px`,
                          width: "100%",
                          position: "absolute",
                          top: 0,
                          left: 0
                        }}
                      >
                        <Label
                          key={user.id}
                          className="hover:bg-accent flex cursor-pointer items-center space-x-2 rounded-md p-1"
                        >
                          <Checkbox
                            checked={form.watch("participantIds").includes(user.id)}
                            onCheckedChange={(checked) => {
                              const current = form.getValues("participantIds");
                              form.setValue(
                                "participantIds",
                                checked
                                  ? [...current, user.id]
                                  : current.filter((id) => id !== user.id)
                              );
                            }}
                          />
                          <div className="flex items-center gap-2">
                            <SearchItemAvatar user={{ avatar: user.avatar, name: user.fullname }} />
                            <span className="truncate">{user.fullname}</span>
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              )}

              {isFetchingNextPage && (
                <div className="flex justify-center p-2">
                  <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
                </div>
              )}
            </ScrollArea>
            {form.formState.errors.participantIds && (
              <p className="mt-1 text-sm text-red-500">
                {form.formState.errors.participantIds.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={createGroupMutation.isPending} className="w-full">
              {createGroupMutation.isPending ? "Creating..." : "Create Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
