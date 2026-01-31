import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, BookOpen, Star, GraduationCap } from 'lucide-react';

interface StatsSectionProps {
  students?: string;
  classes?: string;
  satisfaction?: string;
  tutors?: string;
}

function AnimatedCounter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
    const duration = 2000;
    const steps = 60;
    const increment = end / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [end, isInView]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function StatsSection({ 
  students = '500+', 
  classes = '10000+', 
  satisfaction = '98%',
  tutors = '25+'
}: StatsSectionProps) {
  const stats = [
    { 
      icon: Users, 
      value: parseInt(students) || 500, 
      suffix: '+',
      label: 'Happy Students',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    { 
      icon: BookOpen, 
      value: parseInt(classes) || 10000, 
      suffix: '+',
      label: 'Classes Conducted',
      color: 'text-green-600',
      bgColor: 'bg-green-500/10'
    },
    { 
      icon: Star, 
      value: parseInt(satisfaction) || 98, 
      suffix: '%',
      label: 'Satisfaction Rate',
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10'
    },
    { 
      icon: GraduationCap, 
      value: parseInt(tutors) || 25, 
      suffix: '+',
      label: 'Expert Tutors',
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10'
    },
  ];

  return (
    <section className="py-16 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="text-center p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                <motion.div 
                  className={`inline-flex p-4 rounded-2xl ${stat.bgColor} mb-4`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </motion.div>
                <p className={`text-4xl md:text-5xl font-bold ${stat.color} mb-2`}>
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-muted-foreground font-medium">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
