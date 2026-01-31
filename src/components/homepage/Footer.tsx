import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Mail, MessageCircle } from 'lucide-react';
import logo from '@/assets/logo.png';

interface FooterProps {
  phone?: string;
  email?: string;
  whatsapp?: string;
}

export default function Footer({ 
  phone = '+91 9379416374', 
  email = 'contact@rgselearning.com',
  whatsapp = '+91 9379416374'
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-10">
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="RG's E-Learning" className="h-12 w-auto" />
              <span className="font-bold text-xl text-secondary-foreground">RG's E-Learning</span>
            </Link>
            <p className="text-secondary-foreground/70">
              Your trusted partner in online education. Personalized 1 on 1 tutoring for Grade 1-12.
            </p>
            <div className="flex gap-4 pt-2">
              <a 
                href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`} 
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-green-500/20 rounded-full hover:bg-green-500/30 transition-colors flex items-center gap-2"
              >
                <MessageCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-600 font-medium">WhatsApp</span>
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="font-semibold text-lg mb-4 text-primary">Quick Links</h4>
            <ul className="space-y-3">
              {['About', 'Courses', 'Tutors', 'Testimonials', 'Contact'].map((link) => (
                <li key={link}>
                  <button 
                    onClick={() => scrollToSection(link.toLowerCase())}
                    className="text-secondary-foreground/70 hover:text-primary transition-colors"
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-semibold text-lg mb-4 text-primary">Contact Us</h4>
            <ul className="space-y-4">
              <li>
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center gap-3 text-secondary-foreground/70 hover:text-primary transition-colors">
                  <div className="p-2 bg-primary/20 rounded-full">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  {phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${email}`} className="flex items-center gap-3 text-secondary-foreground/70 hover:text-primary transition-colors">
                  <div className="p-2 bg-primary/20 rounded-full">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  {email}
                </a>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
      
      <div className="border-t border-secondary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-secondary-foreground/60 text-sm">
            <p>© {currentYear} RG's E-Learning Centre. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/auth" className="hover:text-primary transition-colors">Login</Link>
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}