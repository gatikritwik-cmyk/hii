import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Loader2, Trash2, Save, Star, Globe, Users, MessageSquare, FileText, Upload, Image, Pencil } from 'lucide-react';

interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
}

interface FeaturedTutor {
  id: string;
  name: string;
  subject: string;
  qualification: string | null;
  experience: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
}

interface Testimonial {
  id: string;
  student_name: string;
  parent_name: string | null;
  rating: number;
  review_text: string;
  course: string | null;
  is_active: boolean;
  display_order: number;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string;
  display_order: number;
  is_active: boolean;
}

interface DemoRequest {
  id: string;
  parent_name: string;
  student_name: string;
  phone: string;
  email: string | null;
  grade: string | null;
  subject: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

export default function ContentManagement() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [tutors, setTutors] = useState<FeaturedTutor[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [demoRequests, setDemoRequests] = useState<DemoRequest[]>([]);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [editingTutor, setEditingTutor] = useState<FeaturedTutor | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form states
  const [newTutor, setNewTutor] = useState({ name: '', subject: '', qualification: '', experience: '', image_url: '' });
  const [newTestimonial, setNewTestimonial] = useState({ student_name: '', parent_name: '', rating: 5, review_text: '', course: '' });
  const [newCourse, setNewCourse] = useState({ title: '', description: '', category: 'subjects' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [settingsRes, tutorsRes, testimonialsRes, coursesRes, demoRes] = await Promise.all([
        supabase.from('site_settings').select('*'),
        supabase.from('featured_tutors').select('*').order('display_order'),
        supabase.from('testimonials').select('*').order('display_order'),
        supabase.from('courses').select('*').order('display_order'),
        supabase.from('demo_requests').select('*').order('created_at', { ascending: false })
      ]);

      if (settingsRes.data) setSettings(settingsRes.data);
      if (tutorsRes.data) setTutors(tutorsRes.data);
      if (testimonialsRes.data) setTestimonials(testimonialsRes.data);
      if (coursesRes.data) setCourses(coursesRes.data);
      if (demoRes.data) setDemoRequests(demoRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const updateSetting = async (key: string, value: string) => {
    const { error } = await supabase
      .from('site_settings')
      .update({ setting_value: value, updated_at: new Date().toISOString() })
      .eq('setting_key', key);

    if (error) {
      toast.error('Failed to update setting');
    } else {
      toast.success('Setting updated');
      fetchData();
    }
  };

  const uploadTutorImage = async (file: File, tutorId: string) => {
    setUploadingImage(tutorId);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${tutorId}-${Date.now()}.${fileExt}`;
      const filePath = `tutors/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('tutor-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('tutor-images')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('featured_tutors')
        .update({ image_url: publicUrl })
        .eq('id', tutorId);

      if (updateError) throw updateError;

      toast.success('Image uploaded successfully');
      fetchData();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    }
    setUploadingImage(null);
  };

  const handleImageUpload = (tutorId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        uploadTutorImage(file, tutorId);
      }
    };
    input.click();
  };

  const addTutor = async () => {
    if (!newTutor.name || !newTutor.subject) {
      toast.error('Name and subject are required');
      return;
    }

    const { error } = await supabase
      .from('featured_tutors')
      .insert({
        ...newTutor,
        display_order: tutors.length
      });

    if (error) {
      toast.error('Failed to add tutor');
    } else {
      toast.success('Tutor added');
      setNewTutor({ name: '', subject: '', qualification: '', experience: '', image_url: '' });
      fetchData();
    }
  };

  const updateTutor = async () => {
    if (!editingTutor) return;

    const { error } = await supabase
      .from('featured_tutors')
      .update({
        name: editingTutor.name,
        subject: editingTutor.subject,
        qualification: editingTutor.qualification,
        experience: editingTutor.experience
      })
      .eq('id', editingTutor.id);

    if (error) {
      toast.error('Failed to update tutor');
    } else {
      toast.success('Tutor updated');
      setEditingTutor(null);
      fetchData();
    }
  };

  const toggleTutor = async (id: string, is_active: boolean) => {
    const { error } = await supabase
      .from('featured_tutors')
      .update({ is_active: !is_active })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update tutor');
    } else {
      fetchData();
    }
  };

  const deleteTutor = async (id: string) => {
    const { error } = await supabase.from('featured_tutors').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete tutor');
    } else {
      toast.success('Tutor deleted');
      fetchData();
    }
  };

  const addTestimonial = async () => {
    if (!newTestimonial.student_name || !newTestimonial.review_text) {
      toast.error('Student name and review are required');
      return;
    }

    const { error } = await supabase
      .from('testimonials')
      .insert({
        ...newTestimonial,
        display_order: testimonials.length
      });

    if (error) {
      toast.error('Failed to add testimonial');
    } else {
      toast.success('Testimonial added');
      setNewTestimonial({ student_name: '', parent_name: '', rating: 5, review_text: '', course: '' });
      fetchData();
    }
  };

