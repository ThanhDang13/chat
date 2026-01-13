"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { Plus, Loader2, Search, X, Users, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useDebounce } from "@web/hooks/use-debounce";

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
import { Badge } from "@web/components/ui/badge";
import { ScrollArea } from "@web/components/ui/scroll-area";
import { AvatarWithStatus } from "@web/components/avatar-with-status";

import axiosInstance from "@web/lib/axios/instance";
import { createInfiniteSearchUsersQueryOptions } from "@web/lib/tanstack/options/search/search";
import { cn } from "@web/lib/utils";

const createGroupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  participantIds: z.array(z.string().uuid()).min(1, "Select at least one participant")
});

type CreateGroupForm = z.infer<typeof createGroupSchema>;

export const CreateGroupDialog = ({ triggerClassName }: { triggerClassName?: string }) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 300);

  // We need this ref for the virtualizer
  const viewportRef = useRef<HTMLDivElement>(null);

  const form = useForm<CreateGroupForm>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: { name: "", participantIds: [] }
  });

  const participantIds = form.watch("participantIds");

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery(
    createInfiniteSearchUsersQueryOptions({ keyword: debouncedKeyword, limit: 15 })
  );

  const users = useMemo(() => data?.pages.flatMap((p) => p.data ?? []) ?? [], [data]);

  const rowVirtualizer = useVirtualizer({
    count: users.length,
    getScrollElement: () => viewportRef.current,
    estimateSize: () => 52,
    overscan: 5
  });

  const handleToggleUser = useCallback(
    (userId: string) => {
      const current = form.getValues("participantIds");
      const nextValue = current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId];
      form.setValue("participantIds", nextValue, { shouldValidate: true });
    },
    [form]
  );

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (hasNextPage && !isFetchingNextPage && scrollHeight - scrollTop - clientHeight < 100) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  const createMutation = useMutation({
    mutationFn: (v: CreateGroupForm) => axiosInstance.post("/conversations/group", v),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setOpen(false);
      form.reset();
      setKeyword("");
    }
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) form.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("h-9 w-9", triggerClassName)}>
          <Plus className="h-5 w-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="flex h-[95vh] max-w-3xl flex-col overflow-hidden p-0 sm:h-[600px]">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2">
            <Users className="text-primary h-5 w-5" /> Create Group
          </DialogTitle>
          <DialogDescription>Select members to start a new chat.</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit((v) => createMutation.mutate(v))}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="grid flex-1 grid-cols-1 overflow-hidden sm:grid-cols-5">
            {/* LEFT PANEL: SEARCH & LIST */}
            <div className="flex flex-col gap-4 overflow-hidden border-r p-6 sm:col-span-3">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Group Name</Label>
                  <Input {...form.register("name")} placeholder="e.g. Weekly Sync" />
                </div>
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                  <Input
                    placeholder="Search people..."
                    className="pl-9"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                <ScrollArea
                  className="bg-muted/5 h-full rounded-md border"
                  onScroll={handleScroll}
                  ref={viewportRef}
                >
                  {isLoading ? (
                    <div className="text-muted-foreground p-8 text-center text-sm">
                      Loading users...
                    </div>
                  ) : (
                    <div
                      className="relative w-full"
                      style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
                    >
                      {rowVirtualizer.getVirtualItems().map((vItem) => {
                        const user = users[vItem.index];
                        const isSelected = participantIds.includes(user.id);
                        return (
                          <div
                            key={vItem.key}
                            className={cn(
                              "hover:bg-accent absolute top-0 left-0 flex w-full cursor-pointer items-center justify-between px-3 py-2 transition-colors",
                              isSelected && "bg-primary/5 hover:bg-primary/10"
                            )}
                            style={{
                              height: `${vItem.size}px`,
                              transform: `translateY(${vItem.start}px)`
                            }}
                            onClick={() => handleToggleUser(user.id)}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <AvatarWithStatus
                                name={user.fullname}
                                avatar={user.avatar}
                                size={32}
                              />
                              <span className="truncate text-sm font-medium">{user.fullname}</span>
                            </div>
                            {isSelected && <Check className="text-primary h-4 w-4" />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>

            {/* RIGHT PANEL: SELECTED SUMMARY */}
            <div className="bg-muted/10 hidden flex-col overflow-hidden p-6 sm:col-span-2 sm:flex">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                  Members ({participantIds.length})
                </span>
                {participantIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => form.setValue("participantIds", [])}
                    className="text-destructive text-[10px] font-bold uppercase hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              <ScrollArea className="flex-1">
                <div className="flex flex-wrap gap-2 pr-4">
                  {users
                    .filter((u) => participantIds.includes(u.id))
                    .map((user) => (
                      <Badge
                        key={user.id}
                        variant="secondary"
                        className="ring-border gap-1.5 border-none py-1 pr-1 pl-1 shadow-none ring-1 ring-inset"
                      >
                        <AvatarWithStatus name={user.fullname} avatar={user.avatar} size={18} />

                        <span className="max-w-[70px] truncate text-[11px] font-medium">
                          {user.fullname.split(" ")[0]}
                        </span>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="hover:bg-muted-foreground/20 hover:text-foreground h-4 w-4 rounded-full p-0"
                          onClick={(e) => {
                            e.preventDefault(); // Prevent form submission if inside a form
                            e.stopPropagation();
                            handleToggleUser(user.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove {user.fullname}</span>
                        </Button>
                      </Badge>
                    ))}
                </div>
              </ScrollArea>

              {form.formState.errors.participantIds && (
                <p className="text-destructive mt-2 text-[11px] font-medium">
                  {form.formState.errors.participantIds.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="border-t p-4 px-6">
            <Button
              type="submit"
              disabled={createMutation.isPending || participantIds.length === 0}
              className="w-full sm:w-auto"
            >
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Group
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
