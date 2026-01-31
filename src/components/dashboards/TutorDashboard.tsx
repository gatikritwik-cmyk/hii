import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Calendar, BookOpen } from 'lucide-react';
import AttendanceCalendar from '@/components/AttendanceCalendar';

interface Student {
  id: string;
  name: string;
}

interface Assignment {
  id: string;
  student_id: string;
  subject: string;
  fee_per_class: number;
  student?: Student;
}

interface AttendanceCount {
  assignment_id: string;
  count: number;
}

export default function TutorDashboard() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceCounts, setAttendanceCounts] = useState<AttendanceCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch assignments for this tutor
      const { data: assignmentsData } = await supabase
        .from('tutor_student_assignments')
        .select('*')
        .eq('tutor_id', user?.id);

      if (assignmentsData) {
        setAssignments(assignmentsData);

        // Fetch students
        const studentIds = [...new Set(assignmentsData.map(a => a.student_id))];
        if (studentIds.length > 0) {
          const { data: studentsData } = await supabase
            .from('students')
            .select('*')
            .in('id', studentIds);
          if (studentsData) setStudents(studentsData);
        }

        // Fetch attendance counts
        const counts: AttendanceCount[] = [];
        for (const assignment of assignmentsData) {
          const { count } = await supabase
            .from('attendance')
            .select('*', { count: 'exact', head: true })
            .eq('assignment_id', assignment.id);
          counts.push({ assignment_id: assignment.id, count: count || 0 });
        }
        setAttendanceCounts(counts);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const getStudentById = (studentId: string) => students.find(s => s.id === studentId);
  const getAttendanceCount = (assignmentId: string) => 
    attendanceCounts.find(a => a.assignment_id === assignmentId)?.count || 0;

  const totalClasses = attendanceCounts.reduce((sum, a) => sum + a.count, 0);
  const uniqueStudents = new Set(assignments.map(a => a.student_id)).size;

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{uniqueStudents}</p>
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{assignments.length}</p>
                <p className="text-sm text-muted-foreground">Subjects</p>
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
                <p className="text-sm text-muted-foreground">Classes Conducted</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Calendars */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Mark Attendance</h2>
        <p className="text-muted-foreground mb-6">
          Click on a date to mark attendance for each student. The highlighted dates show classes already conducted.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map(assignment => {
            const student = getStudentById(assignment.student_id);
            return (
              <AttendanceCalendar
                key={assignment.id}
                assignmentId={assignment.id}
                studentName={student?.name || 'Unknown'}
                subject={assignment.subject}
                canMark={true}
              />
            );
          })}
          {assignments.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center text-muted-foreground">
                No students assigned yet. Please wait for admin to assign students to you.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
