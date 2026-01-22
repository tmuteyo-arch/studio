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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { users, User, Role } from '@/lib/users';
import { activeUserAtom } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Mail, Lock, LogIn, User as UserIcon, ShieldCheck, Crown } from 'lucide-react';

function AppContent() {
  const [loggedInUser, setLoggedInUser] = useAtom(activeUserAtom);
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null);
  const { toast } = useToast();

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const userToLogin = users.find(u => u.role === selectedRole);
    if (userToLogin) {
      setLoggedInUser(userToLogin);
      toast({
        title: `Welcome, ${userToLogin.name}!`,
        description: `You are now logged in as a ${userToLogin.role.replace('-', ' ')}.`,
      });
    } else {
       toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: `Could not find a user for the role: ${selectedRole}`,
      });
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setSelectedRole(null);
  };

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
      default:
        return null;
    }
  };

  const renderLoginForm = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <Card className="overflow-hidden shadow-2xl">
          <div className="bg-slate-900 p-6 text-center text-card-foreground">
              <UserIcon className="mx-auto h-8 w-8 mb-2 text-primary"/>
              <h2 className="text-2xl font-bold">Welcome Back</h2>
              <p className="text-sm text-muted-foreground">Sign in to access your {selectedRole?.replace('-', ' ')} dashboard.</p>
          </div>
          <CardContent className="p-6 space-y-4">
            <form onSubmit={handleLogin} className='space-y-4'>
              <div className="space-y-2">
                  <label className="text-sm font-medium leading-none flex items-center gap-2" htmlFor="email"><Mail className="h-4 w-4 text-muted-foreground" />Email Address</label>
                  <Input id="email" type="email" placeholder="email@example.com" required defaultValue={users.find(u => u.role === selectedRole)?.email}/>
              </div>
              <div className="space-y-2">
                  <label className="text-sm font-medium leading-none flex items-center gap-2" htmlFor="password"><Lock className="h-4 w-4 text-muted-foreground"/>Password</label>
                  <Input id="password" type="password" required defaultValue="password"/>
              </div>
              <Button type="submit" className="w-full !mt-6">
                <LogIn className="mr-2 h-4 w-4"/> Sign In
              </Button>
            </form>
          </CardContent>
          <CardFooter className="bg-slate-50 dark:bg-slate-900/50 p-4 text-center text-xs text-muted-foreground justify-center">
            <ShieldCheck className="mr-2 h-4 w-4 text-green-500"/> Your data is secure and protected
          </CardFooter>
        </Card>
        <Button variant="link" className="mt-4 text-white/80" onClick={() => setSelectedRole(null)}>
          Back to role selection
        </Button>
      </motion.div>
    </div>
  );
  
  const renderRoleSelection = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8 text-center">
       <div className="flex items-center gap-4 mb-4">
        <Logo className="h-10 w-10" />
        <h1 className="text-3xl font-bold tracking-tight text-white">InnBucks Agent Onboarding</h1>
      </div>
      <h2 className="text-2xl font-semibold text-white/90 mb-2">Select a Role to Continue</h2>
      <p className="text-white/70 mb-12">Choose a role to proceed to the login screen.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <Card className="text-left h-full flex flex-col bg-white/10 backdrop-blur-lg border-white/20 text-white">
                <CardHeader>
                    <CardTitle>ATL</CardTitle>
                    <CardDescription className="text-white/80">Account Taking Leaders who submit applications.</CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => handleRoleSelect('atl')}>Login as ATL</Button>
                </CardFooter>
            </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Card className="text-left h-full flex flex-col bg-white/10 backdrop-blur-lg border-white/20 text-white">
                <CardHeader>
                    <CardTitle>Back Office</CardTitle>
                    <CardDescription className="text-white/80">Officers who validate and process applications.</CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto">
                    <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80" onClick={() => handleRoleSelect('back-office')}>Login as Back Office</Button>
                </CardFooter>
            </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <Card className="text-left h-full flex flex-col bg-white/10 backdrop-blur-lg border-white/20 text-white">
                <CardHeader>
                    <CardTitle>Supervisor</CardTitle>
                    <CardDescription className="text-white/80">Supervisors who review, approve, or reject applications.</CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto">
                    <Button className="w-full" variant="outline" onClick={() => handleRoleSelect('supervisor')}>Login as Supervisor</Button>
                </CardFooter>
            </Card>
        </motion.div>
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
            <Card className="text-left h-full flex flex-col bg-white/10 backdrop-blur-lg border-white/20 text-white">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Retail Executive</CardTitle>
                        <Crown className="text-amber-400" />
                    </div>
                    <CardDescription className="text-white/80">Oversees all operations and high-level performance.</CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto">
                    <Button className="w-full border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black" variant="outline" onClick={() => handleRoleSelect('retail-executive')}>Login as Executive</Button>
                </CardFooter>
            </Card>
        </motion.div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loggedInUser) {
        return (
            <div className="p-4 sm:p-8 max-w-7xl mx-auto">
                <header className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Logo className="h-8 w-8" />
                        <h1 className="text-2xl font-bold text-foreground">InnBucks Agent Onboarding</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                        <p className="font-semibold">{loggedInUser.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{loggedInUser.role.replace('-', ' ')}</p>
                        </div>
                        <Button variant="outline" onClick={handleLogout}>Log Out</Button>
                    </div>
                </header>
                <main>{renderDashboard()}</main>
            </div>
        );
    }
    if (selectedRole) {
        return renderLoginForm();
    }
    return renderRoleSelection();
  }

  return (
    <div className="w-full bg-background min-h-screen">
      {renderContent()}
    </div>
  );
}

export default function Home() {
  return (
      <AppContent />
  );
}
