import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/homepage/Navbar';
import HeroSection from '@/components/homepage/HeroSection';
import StatsSection from '@/components/homepage/StatsSection';
import AboutSection from '@/components/homepage/AboutSection';
import CoursesSection from '@/components/homepage/CoursesSection';
import TutorsSection from '@/components/homepage/TutorsSection';
import TestimonialsSection from '@/components/homepage/TestimonialsSection';
import DemoFormSection from '@/components/homepage/DemoFormSection';
import Footer from '@/components/homepage/Footer';
import { Loader2 } from 'lucide-react';

interface SiteSettings {
  hero_title?: string;
  hero_subtitle?: string;
  hero_description?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_whatsapp?: string;
  stat_students?: string;
  stat_classes?: string;
  stat_satisfaction?: string;
  stat_tutors?: string;
  about_text?: string;
  about_point_1?: string;
  about_point_2?: string;
  about_point_3?: string;
  about_point_4?: string;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string;
}

interface FeaturedTutor {
  id: string;
  name: string;
  subject: string;
  qualification: string | null;
  experience: string | null;
  image_url: string | null;
}

interface Testimonial {
  id: string;
  student_name: string;
  parent_name: string | null;
  rating: number;
  review_text: string;
  course: string | null;
}

export default function Homepage() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSettings>({});
  const [courses, setCourses] = useState<Course[]>([]);
  const [tutors, setTutors] = useState<FeaturedTutor[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, coursesRes, tutorsRes, testimonialsRes] = await Promise.all([
        supabase.from('site_settings').select('setting_key, setting_value'),
        supabase.from('courses').select('*').order('display_order'),
        supabase.from('featured_tutors').select('*').order('display_order'),
        supabase.from('testimonials').select('*').order('display_order')
      ]);

      if (settingsRes.data) {
        const settingsMap: SiteSettings = {};
        settingsRes.data.forEach(s => {
          settingsMap[s.setting_key as keyof SiteSettings] = s.setting_value;
        });
        setSettings(settingsMap);
      }

      if (coursesRes.data) setCourses(coursesRes.data);
      if (tutorsRes.data) setTutors(tutorsRes.data);
      if (testimonialsRes.data) {
        const raw = testimonialsRes.data;
        // Ensure enough slides for a smooth looping carousel even when there are only a few reviews.
        const minItemsForLoop = 6;

        const expanded =
          raw.length > 0 && raw.length < minItemsForLoop
            ? Array.from({ length: Math.ceil(minItemsForLoop / raw.length) }, (_, copyIndex) =>
                raw.map((t) => ({
                  ...t,
                  id: copyIndex === 0 ? t.id : `${t.id}__copy${copyIndex}`,
                })),
              ).flat()
            : raw;

        setTestimonials(expanded);
      }
    } catch (error) {
      console.error('Error fetching homepage data:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar 
        phone={settings.contact_phone} 
        email={settings.contact_email} 
      />
      
      <main>
        <HeroSection
          title={settings.hero_title}
          subtitle={settings.hero_subtitle}
          description={settings.hero_description}
        />
        
        <StatsSection
          students={settings.stat_students}
          classes={settings.stat_classes}
          satisfaction={settings.stat_satisfaction}
          tutors={settings.stat_tutors}
        />
        
        <AboutSection 
          text={settings.about_text} 
          points={[
            settings.about_point_1,
            settings.about_point_2,
            settings.about_point_3,
            settings.about_point_4
          ].filter(Boolean) as string[]}
        />
        
        <CoursesSection courses={courses} />
        
        <TutorsSection tutors={tutors} />
        
        <TestimonialsSection testimonials={testimonials} />
        
        <DemoFormSection />
      </main>
      
      <Footer
        phone={settings.contact_phone}
        email={settings.contact_email}
        whatsapp={settings.contact_whatsapp}
      />
    </div>
  );
}
