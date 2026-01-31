import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import TutorDashboard from '@/components/dashboards/TutorDashboard';
import ParentDashboard from '@/components/dashboards/ParentDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogOut } from 'lucide-react';
import logo from '@/assets/logo.png';

export default function Dashboard() {
  const { user, profile, roles, loading, signOut, hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth', { replace: true });
  };

  // No roles assigned yet
  if (roles.length === 0) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
          <div className="mx-auto mb-4">
            <img src={logo} alt="RG's E-Learning" className="h-20 w-auto mx-auto" />
          </div>
          <CardTitle>Welcome, {profile?.full_name || 'User'}!</CardTitle>
          <CardDescription>
              Your account has been created successfully. Please wait for the admin to assign your role (Tutor or Parent).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSignOut} variant="outline" className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="RG's E-Learning" className="h-10 w-auto" />
            <div>
              <h1 className="font-bold text-lg">RG's E-Learning</h1>
              <p className="text-xs text-muted-foreground capitalize">
                {roles.join(', ')} Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm hidden sm:block">{profile?.full_name}</span>
            <Button onClick={handleSignOut} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {hasRole('admin') && <AdminDashboard />}
        {hasRole('tutor') && !hasRole('admin') && <TutorDashboard />}
        {hasRole('parent') && !hasRole('admin') && !hasRole('tutor') && <ParentDashboard />}
      </main>
    </div>
  );
}
