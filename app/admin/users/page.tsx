"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/admin-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Download,
  Edit,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Shield,
  Trash2,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { checkFirebaseConfig } from "@/utils/env-check";
import FirebaseError from "@/components/admin/firebase-error";
import { getFirebaseDb } from "@/utils/firebase-client";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  location?: string;
  createdAt: string;
  status: string;
  photoURL?: string;
}

// Safe date formatting
const formatDate = (dateString: any): string => {
  try {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'N/A';
  }
};

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const db = await getFirebaseDb();
      if (!db) {
        setError("Failed to initialize Firebase");
        return;
      }

      const { collection, getDocs, query } = await import("firebase/firestore");
      const usersRef = collection(db, "users");
      const q = query(usersRef);
      const querySnapshot = await getDocs(q);
      
      const usersData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          role: data.role || 'user',
          location: data.location || '',
          createdAt: formatDate(data.createdAt),
          status: data.status || 'active',
          photoURL: data.photoURL || ''
        };
      }) as User[];
      
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    // Implementation for toggling user status
    console.log("Toggle status for user:", userId, "Current status:", currentStatus);
  };

  const handleDeleteUser = async (userId: string) => {
    // Implementation for deleting user
    console.log("Delete user:", userId);
  };

  // Filter users based on search query and filters
  const filteredUsers = users.filter((user) => {
    // Search filter
    const matchesSearch =
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.location?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    // User type filter
    const matchesType =
      userTypeFilter === "all" ||
      user.role.toLowerCase() === userTypeFilter.toLowerCase();

    // Status filter
    const matchesStatus =
      statusFilter === "all" ||
      user.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesType && matchesStatus;
  });

  if (error) {
    return (
      <AdminLayout activeLink="users" title="User Management">
        <div className="flex items-center justify-center min-h-[400px]">
          <FirebaseError 
            error={error} 
            onRetry={fetchUsers}
            showConfig={error.includes("Firebase configuration is incomplete")}
          />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeLink="users" title="User Management">
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage all users on the Parttimejob platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <div className="w-40">
                <Select
                  value={userTypeFilter}
                  onValueChange={setUserTypeFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="User Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="job seeker">Job Seekers</SelectItem>
                    <SelectItem value="employer">Employers</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-40">
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="hidden md:inline">More Filters</span>
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage
                              src={user.photoURL || "/placeholder.svg?height=36&width=36"}
                              alt={`${user.firstName || ''} ${user.lastName || ''}`}
                            />
                            <AvatarFallback>
                              {`${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unnamed User'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {user.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "employer"
                              ? "outline"
                              : user.role === "admin"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.location || "N/A"}</TableCell>
                      <TableCell>{user.createdAt}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.status === "active"
                              ? "default"
                              : user.status === "inactive"
                              ? "outline"
                              : "secondary"
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditUser(user.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(user.id, user.status)}>
                              <Shield className="mr-2 h-4 w-4" />
                              {user.status === "active" ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing <strong>{filteredUsers.length}</strong> of{" "}
              <strong>{users.length}</strong> users
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Users
        </Button>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>
    </AdminLayout>
  );
}
