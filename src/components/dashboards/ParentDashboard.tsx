import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Users, Calendar, IndianRupee, BookOpen, Wallet, Receipt, Scale } from 'lucide-react';
import AttendanceCalendar from '@/components/AttendanceCalendar';

interface Student {
  id: string;
  name: string;
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
}

interface Assignment {
  id: string;
  tutor_id: string;
  student_id: string;
  subject: string;
  fee_per_class: number;
}

interface AttendanceRecord {
  id: string;
  assignment_id: string;
  class_date: string;
}

interface FeeDeposit {
  id: string;
  parent_id: string;
  amount: number;
  deposit_date: string;
  notes: string | null;
}

interface MonthlyFee {
  month: number;
  year: number;
  studentName: string;
  subject: string;
  tutorName: string;
  classCount: number;
  totalFee: number;
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [tutors, setTutors] = useState<Profile[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [feeDeposits, setFeeDeposits] = useState<FeeDeposit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch students for this parent
      const { data: studentsData } = await supabase
        .from('students')
        .select('*')
        .eq('parent_id', user?.id);

      // Fetch fee deposits
      const { data: depositsData } = await supabase
        .from('fee_deposits')
        .select('*')
        .eq('parent_id', user?.id);

      if (depositsData) setFeeDeposits(depositsData);

      if (studentsData) {
        setStudents(studentsData);

        // Fetch assignments for these students
        const studentIds = studentsData.map(s => s.id);
        if (studentIds.length > 0) {
          const { data: assignmentsData } = await supabase
            .from('tutor_student_assignments')
            .select('*')
            .in('student_id', studentIds);

          if (assignmentsData) {
            setAssignments(assignmentsData);

            // Fetch tutors - get all unique tutor IDs
            const tutorIds = [...new Set(assignmentsData.map(a => a.tutor_id))];
            if (tutorIds.length > 0) {
              const { data: tutorsData, error: tutorError } = await supabase
                .from('profiles')
                .select('*')
                .in('user_id', tutorIds);
              
              console.log('Fetched tutors:', tutorsData, 'Error:', tutorError);
              if (tutorsData) setTutors(tutorsData);
            }

            // Fetch attendance for all assignments
            const assignmentIds = assignmentsData.map(a => a.id);
            const { data: attendanceData } = await supabase
              .from('attendance')
              .select('*')
              .in('assignment_id', assignmentIds);
            if (attendanceData) setAttendance(attendanceData);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const getStudentById = (studentId: string) => students.find(s => s.id === studentId);
  const getTutorByUserId = (userId: string) => tutors.find(t => t.user_id === userId);

  // Get current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Calculate monthly fees
  const calculateMonthlyFees = (): MonthlyFee[] => {
    const fees: MonthlyFee[] = [];
    
    assignments.forEach(assignment => {
      const student = getStudentById(assignment.student_id);
      const tutor = getTutorByUserId(assignment.tutor_id);
      
      // Group attendance by month
      const assignmentAttendance = attendance.filter(a => a.assignment_id === assignment.id);
      const monthlyGroups: { [key: string]: AttendanceRecord[] } = {};
      
      assignmentAttendance.forEach(record => {
        const date = new Date(record.class_date);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        if (!monthlyGroups[key]) monthlyGroups[key] = [];
        monthlyGroups[key].push(record);
      });
      
      Object.entries(monthlyGroups).forEach(([key, records]) => {
        const [year, month] = key.split('-').map(Number);
        fees.push({
          month: month + 1,
          year,
          studentName: student?.name || 'Unknown',
          subject: assignment.subject,
          tutorName: tutor?.full_name || 'Unknown',
          classCount: records.length,
          totalFee: records.length * Number(assignment.fee_per_class)
        });
      });
    });
    
    return fees.sort((a, b) => (b.year - a.year) || (b.month - a.month));
  };

  const monthlyFees = calculateMonthlyFees();
  const totalClasses = attendance.length;
  
  // Calculate current month charges
  const currentMonthFees = monthlyFees.filter(f => f.month === currentMonth && f.year === currentYear);
  const chargesForMonth = currentMonthFees.reduce((sum, f) => sum + f.totalFee, 0);
  
  // Total deposited amount
  const totalDeposited = feeDeposits.reduce((sum, d) => sum + Number(d.amount), 0);
  
  // Total all-time charges
  const totalCharges = monthlyFees.reduce((sum, f) => sum + f.totalFee, 0);
  
  // Balance = deposited - all charges
  const balance = totalDeposited - totalCharges;

  const getMonthName = (month: number) => {
    return new Date(2000, month - 1).toLocaleString('default', { month: 'long' });
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{students.length}</p>
                <p className="text-sm text-muted-foreground">Children</p>
                {students.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {students.map(s => s.name).join(', ')}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold">{assignments.length}</p>
                <p className="text-sm text-muted-foreground">Subjects</p>
                {assignments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {assignments.map(a => {
                      const student = getStudentById(a.student_id);
                      return (
                        <p key={a.id} className="text-xs text-muted-foreground">
                          {student?.name} - {a.subject}, ₹{Math.round(Number(a.fee_per_class))}/class
                        </p>
                      );
                    })}
                  </div>
                )}
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
                <p className="text-2xl font-bold">{totalClasses}</p>
                <p className="text-sm text-muted-foreground">Total Classes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <IndianRupee className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">₹{Math.round(totalCharges)}</p>
                <p className="text-sm text-muted-foreground">Total Charges</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee Summary Boxes */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Overview - {getMonthName(currentMonth)} {currentYear}</CardTitle>
          <CardDescription>Your current fee status and balance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-green-500/30 bg-green-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Wallet className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">₹{Math.round(totalDeposited)}</p>
                    <p className="text-sm text-muted-foreground">Fees Deposited</p>
                    <p className="text-xs text-muted-foreground">Total advance paid</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-orange-500/30 bg-orange-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Receipt className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">₹{Math.round(chargesForMonth)}</p>
                    <p className="text-sm text-muted-foreground">Charges for {getMonthName(currentMonth)}</p>
                    <p className="text-xs text-muted-foreground">Based on classes conducted</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className={`${balance >= 0 ? 'border-blue-500/30 bg-blue-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={`p-2 ${balance >= 0 ? 'bg-blue-500/10' : 'bg-red-500/10'} rounded-lg`}>
                    <Scale className={`h-6 w-6 ${balance >= 0 ? 'text-blue-500' : 'text-red-500'}`} />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {balance < 0 ? '-' : ''}₹{Math.round(Math.abs(balance))} {balance < 0 ? 'Due' : ''}
                    </p>
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p className="text-xs text-muted-foreground">Deposit - Total Charges</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Fee Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Summary</CardTitle>
          <CardDescription>Monthly breakdown of fees based on classes conducted</CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyFees.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Classes</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyFees.map((fee, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {getMonthName(fee.month)} {fee.year}
                    </TableCell>
                    <TableCell className="font-medium">{fee.studentName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{fee.subject}</Badge>
                    </TableCell>
                    <TableCell>{fee.tutorName}</TableCell>
                    <TableCell>
                      <Badge>{fee.classCount}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">₹{Math.round(fee.totalFee)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No classes have been conducted yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Attendance Calendars */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Class Attendance</h2>
        <p className="text-muted-foreground mb-6">
          View the attendance calendar for each subject. Highlighted dates show when classes were conducted.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map(assignment => {
            const student = getStudentById(assignment.student_id);
            const tutor = getTutorByUserId(assignment.tutor_id);
            return (
              <div key={assignment.id}>
                <p className="text-sm font-medium mb-1">
                  {student?.name} - {assignment.subject}
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  Tutor: {tutor?.full_name || 'Not assigned'}
                </p>
                <AttendanceCalendar
                  assignmentId={assignment.id}
                  studentName={student?.name || 'Unknown'}
                  subject={assignment.subject}
                  canMark={false}
                />
              </div>
            );
          })}
          {assignments.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center text-muted-foreground">
                No students or subjects assigned yet. Please contact the admin.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}