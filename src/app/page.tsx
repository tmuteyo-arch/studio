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
import { users, User } from '@/lib/users';
import { activeUserAtom } from '@/lib/mock-data';
import { Mail, Lock, ShieldCheck, User as UserIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function AppContent() {
  const [loggedInUser, setLoggedInUser] = useAtom(activeUserAtom);
  const { toast } = useToast();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');


  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!email) {
        setError('Please enter an email address.');
        return;
    }

    const userToLogin = users.find(user => user.email.toLowerCase() === email.toLowerCase());

    if (userToLogin) {
      setLoggedInUser(userToLogin);
      toast({
        title: `Welcome, ${userToLogin.name}!`,
        description: `You have successfully logged in as a ${userToLogin.role.replace('-', ' ')}.`,
      });
    } else {
      const errorMessage = 'No user found with that email address.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: errorMessage,
      });
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setEmail('');
    setPassword('');
    setError('');
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
  
  const renderLoginScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#111827] via-[#1a2c58] to-[#4c1d95] p-4 sm:p-8">
      <header className="mb-8 text-center">
        <div className="flex justify-center items-center gap-4 mb-4">
          <Logo className="h-12 w-12 text-white" />
          <h1 className="text-4xl font-bold tracking-tight text-white">InnBucks Agent Onboarding</h1>
        </div>
      </header>
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
          <Card className="overflow-hidden shadow-2xl">
            <CardHeader className="bg-card p-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/20 p-3 rounded-full border-2 border-primary/50">
                  <UserIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-foreground">Welcome Back</CardTitle>
                  <CardDescription>Sign in to access your dashboard</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="bg-background/80 backdrop-blur-sm p-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="e.g. atl1@inbucks.app" 
                      className="pl-10" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                     <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      className="pl-10" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <p className='text-xs text-muted-foreground pt-1'>Hint: Any password will work for demo purposes.</p>
                </div>
                 {error && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <Button type="submit" className="w-full !mt-6">Sign In</Button>
              </form>
            </CardContent>
            <CardFooter className="bg-card p-4 flex items-center justify-center text-xs">
                <ShieldCheck className="h-4 w-4 text-green-500 mr-2"/>
                <p className="text-muted-foreground">Your data is secure and protected.</p>
            </CardFooter>
          </Card>
      </motion.div>
       <div className="mt-8 text-center text-sm text-gray-400">
        <p>Available demo users:</p>
        <div className="flex gap-4 justify-center mt-2 font-mono">
            <span>atl1@inbucks.app</span>
            <span>bo1@inbucks.app</span>
            <span>supervisor1@inbucks.app</span>
        </div>
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
        renderLoginScreen()
      )}
    </div>
  );
}

export default function Home() {
  return (
      <AppContent />
  );
}
