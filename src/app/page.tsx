'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import AtlDashboard from '@/components/roles/atl-dashboard';
import BackOfficeDashboard from '@/components/roles/back-office-dashboard';
import SupervisorDashboard from '@/components/roles/supervisor-dashboard';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { users, User, Role } from '@/lib/users';
import { activeUserAtom } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

function AppContent() {
  const [loggedInUser, setLoggedInUser] = useAtom(activeUserAtom);
  const { toast } = useToast();

  const handleRoleLogin = (role: Role) => {
    const userToLogin = users.find(u => u.role === role);
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
        description: `Could not find a user for the role: ${role}`,
      });
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
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
      default:
        return null;
    }
  };
  
  const renderRoleSelection = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-8 text-center">
       <div className="flex items-center gap-4 mb-4">
        <Logo className="h-10 w-10" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground">InnBucks Agent Onboarding</h1>
      </div>
      <h2 className="text-2xl font-semibold text-primary mb-2">Select a Role to Continue</h2>
      <p className="text-muted-foreground mb-12">Simulate the login for different user roles in the system.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <Card className="text-left h-full flex flex-col">
                <CardHeader>
                    <CardTitle>ATL</CardTitle>
                    <CardDescription>Account Taking Leaders who submit applications.</CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto">
                    <Button className="w-full" onClick={() => handleRoleLogin('atl')}>Login as ATL</Button>
                </CardFooter>
            </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Card className="text-left h-full flex flex-col">
                <CardHeader>
                    <CardTitle>Back Office</CardTitle>
                    <CardDescription>Officers who validate and process applications.</CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto">
                    <Button className="w-full" variant="secondary" onClick={() => handleRoleLogin('back-office')}>Login as Back Office</Button>
                </CardFooter>
            </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <Card className="text-left h-full flex flex-col">
                <CardHeader>
                    <CardTitle>Supervisor</CardTitle>
                    <CardDescription>Supervisors who review, approve, or reject applications.</CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto">
                    <Button className="w-full" variant="outline" style={{borderColor: 'hsl(var(--chart-2))', color: 'hsl(var(--chart-2))'}} onClick={() => handleRoleLogin('supervisor')}>Login as Supervisor</Button>
                </CardFooter>
            </Card>
        </motion.div>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-background min-h-screen">
      {loggedInUser ? (
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
      ) : (
        renderRoleSelection()
      )}
    </div>
  );
}

export default function Home() {
  return (
      <AppContent />
  );
}
