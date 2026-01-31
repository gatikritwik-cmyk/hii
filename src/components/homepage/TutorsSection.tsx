import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { User, GraduationCap, Briefcase } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useRef } from 'react';

interface FeaturedTutor {
  id: string;
  name: string;
  subject: string;
  qualification: string | null;
  experience: string | null;
  image_url: string | null;
}

interface TutorsSectionProps {
  tutors: FeaturedTutor[];
}

export default function TutorsSection({ tutors }: TutorsSectionProps) {
  const plugin = useRef(
    Autoplay({ delay: 2500, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  if (tutors.length === 0) {
    return null;
  }

  return (
    <section id="tutors" className="py-20 md:py-28 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-primary font-semibold uppercase tracking-wider mb-2">Our Teachers</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Meet Our <span className="text-primary">Expert Tutors</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Learn from qualified and experienced teachers who are passionate about education.
          </p>
        </motion.div>

        <Carousel
          opts={{
            align: 'start',
            loop: true,
            dragFree: true,
          }}
          plugins={[plugin.current]}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {tutors.map((tutor, index) => (
              <CarouselItem key={tutor.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 group border-2 border-transparent hover:border-primary/20">
                    <div className="aspect-square bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 flex items-center justify-center overflow-hidden relative">
                      {tutor.image_url ? (
                        <motion.img 
                          src={tutor.image_url} 
                          alt={tutor.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="p-6 bg-muted/50 rounded-full">
                            <User className="h-20 w-20 text-muted-foreground/50" />
                          </div>
                        </div>
                      )}
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <CardContent className="p-5 text-center relative">
                      <h3 className="font-bold text-xl mb-1 group-hover:text-primary transition-colors">{tutor.name}</h3>
                      <p className="text-primary font-semibold mb-3">{tutor.subject}</p>
                      <div className="space-y-2 text-sm">
                        {tutor.qualification && (
                          <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <GraduationCap className="h-4 w-4" />
                            <span>{tutor.qualification}</span>
                          </div>
                        )}
                        {tutor.experience && (
                          <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <Briefcase className="h-4 w-4" />
                            <span>{tutor.experience}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex -left-4 bg-primary text-primary-foreground hover:bg-primary/90" />
          <CarouselNext className="hidden sm:flex -right-4 bg-primary text-primary-foreground hover:bg-primary/90" />
        </Carousel>
      </div>
    </section>
  );
}
