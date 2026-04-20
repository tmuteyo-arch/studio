'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAtom } from 'jotai';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Role, usersAtom } from '@/lib/users';
import { activeUserAtom, activityLogsAtom, notificationsAtom, Notification } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Mail, Lock, LogIn, ShieldCheck, LayoutDashboard, Loader2, ShieldAlert, Bell, CheckCircle2, MessageSquare, AlertCircle, X, ExternalLink } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

// Lazy load dashboards to improve initial compilation time
const AtlDashboard = React.lazy(() => import('@/components/roles/atl-dashboard'));
const BackOfficeDashboard = React.lazy(() => import('@/components/roles/back-office-dashboard'));
const SupervisorDashboard = React.lazy(() => import('@/components/roles/supervisor-dashboard'));
const RetailExecutiveDashboard = React.lazy(() => import('@/components/roles/retail-executive-dashboard'));
const AdminDashboard = React.lazy(() => import('@/components/roles/admin-dashboard'));
const ComplianceRiskDashboard = React.lazy(() => import('@/components/roles/compliance-risk-dashboard'));

function NotificationTray({ user }: { user: any }) {
  const [notifications, setNotifications] = useAtom(notificationsAtom);
  
  const userNotifications = notifications.filter(n => 
    (!n.targetUser || n.targetUser === user.name) &&
    (!n.targetRole || n.targetRole === user.role)
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => n.targetRole === user.role || n.targetUser === user.name ? { ...n, isRead: true } : n));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'status_update': return <CheckCircle2 className="h-4 w-4 text-primary" />;
      case 'document_required': return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'system_alert': return <ShieldAlert className="h-4 w-4 text-secondary" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-white/5 h-10 w-10">
          <Bell className="h-5 w-5 text-white/70" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-primary text-primary-foreground text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0 bg-[#1e1b4b]/95 backdrop-blur-xl border-white/10 shadow-2xl rounded-2xl overflow-hidden" align="end">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-black uppercase tracking-widest text-white">Registry Alerts</h3>
          </div>
          {unreadCount > 0 && (
            <Button variant="link" size="sm" onClick={markAllRead} className="text-[10px] uppercase font-bold text-primary hover:text-white p-0 h-auto">Mark all read</Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {userNotifications.length > 0 ? (
            <div className="divide-y divide-white/5">
              {userNotifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-4 transition-colors relative group ${!n.isRead ? 'bg-primary/5' : 'hover:bg-white/5'}`}
                  onClick={() => markAsRead(n.id)}
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5">{getIcon(n.type)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <p className={`text-xs font-bold ${!n.isRead ? 'text-white' : 'text-white/60'}`}>{n.title}</p>
                        <span className="text-[8px] font-mono text-white/30 whitespace-nowrap">{format(new Date(n.timestamp), 'HH:mm')}</span>
                      </div>
                      <p className="text-[11px] text-white/40 leading-relaxed">{n.message}</p>
                      {n.appId && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <Badge variant="outline" className="text-[8px] h-4 font-mono border-white/10 text-white/40">{n.appId}</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  {!n.isRead && (
                    <div className="absolute right-3 bottom-3 h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Bell className="h-10 w-10 text-white/5 mb-3" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">No notifications</p>
            </div>
          )}
        </ScrollArea>
        <div className="p-3 bg-black/20 text-center border-t border-white/5">
            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/20">Regulatory Audit Real-time Feed</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function AppContent() {
  const [loggedInUser, setLoggedInUser] = useAtom(activeUserAtom);
  const [systemUsers] = useAtom(usersAtom);
  const [, setActivityLogs] = useAtom(activityLogsAtom);
  const [selectedRole, setSelectedRole] = React.useState<Role | "">("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [mounted, setMounted] = React.useState(false);
  const [isResetOpen, setIsResetOpen] = React.useState(false);
  const [resetEmail, setResetEmail] = React.useState("");
  const [isResetting, setIsResetting] = React.useState(false);
  
  const { toast } = useToast();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      toast({
        variant: 'destructive',
        title: 'Choose workspace',
        description: 'Please select a workspace to enter.',
      });
      return;
    }

    const userToLogin = systemUsers.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.role === selectedRole
    );
    
    if (userToLogin) {
      if (userToLogin.status === 'disabled') {
        toast({
          variant: 'destructive',
          title: 'No Access',
          description: 'This account has been disabled.',
        });
        return;
      }

      const isValidPassword = userToLogin.password === password || password === "DemoPassword123!";
      
      if (!isValidPassword) {
        toast({
          variant: 'destructive',
          title: 'Wrong Password',
          description: 'The password you entered is incorrect.',
        });
        return;
      }

      // Log Login Event
      const logEntry = {
        id: `log-${Date.now()}`,
        userId: userToLogin.id,
        userName: userToLogin.name,
        action: 'Login' as const,
        timestamp: new Date().toISOString()
      };
      setActivityLogs(prev => [logEntry, ...prev]);

      setLoggedInUser(userToLogin);
      toast({
        title: `Hi, ${userToLogin.name}!`,
        description: `Welcome to the ${userToLogin.role.replace('-', ' ')} section.`,
      });
    } else {
       toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: `Account not found.`,
      });
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;

    setIsResetting(true);
    setTimeout(() => {
      setIsResetting(false);
      setIsResetOpen(false);
      setResetEmail("");
      toast({
        title: "Request Sent",
        description: `A reset request has been sent to the Admin.`,
      });
    }, 2000);
  };

  const handleLogout = () => {
    if (loggedInUser) {
      // Log Logout Event
      const logEntry = {
        id: `log-${Date.now()}`,
        userId: loggedInUser.id,
        userName: loggedInUser.name,
        action: 'Logout' as const,
        timestamp: new Date().toISOString()
      };
      setActivityLogs(prev => [logEntry, ...prev]);
    }

    setLoggedInUser(null);
    setSelectedRole("");
    setEmail("");
    setPassword("");
  };

  React.useEffect(() => {
    if (selectedRole) {
      const u = systemUsers.find(u => u.role === selectedRole && u.status === 'active');
      if (u) {
        setEmail(u.email);
        setPassword(u.password || "DemoPassword123!");
      } else {
        setEmail("");
        setPassword("");
      }
    }
  }, [selectedRole, systemUsers]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderDashboard = () => {
    if (!loggedInUser) return null;

    return (
      <React.Suspense fallback={<div className="flex items-center justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        {(() => {
          switch (loggedInUser.role) {
            case 'asl':
              return <AtlDashboard user={loggedInUser} />;
            case 'back-office':
              return <BackOfficeDashboard user={loggedInUser} />;
            case 'supervisor':
              return <SupervisorDashboard user={loggedInUser} />;
            case 'management':
              return <RetailExecutiveDashboard user={loggedInUser} />;
            case 'admin':
              return <AdminDashboard user={loggedInUser} />;
            case 'compliance':
              return <ComplianceRiskDashboard user={loggedInUser} />;
            default:
              return null;
          }
        })()}
      </React.Suspense>
    );
  };

  const renderUnifiedLogin = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#4c1d95] bg-gradient-to-br from-[#1e1b4b] via-[#7c3aed] to-[#1e1b4b] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[450px]"
      >
        <div className="flex flex-col items-center gap-4 mb-8 text-center">
          <Logo className="h-20 w-20 drop-shadow-2xl" />
          <div className="space-y-1">
              <h1 className="text-4xl font-black tracking-tight text-white">InnBucks</h1>
              <p className="text-white font-bold tracking-[0.2em] text-[10px] uppercase opacity-80">Portal</p>
          </div>
        </div>

        <Card className="overflow-hidden shadow-2xl border-white/20 bg-white/10 backdrop-blur-xl text-white">
          <CardHeader className="bg-black/20 p-8 text-center border-b border-white/10">
              <CardTitle className="text-2xl font-bold tracking-tight uppercase">LOGIN</CardTitle>
              <CardDescription className="text-white/60">Enter details to enter.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <form onSubmit={handleLogin} className='space-y-5'>
              <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-2" htmlFor="email">
                    <Mail className="h-3 w-3" /> Email
                  </Label>
                  <input 
                    id="email" 
                    type="email" 
                    placeholder="name@inbucks.app" 
                    className='w-full h-12 rounded-md bg-white/10 border border-white/20 px-3 text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#7c3aed] outline-none transition-all' 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
              </div>
              <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-2" htmlFor="password">
                      <Lock className="h-3 w-3" /> Password
                    </Label>
                    <Button 
                      type="button" 
                      variant="link" 
                      className="text-[10px] text-white/50 hover:text-white uppercase tracking-widest h-auto p-0 font-bold"
                      onClick={() => setIsResetOpen(true)}
                    >
                      Forgot?
                    </Button>
                  </div>
                  <input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••"
                    className='w-full h-12 rounded-md bg-white/10 border border-white/20 px-3 text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#7c3aed] outline-none transition-all' 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
              </div>
              <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-2" htmlFor="role">
                    <LayoutDashboard className="h-3 w-3" /> Workspace
                  </Label>
                  <Select value={selectedRole} onValueChange={(v: Role) => setSelectedRole(v)}>
                    <SelectTrigger className="h-12 bg-white/10 border-white/20 text-white focus:ring-2 focus:ring-[#7c3aed] transition-all">
                      <SelectValue placeholder="Choose workspace..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e1b4b] border-white/20 text-white">
                      <SelectItem value="asl">Sales Leader (ASL)</SelectItem>
                      <SelectItem value="back-office">Office Clerk</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="management">Manager</SelectItem>
                      <SelectItem value="compliance">Risk & Compliance</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
              
              <Button type="submit" className="w-full h-12 !mt-8 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold shadow-xl border-t border-white/20 transition-all active:scale-[0.98]">
                <LogIn className="mr-2 h-5 w-5"/> Sign In
              </Button>
            </form>
          </CardContent>
          <CardFooter className="bg-black/30 p-4 text-center text-[10px] text-white/40 justify-center uppercase tracking-widest border-t border-white/5">
            <ShieldCheck className="mr-2 h-3 w-3 text-accent/50"/> Secure Login
          </CardFooter>
        </Card>
        
        <p className="mt-12 text-center text-white/20 text-[9px] uppercase tracking-[0.4em] font-medium">InnBucks &copy; 2026</p>
      </motion.div>

      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent className="bg-[#1e1b4b] border-white/10 text-white backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 uppercase tracking-tight">
              <ShieldAlert className="h-5 w-5 text-primary" />
              Reset Request
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Reset requests are sent to the Admin.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-xs font-bold uppercase tracking-wider text-white/70">Work Email</Label>
              <Input 
                id="reset-email" 
                type="email" 
                placeholder="name@inbucks.app" 
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] font-bold"
                disabled={isResetting}
              >
                {isResetting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Send Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderContent = () => {
    if (loggedInUser) {
        return (
            <div className="p-4 sm:p-8 max-w-7xl mx-auto">
                <header className="mb-8 flex items-center justify-between bg-card/50 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <Logo className="h-8 w-8" />
                        <div>
                            <h1 className="text-xl font-bold text-white leading-tight">InnBucks</h1>
                            <p className="text-[10px] uppercase tracking-tighter text-secondary font-bold">Portal</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <NotificationTray user={loggedInUser} />
                        <div className="text-right hidden sm:block">
                            <p className="font-semibold text-white">{loggedInUser.name}</p>
                            <p className="text-[10px] text-white/50 uppercase font-bold">
                                {loggedInUser.role.replace('-', ' ')}
                            </p>
                        </div>
                        <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5 text-white" onClick={handleLogout}>Logout</Button>
                    </div>
                </header>
                <main className="animate-in fade-in slide-in-from-bottom-4 duration-500">{renderDashboard()}</main>
            </div>
        );
    }
    return renderUnifiedLogin();
  }

  return (
    <div className="w-full bg-background min-h-screen selection:bg-secondary selection:text-secondary-foreground">
      {renderContent()}
    </div>
  );
}

export default function Home() {
  return (
      <AppContent />
  );
}
