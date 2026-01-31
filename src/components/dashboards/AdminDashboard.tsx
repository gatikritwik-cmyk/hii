import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Users, BookOpen, Calendar, IndianRupee, Plus, Loader2, UserPlus, GraduationCap, X, Trash2, UserX, Globe } from 'lucide-react';
import ContentManagement from '@/components/admin/ContentManagement';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import AttendanceCalendar from '@/components/AttendanceCalendar';

type AppRole = 'admin' | 'tutor' | 'parent';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
}

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

interface Student {
  id: string;
  name: string;
  parent_id: string;
  parent?: Profile;
}

interface Assignment {
  id: string;
  tutor_id: string;
  student_id: string;
  subject: string;
  fee_per_class: number;
  fee_type: 'per_class' | 'per_month';
  tutor?: Profile;
  student?: Student;
}

interface AttendanceCount {
  assignment_id: string;
  count: number;
}

interface FeeDeposit {
  id: string;
  parent_id: string;
  amount: number;
  deposit_date: string;
  notes: string | null;
}

interface ParentFeeOverview {
  parentId: string;
  parentName: string;
  studentNames: string[];
  totalDeposited: number;
  totalCharges: number;
  balance: number;
}

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [attendanceCounts, setAttendanceCounts] = useState<AttendanceCount[]>([]);
  const [feeDeposits, setFeeDeposits] = useState<FeeDeposit[]>([]);
  const [allAttendance, setAllAttendance] = useState<{assignment_id: string; class_date: string; fee_per_class: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositParentId, setDepositParentId] = useState('');
  const [depositNotes, setDepositNotes] = useState('');
  
  // Form states
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole | ''>('');
  const [newStudentName, setNewStudentName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState('');
  const [selectedTutorId, setSelectedTutorId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [feePerClass, setFeePerClass] = useState('');
  const [feeType, setFeeType] = useState<'per_class' | 'per_month'>('per_class');
  
  // Search states
  const [userSearch, setUserSearch] = useState('');
  const [tutorSearch, setTutorSearch] = useState('');
  const [parentSearch, setParentSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [profilesRes, rolesRes, studentsRes, assignmentsRes, depositsRes] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('user_roles').select('*'),
        supabase.from('students').select('*'),
        supabase.from('tutor_student_assignments').select('*'),
        supabase.from('fee_deposits').select('*')
      ]);

      console.log('Fetched students:', studentsRes.data, 'Error:', studentsRes.error);

      if (profilesRes.error) console.error('Profiles error:', profilesRes.error);
      if (rolesRes.error) console.error('Roles error:', rolesRes.error);
      if (studentsRes.error) console.error('Students error:', studentsRes.error);
      if (assignmentsRes.error) console.error('Assignments error:', assignmentsRes.error);
      if (depositsRes.error) console.error('Deposits error:', depositsRes.error);

      if (profilesRes.data) setProfiles(profilesRes.data);
      if (rolesRes.data) setUserRoles(rolesRes.data as UserRole[]);
      if (studentsRes.data) setStudents(studentsRes.data);
      if (assignmentsRes.data) setAssignments(assignmentsRes.data as Assignment[]);
      if (depositsRes.data) setFeeDeposits(depositsRes.data);

      // Fetch attendance counts and all attendance records
      if (assignmentsRes.data) {
        const counts: AttendanceCount[] = [];
        const allAttendanceRecords: {assignment_id: string; class_date: string; fee_per_class: number}[] = [];
        
        for (const assignment of assignmentsRes.data) {
          const { data: attendanceData, count } = await supabase
            .from('attendance')
            .select('*', { count: 'exact' })
            .eq('assignment_id', assignment.id);
          counts.push({ assignment_id: assignment.id, count: count || 0 });
          
          if (attendanceData) {
            attendanceData.forEach(a => {
              allAttendanceRecords.push({
                assignment_id: a.assignment_id,
                class_date: a.class_date,
                fee_per_class: Number(assignment.fee_per_class)
              });
            });
          }
        }
        setAttendanceCounts(counts);
        setAllAttendance(allAttendanceRecords);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const assignRole = async () => {
    if (!selectedUserId || !selectedRole) {
      toast.error('Please select a user and role');
      return;
    }

    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: selectedUserId, role: selectedRole });

    if (error) {
      if (error.code === '23505') {
        toast.error('User already has this role');
      } else {
        toast.error('Failed to assign role');
      }
    } else {
      toast.success('Role assigned successfully');
      setSelectedUserId('');
      setSelectedRole('');
      fetchAllData();
    }
  };

  const removeRole = async (userId: string, role: AppRole) => {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);

    if (error) {
      toast.error('Failed to remove role');
      console.error('Remove role error:', error);
    } else {
      toast.success('Role removed successfully');
      fetchAllData();
    }
  };

  const deleteUser = async (userId: string, userName: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });

      if (error) {
        toast.error('Failed to delete user');
        console.error('Delete user error:', error);
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      toast.success(`${userName} has been permanently removed`);
      fetchAllData();
    } catch (error) {
      toast.error('Failed to delete user');
      console.error('Delete user error:', error);
    }
  };

  const createStudent = async () => {
    if (!newStudentName || !selectedParentId) {
      toast.error('Please enter student name and select parent');
      return;
    }

    const { error } = await supabase
      .from('students')
      .insert({ name: newStudentName, parent_id: selectedParentId });

    if (error) {
      toast.error('Failed to create student');
      console.error('Create student error:', error);
    } else {
      toast.success('Student created successfully');
      setNewStudentName('');
      setSelectedParentId('');
      fetchAllData();
    }
  };

  const deleteStudent = async (studentId: string, studentName: string) => {
    // First delete related assignments and attendance
    const { error: assignmentError } = await supabase
      .from('tutor_student_assignments')
      .delete()
      .eq('student_id', studentId);

    if (assignmentError) {
      toast.error('Failed to remove student assignments');
      console.error('Delete assignments error:', assignmentError);
      return;
    }

    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', studentId);

    if (error) {
      toast.error('Failed to remove student');
      console.error('Delete student error:', error);
    } else {
      toast.success(`${studentName} has been removed from the academy`);
      fetchAllData();
    }
  };

  const createAssignment = async () => {
    if (!selectedTutorId || !selectedStudentId || !selectedSubject || !feePerClass) {
      toast.error('Please fill all fields');
      return;
    }

    const { error } = await supabase
      .from('tutor_student_assignments')
      .insert({
        tutor_id: selectedTutorId,
        student_id: selectedStudentId,
        subject: selectedSubject,
        fee_per_class: parseFloat(feePerClass),
        fee_type: feeType
      });

    if (error) {
      if (error.code === '23505') {
        toast.error('This tutor-student-subject combination already exists');
      } else {
        toast.error('Failed to create assignment');
      }
    } else {
      toast.success('Assignment created successfully');
      setSelectedTutorId('');
      setSelectedStudentId('');
      setSelectedSubject('');
      setFeePerClass('');
      setFeeType('per_class');
      fetchAllData();
    }
  };

  const deleteAssignment = async (assignmentId: string, tutorName: string, studentName: string, subject: string) => {
    // First delete related attendance records
    const { error: attendanceError } = await supabase
      .from('attendance')
      .delete()
      .eq('assignment_id', assignmentId);

    if (attendanceError) {
      toast.error('Failed to remove attendance records');
      console.error('Delete attendance error:', attendanceError);
      return;
    }

    const { error } = await supabase
      .from('tutor_student_assignments')
      .delete()
      .eq('id', assignmentId);

    if (error) {
      toast.error('Failed to remove assignment');
      console.error('Delete assignment error:', error);
    } else {
      toast.success(`Assignment for ${studentName} (${subject}) with ${tutorName} has been removed`);
      fetchAllData();
    }
  };

  const getUserRoles = (userId: string) => {
    return userRoles.filter(r => r.user_id === userId).map(r => r.role);
  };

  const getTutors = () => profiles.filter(p => getUserRoles(p.user_id).includes('tutor'));
  const getParents = () => profiles.filter(p => getUserRoles(p.user_id).includes('parent'));

  const getProfileByUserId = (userId: string) => profiles.find(p => p.user_id === userId);
  const getStudentById = (studentId: string) => students.find(s => s.id === studentId);
  const getAttendanceCount = (assignmentId: string) => 
    attendanceCounts.find(a => a.assignment_id === assignmentId)?.count || 0;

  // Calculate parent fee overview
  const calculateParentFeeOverview = (): ParentFeeOverview[] => {
    const parents = getParents();
    return parents.map(parent => {
      const parentStudents = students.filter(s => s.parent_id === parent.user_id);
      const studentIds = parentStudents.map(s => s.id);
      
      // Get assignments for parent's students
      const parentAssignments = assignments.filter(a => studentIds.includes(a.student_id));
      
      // Calculate total charges from attendance
      let totalCharges = 0;
      parentAssignments.forEach(assignment => {
        const assignmentAttendance = allAttendance.filter(a => a.assignment_id === assignment.id);
        totalCharges += assignmentAttendance.length * Number(assignment.fee_per_class);
      });
      
      // Calculate total deposits
      const parentDeposits = feeDeposits.filter(d => d.parent_id === parent.user_id);
      const totalDeposited = parentDeposits.reduce((sum, d) => sum + Number(d.amount), 0);
      
      return {
        parentId: parent.user_id,
        parentName: parent.full_name,
        studentNames: parentStudents.map(s => s.name),
        totalDeposited,
        totalCharges,
        balance: totalDeposited - totalCharges
      };
    });
  };

  const parentFeeOverview = calculateParentFeeOverview();

  const addFeeDeposit = async () => {
    if (!depositParentId || !depositAmount) {
      toast.error('Please select a parent and enter amount');
      return;
    }

    const { error } = await supabase
      .from('fee_deposits')
      .insert({
        parent_id: depositParentId,
        amount: parseFloat(depositAmount),
        notes: depositNotes || null
      });

    if (error) {
      toast.error('Failed to add fee deposit');
      console.error('Add deposit error:', error);
    } else {
      toast.success('Fee deposit added successfully');
      setDepositParentId('');
      setDepositAmount('');
      setDepositNotes('');
      fetchAllData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{profiles.length}</p>
                <p className="text-sm text-muted-foreground">Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <GraduationCap className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{getTutors().length}</p>
                <p className="text-sm text-muted-foreground">Tutors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{students.length}</p>
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{assignments.length}</p>
                <p className="text-sm text-muted-foreground">Assignments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="users">Users & Roles</TabsTrigger>
          <TabsTrigger value="tutors">Tutors</TabsTrigger>
          <TabsTrigger value="parents">Parents</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="website" className="gap-2">
            <Globe className="h-4 w-4" />
            Website
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assign Role</CardTitle>
              <CardDescription>Assign roles to users who have signed up</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label>User (Search by email)</Label>
                  <div className="relative">
                    <Input
                      placeholder="Search by email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="mb-2"
                    />
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        {profiles
                          .filter(p => 
                            !userSearch || 
                            p.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                            p.full_name.toLowerCase().includes(userSearch.toLowerCase())
                          )
                          .map(profile => (
                            <SelectItem key={profile.user_id} value={profile.user_id}>
                              {profile.full_name} ({profile.email})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex-1">
                  <Label>Role</Label>
                  <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="tutor">Tutor</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={assignRole}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map(profile => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">{profile.full_name}</TableCell>
                      <TableCell>{profile.email}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {getUserRoles(profile.user_id).map(role => (
                            <Badge key={role} variant="secondary" className="capitalize flex items-center gap-1">
                              {role}
                              <button
                                onClick={() => removeRole(profile.user_id, role)}
                                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                                title={`Remove ${role} role`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                          {getUserRoles(profile.user_id).length === 0 && (
                            <span className="text-muted-foreground text-sm">No role assigned</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <UserX className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User Permanently</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to permanently delete <strong>{profile.full_name}</strong>?
                                <span className="block mt-2 text-destructive font-medium">
                                  This action cannot be undone. All their data including roles, profiles, and related records will be removed.
                                </span>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteUser(profile.user_id, profile.full_name)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete Permanently
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tutors Tab */}
        <TabsContent value="tutors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Tutors</CardTitle>
              <CardDescription>Manage tutors who are no longer part of the academy</CardDescription>
            </CardHeader>
            <CardContent>
              {getTutors().length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Assignments</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getTutors().map(tutor => {
                      const tutorAssignments = assignments.filter(a => a.tutor_id === tutor.user_id);
                      return (
                        <TableRow key={tutor.id}>
                          <TableCell className="font-medium">{tutor.full_name}</TableCell>
                          <TableCell>{tutor.email}</TableCell>
                          <TableCell>{tutor.phone || '-'}</TableCell>
                          <TableCell>
                            <Badge>{tutorAssignments.length}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Tutor</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove <strong>{tutor.full_name}</strong> as a tutor? 
                                    {tutorAssignments.length > 0 && (
                                      <span className="block mt-2 text-destructive">
                                        Warning: This tutor has {tutorAssignments.length} active assignment(s). 
                                        Their assignments will remain but you may want to reassign them.
                                      </span>
                                    )}
                                    This will remove their tutor role but keep their account.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => removeRole(tutor.user_id, 'tutor')}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Remove Tutor
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No tutors registered yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Parents Tab */}
        <TabsContent value="parents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Parents</CardTitle>
              <CardDescription>Manage parents who are no longer part of the academy</CardDescription>
            </CardHeader>
            <CardContent>
              {getParents().length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Children</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getParents().map(parent => {
                      const parentStudents = students.filter(s => s.parent_id === parent.user_id);
                      return (
                        <TableRow key={parent.id}>
                          <TableCell className="font-medium">{parent.full_name}</TableCell>
                          <TableCell>{parent.email}</TableCell>
                          <TableCell>{parent.phone || '-'}</TableCell>
                          <TableCell>
                            {parentStudents.length > 0 ? (
                              <div className="flex gap-1 flex-wrap">
                                {parentStudents.map(s => (
                                  <Badge key={s.id} variant="secondary">{s.name}</Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">No children</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Parent</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove <strong>{parent.full_name}</strong> as a parent? 
                                    {parentStudents.length > 0 && (
                                      <span className="block mt-2 text-destructive">
                                        Warning: This parent has {parentStudents.length} student(s) linked to them. 
                                        You should reassign or remove those students first.
                                      </span>
                                    )}
                                    This will remove their parent role but keep their account.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => removeRole(parent.user_id, 'parent')}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Remove Parent
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No parents registered yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Student</CardTitle>
              <CardDescription>Create a new student and link to parent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label>Student Name</Label>
                  <Input
                    placeholder="Enter student name"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Label>Parent (Search by email)</Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Search by email..."
                      value={parentSearch}
                      onChange={(e) => setParentSearch(e.target.value)}
                    />
                    <Select value={selectedParentId} onValueChange={setSelectedParentId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent" />
                      </SelectTrigger>
                      <SelectContent>
                        {getParents()
                          .filter(p => 
                            !parentSearch || 
                            p.email.toLowerCase().includes(parentSearch.toLowerCase()) ||
                            p.full_name.toLowerCase().includes(parentSearch.toLowerCase())
                          )
                          .map(parent => (
                            <SelectItem key={parent.user_id} value={parent.user_id}>
                              {parent.full_name} ({parent.email})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-end">
                  <Button onClick={createStudent}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Student
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Students</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map(student => {
                    const parent = getProfileByUserId(student.parent_id);
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{parent?.full_name || 'Unknown'}</TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Student</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove <strong>{student.name}</strong> from the academy? 
                                  This will also delete all their tutor assignments and attendance records. 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteStudent(student.id, student.name)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remove Student
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Assignment</CardTitle>
              <CardDescription>Assign a tutor to a student for a subject</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <Label>Tutor (Search by email)</Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Search tutor..."
                      value={tutorSearch}
                      onChange={(e) => setTutorSearch(e.target.value)}
                      className="h-9"
                    />
                    <Select value={selectedTutorId} onValueChange={setSelectedTutorId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tutor" />
                      </SelectTrigger>
                      <SelectContent>
                        {getTutors()
                          .filter(t => 
                            !tutorSearch || 
                            t.email.toLowerCase().includes(tutorSearch.toLowerCase()) ||
                            t.full_name.toLowerCase().includes(tutorSearch.toLowerCase())
                          )
                          .map(tutor => (
                            <SelectItem key={tutor.user_id} value={tutor.user_id}>
                              {tutor.full_name} ({tutor.email})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Student (Search)</Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Search student..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="h-9"
                    />
                    <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students
                          .filter(s => 
                            !studentSearch || 
                            s.name.toLowerCase().includes(studentSearch.toLowerCase())
                          )
                          .map(student => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Subject</Label>
                  <Input
                    placeholder="e.g. Mathematics"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Fee Type</Label>
                  <Select value={feeType} onValueChange={(value: 'per_class' | 'per_month') => setFeeType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fee type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="per_class">Per Class</SelectItem>
                      <SelectItem value="per_month">Per Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{feeType === 'per_class' ? 'Fee per Class' : 'Fee per Month'}</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={feePerClass}
                    onChange={(e) => setFeePerClass(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={createAssignment} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tutor</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Fee Type</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Classes Done</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map(assignment => {
                    const tutor = getProfileByUserId(assignment.tutor_id);
                    const student = getStudentById(assignment.student_id);
                    const classCount = getAttendanceCount(assignment.id);
                    const feeTypeLabel = assignment.fee_type === 'per_month' ? 'Per Month' : 'Per Class';
                    return (
                      <TableRow key={assignment.id}>
                        <TableCell>{tutor?.full_name || 'Unknown'}</TableCell>
                        <TableCell>{student?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{assignment.subject}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={assignment.fee_type === 'per_month' ? 'secondary' : 'default'}>
                            {feeTypeLabel}
                          </Badge>
                        </TableCell>
                        <TableCell>₹{Number(assignment.fee_per_class).toFixed(0)}</TableCell>
                        <TableCell>
                          <Badge>{classCount}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Assignment</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove this assignment?
                                  <br /><br />
                                  <strong>Tutor:</strong> {tutor?.full_name || 'Unknown'}<br />
                                  <strong>Student:</strong> {student?.name || 'Unknown'}<br />
                                  <strong>Subject:</strong> {assignment.subject}<br />
                                  <strong>Classes Completed:</strong> {classCount}
                                  <br /><br />
                                  This will also delete all {classCount} attendance records for this assignment. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteAssignment(assignment.id, tutor?.full_name || 'Unknown', student?.name || 'Unknown', assignment.subject)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remove Assignment
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fees Tab */}
        <TabsContent value="fees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Fee Deposit</CardTitle>
              <CardDescription>Record fee deposits received from parents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label>Parent</Label>
                  <Select value={depositParentId} onValueChange={setDepositParentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent" />
                    </SelectTrigger>
                    <SelectContent>
                      {getParents().map(parent => (
                        <SelectItem key={parent.user_id} value={parent.user_id}>
                          {parent.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label>Amount (₹)</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Label>Notes (optional)</Label>
                  <Input
                    placeholder="e.g. For January 2024"
                    value={depositNotes}
                    onChange={(e) => setDepositNotes(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addFeeDeposit}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Deposit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Parent Fee Overview</CardTitle>
              <CardDescription>Track deposits, charges and balances for each parent</CardDescription>
            </CardHeader>
            <CardContent>
              {parentFeeOverview.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parent</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Fees Deposited</TableHead>
                      <TableHead>Total Charges</TableHead>
                      <TableHead>Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parentFeeOverview.map((overview) => (
                      <TableRow key={overview.parentId}>
                        <TableCell className="font-medium">{overview.parentName}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {overview.studentNames.map((name, i) => (
                              <Badge key={i} variant="secondary">{name}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-green-600 font-medium">₹{Math.round(overview.totalDeposited)}</TableCell>
                        <TableCell className="text-orange-600 font-medium">₹{Math.round(overview.totalCharges)}</TableCell>
                        <TableCell className={`font-semibold ${overview.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          ₹{Math.round(Math.abs(overview.balance))} {overview.balance < 0 ? 'Due' : 'Credit'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No parents registered yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map(assignment => {
              const student = getStudentById(assignment.student_id);
              const tutor = getProfileByUserId(assignment.tutor_id);
              return (
                <div key={assignment.id}>
                  <p className="text-sm text-muted-foreground mb-2">
                    Tutor: {tutor?.full_name}
                  </p>
                  <AttendanceCalendar
                    assignmentId={assignment.id}
                    studentName={student?.name || 'Unknown'}
                    subject={assignment.subject}
                    canMark={true}
                  />
                </div>
              );
            })}
            {assignments.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center text-muted-foreground">
                  No assignments yet. Create assignments in the Assignments tab.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Website Content Management Tab */}
        <TabsContent value="website">
          <ContentManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
