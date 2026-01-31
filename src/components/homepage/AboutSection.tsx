import { motion } from 'framer-motion';
import { CheckCircle, Target, Award, Heart } from 'lucide-react';

interface AboutSectionProps {
  text?: string;
  points?: string[];
}

const defaultPoints = [
  'CBSE, ICSE, and State Board curriculum',
  'Interactive online classes with screen sharing',
  'Regular assessments and progress tracking',
  'Affordable pricing with flexible schedules'
];

export default function AboutSection({ 
  text = "RG's E-Learning Centre is a premier online tutoring platform dedicated to providing personalized education for students from Grade 1 to 12. Our experienced teachers focus on building strong foundations and helping students excel in their academic journey.",
  points = defaultPoints
}: AboutSectionProps) {
  const features = [
    { icon: Target, title: 'Focused Learning', desc: 'Personalized attention for every student' },
    { icon: Award, title: 'Quality Education', desc: 'Experienced & qualified teachers' },
    { icon: Heart, title: 'Student-Centric', desc: 'Adapting to individual learning styles' },
  ];

  return (
    <section id="about" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.p 
              className="text-primary font-semibold uppercase tracking-wider"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              About Us
            </motion.p>
            <h2 className="text-3xl md:text-4xl font-bold">
              Why Choose <span className="text-primary">RG's E-Learning?</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {text}
            </p>
            <div className="space-y-4 pt-4">
              {(points.length > 0 ? points : defaultPoints).map((item, i) => (
                <motion.div 
                  key={i} 
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="p-1 bg-primary/10 rounded-full">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-foreground">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="grid gap-6"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {features.map((feature, i) => (
              <motion.div 
                key={i}
                className="flex items-start gap-4 p-6 bg-card rounded-2xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="p-3 bg-primary/10 rounded-xl shrink-0">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
