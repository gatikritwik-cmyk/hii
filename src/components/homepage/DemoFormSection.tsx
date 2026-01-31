import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Send, CheckCircle, Phone, Clock, Users } from 'lucide-react';

export default function DemoFormSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    parent_name: '',
    student_name: '',
    phone: '',
    email: '',
    grade: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.parent_name || !formData.student_name || !formData.phone) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase
      .from('demo_requests')
      .insert(formData);

    if (error) {
      toast.error('Failed to submit request. Please try again.');
      console.error('Demo request error:', error);
    } else {
      setIsSubmitted(true);
      toast.success('Demo class request submitted! We will contact you soon.');
    }

    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <section id="contact" className="py-20 md:py-28 bg-secondary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="max-w-xl mx-auto text-center border-primary/20">
              <CardContent className="pt-12 pb-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                >
                  <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
                </motion.div>
                <h3 className="text-3xl font-bold mb-4">Thank You!</h3>
                <p className="text-muted-foreground text-lg">
                  Your demo class request has been submitted successfully. Our team will contact you within 24 hours.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    );
  }

  const benefits = [
    { icon: CheckCircle, text: 'Free trial class with no obligations' },
    { icon: Users, text: 'Meet your tutor before enrolling' },
    { icon: Clock, text: 'Understand our teaching approach' },
    { icon: CheckCircle, text: 'Get personalized study plan' },
  ];

  return (
    <section id="contact" className="py-20 md:py-28 bg-secondary relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <p className="text-primary font-semibold uppercase tracking-wider mb-2">Book a Demo</p>
              <h2 className="text-3xl md:text-4xl font-bold text-secondary-foreground mb-4">
                Start Your Learning Journey <span className="text-primary">Today</span>
              </h2>
              <p className="text-secondary-foreground/80 text-lg">
                Book a free demo class and experience our personalized teaching methodology. 
                No commitments, just learning!
              </p>
            </div>
            
            <div className="space-y-4">
              {benefits.map((benefit, i) => (
                <motion.div 
                  key={i}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="p-1.5 bg-primary/20 rounded-full">
                    <benefit.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-secondary-foreground">{benefit.text}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap gap-6 pt-4">
              <a href="tel:+919379416374" className="flex items-center gap-2 text-secondary-foreground hover:text-primary transition-colors">
                <div className="p-2 bg-primary/20 rounded-full">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <span>+91 9379416374</span>
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="shadow-2xl border-primary/20">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-xl">
                <CardTitle className="text-2xl">Book Free Demo Class</CardTitle>
                <CardDescription>Fill in your details and we'll get in touch</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="parent_name">Parent Name *</Label>
                      <Input
                        id="parent_name"
                        placeholder="Your name"
                        value={formData.parent_name}
                        onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                        required
                        className="border-border focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="student_name">Student Name *</Label>
                      <Input
                        id="student_name"
                        placeholder="Student's name"
                        value={formData.student_name}
                        onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                        required
                        className="border-border focus:border-primary"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="border-border focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="border-border focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="grade">Grade</Label>
                      <Select 
                        value={formData.grade} 
                        onValueChange={(value) => setFormData({ ...formData, grade: value })}
                      >
                        <SelectTrigger className="border-border">
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i + 1} value={String(i + 1)}>
                              Grade {i + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="e.g., Mathematics"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="border-border focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message (Optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Any specific requirements?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={3}
                      className="border-border focus:border-primary"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all" 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      'Submitting...'
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Book Free Demo
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
