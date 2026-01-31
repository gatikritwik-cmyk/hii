import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Code, Calculator, FlaskConical, Globe, Languages, Music, Palette } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string;
}

interface CoursesSectionProps {
  courses: Course[];
}

const categoryIcons: Record<string, any> = {
  subjects: BookOpen,
  coding: Code,
  math: Calculator,
  science: FlaskConical,
  geography: Globe,
  languages: Languages,
  music: Music,
  arts: Palette,
  boards: Globe,
  tech: Code,
  special: BookOpen,
};

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  subjects: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-200' },
  coding: { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-200' },
  math: { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-200' },
  science: { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-200' },
  geography: { bg: 'bg-teal-500/10', text: 'text-teal-600', border: 'border-teal-200' },
  languages: { bg: 'bg-pink-500/10', text: 'text-pink-600', border: 'border-pink-200' },
  music: { bg: 'bg-indigo-500/10', text: 'text-indigo-600', border: 'border-indigo-200' },
  arts: { bg: 'bg-rose-500/10', text: 'text-rose-600', border: 'border-rose-200' },
  boards: { bg: 'bg-cyan-500/10', text: 'text-cyan-600', border: 'border-cyan-200' },
  tech: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-200' },
  special: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-200' },
};

const categoryLabels: Record<string, string> = {
  subjects: '📚 Core Subjects',
  boards: '🎓 Boards & Curricula',
  languages: '🌍 Languages',
  tech: '💻 Technology & Coding',
  special: '⭐ Special Programs',
};

const categoryOrder = ['boards', 'subjects', 'languages', 'tech', 'special'];

export default function CoursesSection({ courses }: CoursesSectionProps) {
  if (courses.length === 0) {
    return null;
  }

  // Group courses by category
  const groupedCourses = courses.reduce((acc, course) => {
    const cat = course.category || 'subjects';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(course);
    return acc;
  }, {} as Record<string, Course[]>);

  // Sort categories by defined order
  const sortedCategories = categoryOrder.filter(cat => groupedCourses[cat]);

  return (
    <section id="courses" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-primary font-semibold uppercase tracking-wider mb-2">Our Courses</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What We <span className="text-primary">Teach</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Comprehensive curriculum covering all major subjects for CBSE, ICSE, and State Boards.
          </p>
        </motion.div>

        <div className="space-y-10">
          {sortedCategories.map((category, catIndex) => {
            const categoryCourses = groupedCourses[category];
            const colors = categoryColors[category] || categoryColors.subjects;
            
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: catIndex * 0.1 }}
              >
                <h3 className={`text-xl font-bold mb-4 ${colors.text}`}>
                  {categoryLabels[category] || category}
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {categoryCourses.map((course, index) => {
                    const IconComponent = categoryIcons[course.category] || BookOpen;
                    
                    return (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.02 }}
                      >
                        <Card className={`h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border ${colors.border} overflow-hidden group`}>
                          <CardContent className="p-3 text-center">
                            <motion.div 
                              className={`inline-flex p-2 rounded-lg ${colors.bg} mb-2 group-hover:scale-110 transition-transform duration-300`}
                            >
                              <IconComponent className={`h-4 w-4 md:h-5 md:w-5 ${colors.text}`} />
                            </motion.div>
                            <h4 className="font-medium text-xs md:text-sm group-hover:text-primary transition-colors line-clamp-2">{course.title}</h4>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
