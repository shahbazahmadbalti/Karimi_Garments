import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Users, UserCheck, UserX } from "lucide-react";

export default function UsersManager() {
  const utils = trpc.useUtils();
  const { data: usersData, isLoading } = trpc.admin.users.useQuery({});

  const updateRole = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success("User role updated!");
      utils.admin.users.invalidate();
    },
  });

  const toggleStatus = trpc.admin.toggleUserStatus.useMutation({
    onSuccess: () => {
      toast.success("User status updated!");
      utils.admin.users.invalidate();
    },
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Users</h2>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">User</th>
                  <th className="text-left px-4 py-3 font-medium">Email</th>
                  <th className="text-left px-4 py-3 font-medium">Role</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Joined</th>
                  <th className="text-left px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersData?.items.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {user.name?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                        <span className="font-medium">{user.name || "Anonymous"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{user.email}</td>
                    <td className="px-4 py-3">
                      <Select
                        value={user.role}
                        onValueChange={(role) =>
                          updateRole.mutate({ id: user.id, role: role as any })
                        }
                      >
                        <SelectTrigger className="w-28 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="customer">Customer</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant={user.isActive ? "outline" : "default"}
                        onClick={() => toggleStatus.mutate({ id: user.id })}
                      >
                        {user.isActive ? (
                          <><UserX className="w-3 h-3 mr-1" /> Block</>
                        ) : (
                          <><UserCheck className="w-3 h-3 mr-1" /> Activate</>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(!usersData?.items || usersData.items.length === 0) && (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              No users found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