  const toggleTestimonial = async (id: string, is_active: boolean) => {
    const { error } = await supabase
      .from('testimonials')
      .update({ is_active: !is_active })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update testimonial');
    } else {
      fetchData();
    }
  };

  const deleteTestimonial = async (id: string) => {
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete testimonial');
    } else {
      toast.success('Testimonial deleted');
      fetchData();
    }
  };

  const addCourse = async () => {
    if (!newCourse.title) {
      toast.error('Course title is required');
      return;
    }

    const { error } = await supabase
      .from('courses')
      .insert({
        ...newCourse,
        display_order: courses.length
      });

    if (error) {
      toast.error('Failed to add course');
    } else {
      toast.success('Course added');
      setNewCourse({ title: '', description: '', category: 'subjects' });
      fetchData();
    }
  };

  const toggleCourse = async (id: string, is_active: boolean) => {
    const { error } = await supabase
      .from('courses')
      .update({ is_active: !is_active })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update course');
    } else {
      fetchData();
    }
  };

  const deleteCourse = async (id: string) => {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete course');
    } else {
      toast.success('Course deleted');
      fetchData();
    }
  };

  const updateDemoStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('demo_requests')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success('Status updated');
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const settingsLabels: Record<string, string> = {
    hero_title: 'Hero Title',
    hero_subtitle: 'Hero Subtitle',
    hero_description: 'Hero Description',
    contact_phone: 'Contact Phone',
    contact_email: 'Contact Email',
    contact_whatsapp: 'WhatsApp Number',
    stat_students: 'Students Count',
    stat_classes: 'Classes Count',
    stat_satisfaction: 'Satisfaction Rate',
    stat_tutors: 'Tutors Count',
    about_text: 'About Us Text',
    about_point_1: 'Why Choose Us - Point 1',
    about_point_2: 'Why Choose Us - Point 2',
    about_point_3: 'Why Choose Us - Point 3',
    about_point_4: 'Why Choose Us - Point 4'
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="settings" className="gap-2">
            <Globe className="h-4 w-4" />
            Site Settings
          </TabsTrigger>
          <TabsTrigger value="tutors" className="gap-2">
            <Users className="h-4 w-4" />
            Featured Tutors
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Testimonials
          </TabsTrigger>
          <TabsTrigger value="courses" className="gap-2">
            <FileText className="h-4 w-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="demos" className="gap-2">
            <Star className="h-4 w-4" />
            Demo Requests
          </TabsTrigger>
        </TabsList>

        {/* Site Settings */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Homepage Settings</CardTitle>
              <CardDescription>Manage your website content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {settings.map((setting) => (
                <div key={setting.id} className="space-y-2">
                  <Label>{settingsLabels[setting.setting_key] || setting.setting_key}</Label>
                  {setting.setting_key.includes('text') || setting.setting_key.includes('description') ? (
                    <Textarea
                      defaultValue={setting.setting_value}
                      onBlur={(e) => updateSetting(setting.setting_key, e.target.value)}
                      rows={3}
                    />
                  ) : (
                    <Input
                      defaultValue={setting.setting_value}
                      onBlur={(e) => updateSetting(setting.setting_key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Featured Tutors */}
        <TabsContent value="tutors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Featured Tutor</CardTitle>
              <CardDescription>Add tutors to display on homepage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Input
                  placeholder="Name"
                  value={newTutor.name}
                  onChange={(e) => setNewTutor({ ...newTutor, name: e.target.value })}
                />
                <Input
                  placeholder="Subject"
                  value={newTutor.subject}
                  onChange={(e) => setNewTutor({ ...newTutor, subject: e.target.value })}
                />
                <Input
                  placeholder="Qualification"
                  value={newTutor.qualification}
                  onChange={(e) => setNewTutor({ ...newTutor, qualification: e.target.value })}
                />
                <Input
                  placeholder="Experience"
                  value={newTutor.experience}
                  onChange={(e) => setNewTutor({ ...newTutor, experience: e.target.value })}
                />
                <Button onClick={addTutor}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Featured Tutors</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Qualification</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tutors.map((tutor) => (
                    <TableRow key={tutor.id}>
                      <TableCell>
                        <div className="relative w-12 h-12">
                          {tutor.image_url ? (
                            <img 
                              src={tutor.image_url} 
                              alt={tutor.name} 
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                              <Image className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <Button 
                            size="icon" 
                            variant="secondary" 
                            className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full"
                            onClick={() => handleImageUpload(tutor.id)}
                            disabled={uploadingImage === tutor.id}
                          >
                            {uploadingImage === tutor.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Upload className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{tutor.name}</TableCell>
                      <TableCell>{tutor.subject}</TableCell>
                      <TableCell>{tutor.qualification || '-'}</TableCell>
                      <TableCell>{tutor.experience || '-'}</TableCell>
                      <TableCell>
                        <Switch
                          checked={tutor.is_active}
                          onCheckedChange={() => toggleTutor(tutor.id, tutor.is_active)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setEditingTutor(tutor)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Tutor</DialogTitle>
                                <DialogDescription>Update tutor information</DialogDescription>
                              </DialogHeader>
                              {editingTutor && (
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input
                                      value={editingTutor.name}
                                      onChange={(e) => setEditingTutor({ ...editingTutor, name: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Subject</Label>
                                    <Input
                                      value={editingTutor.subject}
                                      onChange={(e) => setEditingTutor({ ...editingTutor, subject: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Qualification</Label>
                                    <Input
                                      value={editingTutor.qualification || ''}
                                      onChange={(e) => setEditingTutor({ ...editingTutor, qualification: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Experience</Label>
                                    <Input
                                      value={editingTutor.experience || ''}
                                      onChange={(e) => setEditingTutor({ ...editingTutor, experience: e.target.value })}
                                    />
                                  </div>
                                  <Button onClick={updateTutor} className="w-full">
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                  </Button>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Tutor?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove {tutor.name} from the featured tutors list.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteTutor(tutor.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testimonials */}
        <TabsContent value="testimonials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Testimonial</CardTitle>
              <CardDescription>Add reviews to display on homepage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Student Name"
                  value={newTestimonial.student_name}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, student_name: e.target.value })}
                />
                <Input
                  placeholder="Parent Name"
                  value={newTestimonial.parent_name}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, parent_name: e.target.value })}
                />
                <Input
                  placeholder="Course"
                  value={newTestimonial.course}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, course: e.target.value })}
                />
                <Input
                  type="number"
                  min="1"
                  max="5"
                  placeholder="Rating (1-5)"
                  value={newTestimonial.rating}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, rating: parseInt(e.target.value) || 5 })}
                />
              </div>
              <Textarea
                placeholder="Review text"
                value={newTestimonial.review_text}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, review_text: e.target.value })}
              />
              <Button onClick={addTestimonial}>
                <Plus className="h-4 w-4 mr-2" />
                Add Testimonial
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Testimonials</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testimonials.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.student_name}</TableCell>
                      <TableCell>{t.parent_name || '-'}</TableCell>
                      <TableCell>{t.course || '-'}</TableCell>
                      <TableCell>
                        <div className="flex">
                          {Array.from({ length: t.rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{t.review_text}</TableCell>
                      <TableCell>
                        <Switch
                          checked={t.is_active}
                          onCheckedChange={() => toggleTestimonial(t.id, t.is_active)}
                        />
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Testimonial?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove this testimonial from the website.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteTestimonial(t.id)}>
                                Delete
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

        {/* Courses */}
        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Course</CardTitle>
              <CardDescription>Add courses to display on homepage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Course Title"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                />
                <Input
                  placeholder="Description"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                />
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newCourse.category}
                  onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                >
                  <option value="boards">Boards</option>
                  <option value="subjects">Subjects</option>
                  <option value="languages">Languages</option>
                  <option value="tech">Tech & Coding</option>
                  <option value="special">Special</option>
                </select>
                <Button onClick={addCourse}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.title}</TableCell>
                      <TableCell className="max-w-xs truncate">{course.description || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{course.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={course.is_active}
                          onCheckedChange={() => toggleCourse(course.id, course.is_active)}
                        />
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Course?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove {course.title} from the courses list.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteCourse(course.id)}>
                                Delete
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

        {/* Demo Requests */}
        <TabsContent value="demos">
          <Card>
            <CardHeader>
              <CardTitle>Demo Class Requests</CardTitle>
              <CardDescription>Manage demo class requests from the website</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demoRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(request.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">{request.parent_name}</TableCell>
                      <TableCell>{request.student_name}</TableCell>
                      <TableCell>
                        <a href={`tel:${request.phone}`} className="text-primary hover:underline">
                          {request.phone}
                        </a>
                      </TableCell>
                      <TableCell>{request.email || '-'}</TableCell>
                      <TableCell>{request.grade || '-'}</TableCell>
                      <TableCell>{request.subject || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={
                          request.status === 'pending' ? 'secondary' :
                          request.status === 'contacted' ? 'default' :
                          request.status === 'completed' ? 'outline' : 'destructive'
                        }>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <select
                          className="text-sm border rounded px-2 py-1"
                          value={request.status}
                          onChange={(e) => updateDemoStatus(request.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="contacted">Contacted</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </TableCell>
                    </TableRow>
                  ))}
                  {demoRequests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                        No demo requests yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
