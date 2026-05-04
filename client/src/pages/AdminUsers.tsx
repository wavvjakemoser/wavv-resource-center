import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Shield, ShieldOff, Users, UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function AdminUsers() {
  const { user: currentUser } = useAuth();

  const [search, setSearch] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    userId: number;
    userName: string;
    currentRole: string;
    newRole: "user" | "admin";
  } | null>(null);

  const {
    data: users,
    isLoading,
    refetch,
  } = trpc.admin.listUsers.useQuery(undefined, {
    enabled: currentUser?.role === "admin",
  });

  const updateRole = trpc.admin.updateRole.useMutation({
    onSuccess: () => {
      toast.success(`${confirmDialog?.userName} is now ${confirmDialog?.newRole === "admin" ? "an admin" : "a standard user"}.`);
      setConfirmDialog(null);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!search.trim()) return users;
    const q = search.trim().toLowerCase();
    return users.filter(
      (u) =>
        (u.name ?? "").toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q)
    );
  }, [users, search]);

  const adminCount = useMemo(
    () => (users ?? []).filter((u) => u.role === "admin").length,
    [users]
  );
  const totalCount = users?.length ?? 0;

  if (currentUser?.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Access denied. Admin only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage user roles and access. Promote users to admin to grant access to analytics and content management.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-blue-500/10">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{totalCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-amber-500/10">
              <Shield className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Admins</p>
              <p className="text-2xl font-bold">{adminCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-green-500/10">
              <UserPlus className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Standard Users</p>
              <p className="text-2xl font-bold">{totalCount - adminCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[250px]">Name</TableHead>
              <TableHead className="w-[300px]">Email</TableHead>
              <TableHead className="w-[120px]">Role</TableHead>
              <TableHead className="w-[180px]">Registered</TableHead>
              <TableHead className="w-[120px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  {search ? "No users match your search." : "No users found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u) => {
                const isSelf = u.id === currentUser?.id;
                const initials = (u.name ?? "?")
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                return (
                  <TableRow key={u.id} className={isSelf ? "bg-blue-500/5" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {initials}
                        </div>
                        <span className="font-medium">
                          {u.name ?? "—"}
                          {isSelf && (
                            <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{u.email ?? "—"}</TableCell>
                    <TableCell>
                      {u.role === "admin" ? (
                        <Badge variant="default" className="bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="secondary">User</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {isSelf ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : u.role === "admin" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() =>
                            setConfirmDialog({
                              open: true,
                              userId: u.id,
                              userName: u.name ?? u.email ?? "User",
                              currentRole: u.role,
                              newRole: "user",
                            })
                          }
                        >
                          <ShieldOff className="h-4 w-4 mr-1" />
                          Revoke
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                          onClick={() =>
                            setConfirmDialog({
                              open: true,
                              userId: u.id,
                              userName: u.name ?? u.email ?? "User",
                              currentRole: u.role,
                              newRole: "admin",
                            })
                          }
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          Promote
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={!!confirmDialog?.open}
        onOpenChange={(open) => {
          if (!open) setConfirmDialog(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog?.newRole === "admin" ? "Promote to Admin" : "Revoke Admin Access"}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog?.newRole === "admin" ? (
                <>
                  <strong>{confirmDialog.userName}</strong> will gain access to the admin
                  analytics dashboard, user management, and content management tools.
                </>
              ) : (
                <>
                  <strong>{confirmDialog?.userName}</strong> will lose access to admin tools
                  including analytics, user management, and content management. They will retain
                  standard user access to all learning content.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDialog(null)}>
              Cancel
            </Button>
            <Button
              variant={confirmDialog?.newRole === "admin" ? "default" : "destructive"}
              onClick={() => {
                if (confirmDialog) {
                  updateRole.mutate({
                    userId: confirmDialog.userId,
                    role: confirmDialog.newRole,
                  });
                }
              }}
              disabled={updateRole.isPending}
            >
              {updateRole.isPending
                ? "Updating..."
                : confirmDialog?.newRole === "admin"
                  ? "Promote to Admin"
                  : "Revoke Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
