import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { 
  Search, 
  Users, 
  Shield, 
  Crown, 
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type AppRole = 'admin' | 'buyer' | 'seller' | 'super_admin';

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string | null;
  company_name: string | null;
  created_at: string;
  role: AppRole;
}

export default function AdminUsers() {
  const { isSuperAdmin, user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    userId: string;
    newRole: AppRole;
    userName: string;
  }>({ open: false, userId: '', newRole: 'buyer', userName: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, user_id, full_name, company_name, created_at')
      .order('created_at', { ascending: false });

    if (profiles) {
      const usersWithRoles = await Promise.all(
        profiles.map(async (profile) => {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.user_id)
            .single();

          return {
            ...profile,
            role: (roleData?.role || 'buyer') as AppRole
          };
        })
      );

      setUsers(usersWithRoles);
    }
    
    setLoading(false);
  };

  const handleRoleChange = (userId: string, newRole: AppRole, userName: string) => {
    // Only super admin can assign super_admin or admin roles
    if ((newRole === 'super_admin' || newRole === 'admin') && !isSuperAdmin) {
      toast({ 
        title: 'Permission denied', 
        description: 'Only Super Admins can assign admin roles', 
        variant: 'destructive' 
      });
      return;
    }

    // Prevent self-demotion
    if (userId === currentUser?.id && (newRole === 'buyer' || newRole === 'seller')) {
      toast({ 
        title: 'Action not allowed', 
        description: 'You cannot demote yourself', 
        variant: 'destructive' 
      });
      return;
    }

    setConfirmDialog({ open: true, userId, newRole, userName });
  };

  const confirmRoleChange = async () => {
    const { userId, newRole } = confirmDialog;
    
    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole })
      .eq('user_id', userId);

    if (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to update user role', 
        variant: 'destructive' 
      });
    } else {
      setUsers(users.map(u => 
        u.user_id === userId ? { ...u, role: newRole } : u
      ));
      toast({ title: 'Role updated successfully' });
    }

    setConfirmDialog({ ...confirmDialog, open: false });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.full_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (user.company_name?.toLowerCase() || '').includes(search.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: AppRole) => {
    switch (role) {
      case 'super_admin':
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
            <Crown className="h-3 w-3 mr-1" />
            Super Admin
          </Badge>
        );
      case 'admin':
        return (
          <Badge className="bg-red-100 text-red-800">
            <Shield className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        );
      case 'seller':
        return (
          <Badge className="bg-purple-100 text-purple-800">
            Seller
          </Badge>
        );
      case 'buyer':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <UserCheck className="h-3 w-3 mr-1" />
            Buyer
          </Badge>
        );
      default:
        return <Badge className="bg-gray-100 text-gray-800">{role}</Badge>;
    }
  };

  const getAvailableRoles = (currentRole: AppRole): AppRole[] => {
    if (isSuperAdmin) {
      return ['buyer', 'seller', 'admin', 'super_admin'];
    }
    // Regular admins can only assign buyer/seller roles
    return ['buyer', 'seller'];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage all registered users {!isSuperAdmin && '(Limited access - Admin roles require Super Admin)'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-2xl">{users.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Admins</CardDescription>
            <CardTitle className="text-2xl text-red-600">
              {users.filter(u => u.role === 'admin' || u.role === 'super_admin').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sellers</CardDescription>
            <CardTitle className="text-2xl text-purple-600">
              {users.filter(u => u.role === 'seller').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Buyers</CardDescription>
            <CardTitle className="text-2xl text-blue-600">
              {users.filter(u => u.role === 'buyer').length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="seller">Seller</SelectItem>
                <SelectItem value="buyer">Buyer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            {user.role === 'super_admin' ? (
                              <Crown className="h-4 w-4 text-yellow-600" />
                            ) : (
                              <span className="text-sm font-medium">
                                {(user.full_name?.[0] || 'U').toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{user.full_name || 'Unnamed User'}</p>
                            <p className="text-xs text-muted-foreground">ID: {user.user_id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.company_name || '-'}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        {format(new Date(user.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={user.role} 
                          onValueChange={(value) => handleRoleChange(user.user_id, value as AppRole, user.full_name || 'User')}
                          disabled={user.role === 'super_admin' && !isSuperAdmin}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableRoles(user.role).map((role) => (
                              <SelectItem key={role} value={role}>
                                {role === 'super_admin' ? 'Super Admin' : role.charAt(0).toUpperCase() + role.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Confirm Role Change
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change <strong>{confirmDialog.userName}</strong>'s role to{' '}
              <strong>{confirmDialog.newRole === 'super_admin' ? 'Super Admin' : confirmDialog.newRole}</strong>?
              {(confirmDialog.newRole === 'admin' || confirmDialog.newRole === 'super_admin') && (
                <span className="block mt-2 text-yellow-600">
                  ⚠️ This will grant administrative privileges to this user.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange}>
              Confirm Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
