'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { usersAtom, User, Role } from '@/lib/users';
import { 
  UserPlus, 
  ShieldCheck, 
  ShieldX, 
  RotateCcw, 
  Trash2, 
  UserCog,
  Search,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  KeyRound,
  ShieldAlert,
  UserCheck,
  Edit2
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminDashboard({ user: adminUser }: { user: User }) {
  const { toast } = useToast();
  const [allUsers, setAllUsers] = useAtom(usersAtom);
  const [searchTerm, setSearchTerm] = React.useState('');
  
  // Dialog States
  const [isAddUserOpen, setIsAddUserOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  
  // New User Form State
  const [newUser, setNewUser] = React.useState({
    name: '',
    email: '',
    role: '' as Role,
  });

  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleUserStatus = (userId: string) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const newStatus = u.status === 'active' ? 'disabled' : 'active';
        toast({
          title: `User ${newStatus === 'active' ? 'Enabled' : 'Disabled'}`,
          description: `Access for ${u.name} has been updated.`,
          variant: newStatus === 'active' ? 'default' : 'destructive'
        });
        return { ...u, status: newStatus };
      }
      return u;
    }));
  };

  const handleUpdateRole = (userId: string, newRole: Role) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        toast({
          title: "Access Level Updated",
          description: `${u.name} is now assigned to the ${newRole.toUpperCase()} workspace.`,
        });
        return { ...u, role: newRole };
      }
      return u;
    }));
    setEditingUser(null);
  };

  const handleResetPassword = (userName: string) => {
    toast({
      title: "Security Reset Triggered",
      description: `A security reset instruction has been sent to ${userName}'s work email.`,
    });
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (userId === adminUser.id) {
      toast({
        variant: 'destructive',
        title: "Action Denied",
        description: "You cannot delete your own admin account.",
      });
      return;
    }
    
    setAllUsers(prev => prev.filter(u => u.id !== userId));
    toast({
      title: "User Removed",
      description: `${userName} has been removed from the system.`,
    });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.role) return;

    const initials = newUser.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    const id = `${newUser.role}-${Date.now()}`;

    const createdUser: User = {
      id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      initials,
      status: 'active'
    };

    setAllUsers(prev => [...prev, createdUser]);
    setIsAddUserOpen(false);
    setNewUser({ name: '', email: '', role: '' as any });
    
    toast({
      title: "Account Created",
      description: `${createdUser.name} can now login to the ${createdUser.role} workspace.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <UserCog className="h-8 w-8 text-primary" />
            ACCESS & ROLE MANAGEMENT
          </h2>
          <p className="text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-bold">System Security, Permissions & User Control</p>
        </div>
        
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground font-bold shadow-lg hover:scale-105 transition-transform">
              <UserPlus className="mr-2 h-4 w-4" />
              Provision New Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Create Staff Account</DialogTitle>
              <DialogDescription>Assign an initial workspace and role to new personnel.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-name">Full Name</Label>
                <Input 
                  id="new-name" 
                  placeholder="e.g. John Doe" 
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  required
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-email">Work Email</Label>
                <Input 
                  id="new-email" 
                  type="email" 
                  placeholder="name@inbucks.app" 
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  required
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-role">Assigned Workspace (Role)</Label>
                <Select onValueChange={(v: Role) => setNewUser({...newUser, role: v})}>
                  <SelectTrigger id="new-role" className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Pick workspace..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asl">Area Sales Leader (ASL)</SelectItem>
                    <SelectItem value="back-office">Back Office Clerk</SelectItem>
                    <SelectItem value="supervisor">Back Office Supervisor</SelectItem>
                    <SelectItem value="management">MANAGEMENT (Exec/Finance)</SelectItem>
                    <SelectItem value="admin">System Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full font-bold">Create & Grant Access</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-2xl bg-white/5 backdrop-blur-md">
        <CardHeader className="border-b border-white/10 pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <CardTitle className="text-xl">Personnel Directory</CardTitle>
              <CardDescription>Monitor roles and enforce system boundary controls.</CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search staff, email, or role..." 
                className="pl-9 bg-black/20 border-white/10 text-white"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-black/20 hover:bg-black/20 border-white/5">
                <TableHead className="pl-6 text-white/50 uppercase text-[10px] font-bold tracking-widest">User Identity</TableHead>
                <TableHead className="text-white/50 uppercase text-[10px] font-bold tracking-widest">Access Level (Role)</TableHead>
                <TableHead className="text-white/50 uppercase text-[10px] font-bold tracking-widest">Access Status</TableHead>
                <TableHead className="text-white/50 uppercase text-[10px] font-bold tracking-widest text-center">Login Toggle</TableHead>
                <TableHead className="pr-6 text-white/50 uppercase text-[10px] font-bold tracking-widest text-right">Security Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center font-bold text-primary">
                        {u.initials}
                      </div>
                      <div>
                        <p className="font-bold text-white">{u.name}</p>
                        <p className="text-xs text-white/40">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="uppercase text-[9px] font-bold tracking-widest border-white/10 text-white/70">
                        {u.role.replace('-', ' ')}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-white/20 hover:text-primary"
                        onClick={() => setEditingUser(u)}
                        title="Change Role"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {u.status === 'active' ? (
                      <div className="flex items-center gap-1.5 text-green-500 text-[10px] font-bold uppercase">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-destructive text-[10px] font-bold uppercase">
                        <ShieldAlert className="h-3 w-3" /> Blocked
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Switch 
                        checked={u.status === 'active'} 
                        onCheckedChange={() => toggleUserStatus(u.id)}
                        disabled={u.id === adminUser.id}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10"
                        title="Reset Credentials"
                        onClick={() => handleResetPassword(u.name)}
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-white/40 hover:text-destructive hover:bg-destructive/10"
                        title="Remove Account"
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        disabled={u.id === adminUser.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredUsers.length === 0 && (
            <div className="p-20 text-center text-white/20 italic">
              No personnel matching your search criteria.
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <p className="text-xs text-primary font-medium leading-tight">
          <strong>Boundary Controls:</strong> Workspace access is enforced by Role-Based Access Control (RBAC). When you change a user's role, their permissions update across the system instantly. Blocking a user revokes their session token immediately.
        </p>
      </div>

      {/* Role Management Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="bg-card border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Modify Access Level</DialogTitle>
            <DialogDescription>Change the workspace permissions for <strong>{editingUser?.name}</strong>.</DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label>Select New Role</Label>
              <Select 
                defaultValue={editingUser?.role} 
                onValueChange={(v: Role) => editingUser && handleUpdateRole(editingUser.id, v)}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Choose Role..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asl">Area Sales Leader (ASL)</SelectItem>
                  <SelectItem value="back-office">Back Office Clerk</SelectItem>
                  <SelectItem value="supervisor">Back Office Supervisor</SelectItem>
                  <SelectItem value="management">MANAGEMENT</SelectItem>
                  <SelectItem value="admin">System Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 rounded-md bg-white/5 border border-white/10 text-[10px] text-white/60 italic">
              Note: Changing a role will redirect the user to their new dashboard upon their next page load.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
