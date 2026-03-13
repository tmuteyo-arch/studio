'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import AtlDashboard from '@/components/roles/atl-dashboard';
import BackOfficeDashboard from '@/components/roles/back-office-dashboard';
import SupervisorDashboard from '@/components/roles/supervisor-dashboard';
import RetailExecutiveDashboard from '@/components/roles/retail-executive-dashboard';
import MerchantServicesDashboard from '@/components/roles/merchant-services-dashboard';
import BusinessBankingDashboard from '@/components/roles/business-banking-dashboard';
import InnerCircleDashboard from '@/components/roles/inner-circle-dashboard';
import FinancialDirectorDashboard from '@/components/roles/financial-director-dashboard';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { users, Role } from '@/lib/users';
import { activeUserAtom } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Mail, Lock, LogIn, ShieldCheck, LayoutDashboard, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

function AppContent() {
  const [loggedInUser, setLoggedInUser] = useAtom(activeUserAtom);
  const [selectedRole, setSelectedRole] = React.useState<Role | "">("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [mounted, setMounted] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      toast({
        variant: 'destructive',
        title: 'Please Choose',
        description: 'Please select a workplace to enter.',
      });
      return;
    }

    const userToLogin = users.find(u => u.role === selectedRole);
    
    if (userToLogin) {
      setLoggedInUser(userToLogin);
      toast({
        title: `Welcome, ${userToLogin.name}!`,
        description: `You are now in the ${userToLogin.role.replace('-', ' ')} section.`,
      });
    } else {
       toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: `Your login details did not work.`,
      });
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setSelectedRole("");
    setEmail("");
    setPassword("");
  };

  React.useEffect(() => {
    if (selectedRole) {
      const u = users.find(u => u.role === selectedRole);
      if (u) {
        setEmail(u.email);
        setPassword("DemoPassword123!");
      }
    }
  }, [selectedRole]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderDashboard = () => {
    if (!loggedInUser) return null;

    switch (loggedInUser.role) {
      case 'atl':
        return <AtlDashboard user={loggedInUser} />;
      case 'back-office':
        return <BackOfficeDashboard user={loggedInUser} />;
      case 'supervisor':
        return <SupervisorDashboard user={loggedInUser} />;
      case 'retail-executive':
        return <RetailExecutiveDashboard user={loggedInUser} />;
      case 'merchant-services':
        return <MerchantServicesDashboard user={loggedInUser} />;
      case 'business-banking':
        return <BusinessBankingDashboard user={loggedInUser} />;
      case 'inner-circle':
        return <InnerCircleDashboard user={loggedInUser} />;
      case 'financial-director':
        return <FinancialDirectorDashboard user={loggedInUser} />;
      default:
        return null;
    }
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
              <p className="text-white font-bold tracking-[0.2em] text-[10px] uppercase opacity-80">Simple Sign Up System</p>
          </div>
        </div>

        <Card className="overflow-hidden shadow-2xl border-white/20 bg-white/10 backdrop-blur-xl text-white">
          <CardHeader className="bg-black/20 p-8 text-center border-b border-white/10">
              <CardTitle className="text-2xl font-bold tracking-tight">Secure Sign In</CardTitle>
              <CardDescription className="text-white/60">Enter your details and pick your workspace.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <form onSubmit={handleLogin} className='space-y-5'>
              <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-2" htmlFor="email">
                    <Mail className="h-3 w-3" /> Email Address
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@inbucks.app" 
                    className='h-12 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#7c3aed] transition-all' 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
              </div>
              <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-2" htmlFor="password">
                    <Lock className="h-3 w-3" /> Password
                  </Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••"
                    className='h-12 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#7c3aed] transition-all' 
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
                      <SelectValue placeholder="Pick your workspace..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e1b4b] border-white/20 text-white">
                      <SelectItem value="atl">Team Leaders (ATL)</SelectItem>
                      <SelectItem value="merchant-services">Merchant Team</SelectItem>
                      <SelectItem value="business-banking">Business Banking</SelectItem>
                      <SelectItem value="inner-circle">VIP Team</SelectItem>
                      <SelectItem value="back-office">Admin Team</SelectItem>
                      <SelectItem value="supervisor">Manager</SelectItem>
                      <SelectItem value="retail-executive">Executive Boss</SelectItem>
                      <SelectItem value="financial-director">Finance Boss</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
              
              <Button type="submit" className="w-full h-12 !mt-8 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold shadow-xl border-t border-white/20 transition-all active:scale-[0.98]">
                <LogIn className="mr-2 h-5 w-5"/> Sign In Now
              </Button>
            </form>
          </CardContent>
          <CardFooter className="bg-black/30 p-4 text-center text-[10px] text-white/40 justify-center uppercase tracking-widest border-t border-white/5">
            <ShieldCheck className="mr-2 h-3 w-3 text-accent/50"/> Fully Secured Session
          </CardFooter>
        </Card>
        
        <p className="mt-12 text-center text-white/20 text-[9px] uppercase tracking-[0.4em] font-medium">InnBucks MicroBank Limited &copy; 2026</p>
      </motion.div>
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
                            <p className="text-[10px] uppercase tracking-tighter text-secondary font-bold">Sign Up Portal</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="font-semibold text-white">{loggedInUser.name}</p>
                            <p className="text-[10px] text-white/50 uppercase font-bold">
                                {loggedInUser.role.replace('-', ' ')}
                            </p>
                        </div>
                        <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5 text-white" onClick={handleLogout}>Log Out</Button>
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
