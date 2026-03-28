'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { usersAtom, User, Role } from '@/lib/users';
import { applicationsAtom } from '@/lib/mock-data';
import { 
  UserPlus, 
  ShieldCheck, 
  Trash2, 
  UserCog,
  Search,
  CheckCircle2,
  KeyRound,
  ShieldAlert,
  Edit2,
  Activity,
  Users,
  Shield,
  Fingerprint,
  Lock,
  EyeOff
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AdminDashboard({ user: adminUser }: { user: User }) {
  const { toast } = useToast();
  const [allUsers, setAllUsers] = useAtom(usersAtom);
  const [applications] = useAtom(applicationsAtom);
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const [isAddUserOpen, setIsAddUserOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  
  const [newUser, setNewUser] = React.useState({
    name: '',
    email: '',
    role: '' as Role,
    password: '',
  });

  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const globalActivity = React.useMemo(() => {
    return applications.flatMap(app => 
      app.history.map(log => ({
        ...log,
        appId: app.id,
        clientName: app.clientName
      }))
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [applications]);

  const amlOversight = React.useMemo(() => {
    return {
      pending: applications.filter(a => ['Submitted', 'In Review', 'Pending Supervisor'].includes(a.status)).length,
      approved: applications.filter(a => a.status === 'Archived' || a.status === 'Signed').length,
      rejected: applications.filter(a => a.status === 'Rejected').length,
    };
  }, [applications]);

  const toggleUserStatus = (userId: string) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const newStatus = u.status === 'active' ? 'disabled' : 'active';
        toast({
          title: `${newStatus === 'active' ? 'Enabled' : 'Disabled'}`,
          description: `${u.name} updated.`,
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
          title: "Role Updated",
          description: `${u.name} is now ${newRole}.`,
        });
        return { ...u, role: newRole };
      }
      return u;
    }));
    setEditingUser(null);
  };

  const handleResetPassword = (userName: string) => {
    toast({
      title: "Reset Sent",
      description: `Sent to ${userName}.`,
    });
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (userId === adminUser.id) {
      toast({ variant: 'destructive', title: "No", description: "You can't delete yourself." });
      return;
    }
    setAllUsers(prev => prev.filter(u => u.id !== userId));
    toast({ title: "Deleted", description: `${userName} removed.` });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.role || !newUser.password) return;

    const initials = newUser.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    const id = `${newUser.role}-${Date.now()}`;

    const createdUser: User = {
      id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      password: newUser.password,
      initials,
      status: 'active'
    };

    setAllUsers(prev => [...prev, createdUser]);
    setIsAddUserOpen(false);
    setNewUser({ name: '', email: '', role: '' as any, password: '' });
    toast({ title: "Done", description: `${createdUser.name} added.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            ADMIN
          </h2>
          <p className="text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-bold">Staff Access.</p>
        </div>
        
        <div className="flex gap-2">
            <Button onClick={() => setIsAddUserOpen(true)} className="bg-primary text-primary-foreground font-bold shadow-lg">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Staff
            </Button>
        </div>
      </div>

      <Tabs defaultValue="access" className="w-full">
        <TabsList className="bg-black/20 p-1 mb-6">
          <TabsTrigger value="access" className="flex items-center gap-2"><Users className="h-4 w-4" /> Staff</TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2"><Activity className="h-4 w-4" /> Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="access">
          <Card className="border-none shadow-2xl bg-white/5 backdrop-blur-md">
            <CardHeader className="border-b border-white/10 pb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <CardTitle>Staff Access</CardTitle>
                <CardDescription>Manage who can enter.</CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-9 bg-black/20 border-white/10 text-white" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-black/20 hover:bg-black/20 border-white/5">
                    <TableHead className="pl-6 text-white/50 uppercase text-[10px] font-bold tracking-widest">Name</TableHead>
                    <TableHead className="text-white/50 uppercase text-[10px] font-bold tracking-widest">Role</TableHead>
                    <TableHead className="text-white/50 uppercase text-[10px] font-bold tracking-widest">Access</TableHead>
                    <TableHead className="pr-6 text-white/50 uppercase text-[10px] font-bold tracking-widest text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id} className="border-white/5 hover:bg-white/5">
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center font-bold text-primary">{u.initials}</div>
                          <div><p className="font-bold text-white">{u.name}</p><p className="text-xs text-white/40">{u.email}</p></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="uppercase text-[9px] font-bold tracking-widest border-white/10 text-white/70">{u.role.replace('-', ' ')}</Badge>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-white/20 hover:text-primary" onClick={() => setEditingUser(u)}><Edit2 className="h-3 w-3" /></Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                            <Switch checked={u.status === 'active'} onCheckedChange={() => toggleUserStatus(u.id)} disabled={u.id === adminUser.id} />
                            {u.status === 'active' ? (
                                <span className="text-green-500 text-[10px] font-bold uppercase tracking-wider">OK</span>
                            ) : (
                                <span className="text-destructive text-[10px] font-bold uppercase tracking-wider">Off</span>
                            )}
                        </div>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white" title="Reset" onClick={() => handleResetPassword(u.name)}><KeyRound className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-destructive" title="Delete" onClick={() => handleDeleteUser(u.id, u.name)} disabled={u.id === adminUser.id}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <Card className="border-none shadow-2xl bg-white/5 backdrop-blur-md">
            <CardHeader className="border-b border-white/10">
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Live events.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-black/20 border-white/5">
                      <TableHead className="pl-6 text-[10px] font-bold uppercase text-white/50">Time</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-white/50">User</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-white/50">Action</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-white/50">Ref</TableHead>
                      <TableHead className="pr-6 text-[10px] font-bold uppercase text-white/50">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {globalActivity.map((log, idx) => (
                      <TableRow key={idx} className="border-white/5 text-[11px] hover:bg-white/5">
                        <TableCell className="pl-6 text-white/40">{new Date(log.timestamp).toLocaleString()}</TableCell>
                        <TableCell className="font-bold text-white">{log.user}</TableCell>
                        <TableCell><Badge variant="secondary" className="text-[9px] uppercase font-bold">{log.action}</Badge></TableCell>
                        <TableCell><div><p className="font-medium text-white">{log.clientName}</p><p className="text-[9px] text-white/30">{log.appId}</p></div></TableCell>
                        <TableCell className="pr-6 text-white/60 italic max-w-[200px] truncate">{log.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}