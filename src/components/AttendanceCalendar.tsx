import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format, isSameDay } from 'date-fns';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface AttendanceCalendarProps {
  assignmentId: string;
  studentName: string;
  subject: string;
  canMark?: boolean;
}

interface AttendanceRecord {
  id: string;
  class_date: string;
  notes: string | null;
}

export default function AttendanceCalendar({ 
  assignmentId, 
  studentName, 
  subject, 
  canMark = false 
}: AttendanceCalendarProps) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchAttendance();
  }, [assignmentId]);

  const fetchAttendance = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('assignment_id', assignmentId)
      .order('class_date', { ascending: false });

    if (error) {
      console.error('Error fetching attendance:', error);
    } else {
      setAttendance(data || []);
    }
    setLoading(false);
  };

  const handleDateSelect = async (date: Date | undefined) => {
    if (!date || !canMark || !user) return;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const existingRecord = attendance.find(a => a.class_date === dateStr);
    
    if (existingRecord) {
      // Remove attendance
      setMarking(true);
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('id', existingRecord.id);
      
      if (error) {
        toast.error('Failed to remove attendance');
      } else {
        toast.success('Attendance removed');
        setAttendance(prev => prev.filter(a => a.id !== existingRecord.id));
      }
      setMarking(false);
    } else {
      // Mark attendance
      setMarking(true);
      const { data, error } = await supabase
        .from('attendance')
        .insert({
          assignment_id: assignmentId,
          class_date: dateStr,
          marked_by: user.id
        })
        .select()
        .single();
      
      if (error) {
        toast.error('Failed to mark attendance');
      } else {
        toast.success('Attendance marked!');
        setAttendance(prev => [...prev, data]);
      }
      setMarking(false);
    }
  };

  const attendedDates = attendance.map(a => new Date(a.class_date));
  
  const modifiers = {
    attended: attendedDates
  };

  const modifiersStyles = {
    attended: {
      backgroundColor: 'hsl(var(--primary))',
      color: 'hsl(var(--primary-foreground))',
      borderRadius: '50%'
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{studentName}</CardTitle>
            <Badge variant="secondary" className="mt-1">{subject}</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>{attendance.length} classes</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          onSelect={handleDateSelect}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          disabled={marking || !canMark}
          className="rounded-md border"
        />
        {canMark && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Click on a date to mark/unmark attendance
          </p>
        )}
      </CardContent>
    </Card>
  );
}
