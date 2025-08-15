import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Users, BarChart, GraduationCap, Brain, Target, TestTube2, Rocket, Globe, Laptop, Star, Award, BookOpen as BookOpenIcon } from 'lucide-react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import type { Engine } from 'tsparticles-engine';
import { TypeAnimation } from 'react-type-animation';

// Optimized Gradient Background with Parallax
const GradientBackground = () => {
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '80%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.5]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-violet-900 via-indigo-900 to-purple-900"
        style={{ opacity }}
      />
      <motion.div 
        className="absolute inset-0 bg-[url('https://assets.codepen.io/939494/noise.png')] opacity-10"
        style={{ y: backgroundY }}
      />
      <ParticlesBackground />
    </div>
  );
};

// Interactive Particles Background
const ParticlesBackground = () => {
  const particlesInit = async (engine: Engine) => {
    await loadFull(engine);
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        particles: {
          number: { value: 50 },
          color: { value: '#ffffff' },
          opacity: { value: 0.1 },
          size: { value: 1 },
          links: {
            enable: true,
            color: '#ffffff',
            opacity: 0.1,
            distance: 150
          },
          move: { enable: true, speed: 1 }
        }
      }}
      className="absolute inset-0 opacity-30"
    />
  );
};

// Enhanced Mascot with SVG Morphing
const Mascot = () => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div 
      className="relative w-48 h-48"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <motion.div
        animate={{
          rotate: hovered ? [0, 15, -15, 0] : 0,
          y: hovered ? [-10, 10, -10] : 0
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          type: 'keyframes'
        }}
      >
        <GraduationCap className="w-full h-full text-white" />
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-4 -right-4"
            >
              <Rocket className="w-12 h-12 text-purple-400 animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

interface StatCardProps {
  number: number;
  label: string;
}

// Animated Stat Card with Counting
const StatCard = ({ number, label }: StatCardProps) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const animate = () => {
        setCount((prev) => {
          const next = prev + Math.ceil(number / 20);
          return next >= number ? number : next;
        });
      };
      const interval = setInterval(animate, 50);
      if (count >= number) clearInterval(interval);
      return () => clearInterval(interval);
    }
  }, [isInView, number, count]);

  return (
    <motion.div
      ref={ref}
      className="bg-white/5 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border border-white/10 shadow-xl"
      whileHover={{ scale: 1.05 }}
    >
      <div className="text-fluid-2xl sm:text-fluid-3xl lg:text-fluid-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
        {count.toLocaleString()}+
      </div>
      <div className="text-fluid-sm sm:text-fluid-base text-indigo-100 font-medium">{label}</div>
    </motion.div>
  );
};

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

interface GuideCardProps {
  name: string;
  title: string;
  specialization: string;
  experience: string;
  achievements: string[];
  photo: string;
  contact?: string;
  email?: string;
  researchInterests?: string[];
  courses?: string[];
}

interface DeveloperCardProps {
  name: string;
  role: string;
  specialization: string;
  year: string;
  achievements: string[];
  photo: string;
  contact?: string;
  email?: string;
  skills?: string[];
  github?: string;
  linkedin?: string;
}

// 3D Feature Card
const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "1.2 1"]
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.5, 1]);

  return (
    <motion.div
      ref={ref}
      style={{ scale, opacity }}
      className="group perspective-1000"
    >
      <motion.div
        className="relative h-full bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 backdrop-blur-xl border border-white/10 shadow-2xl transform-style-preserve-3d"
        whileHover={{ rotateY: 10, rotateX: 5 }}
      >
        <div className="flex flex-col items-center text-center">
          <motion.div 
            className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg"
            whileHover={{ scale: 1.1 }}
          >
            <Icon className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
          </motion.div>
          <h3 className="text-fluid-lg sm:text-fluid-xl lg:text-fluid-2xl font-bold text-white mb-3 sm:mb-4">{title}</h3>
          <p className="text-fluid-sm sm:text-fluid-base text-indigo-100 leading-relaxed">{description}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Guide Card Component
const GuideCard = ({ name, title, specialization, experience, achievements, photo, contact, email, researchInterests, courses }: GuideCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "1.2 1"]
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.5, 1]);

  return (
    <motion.div
      ref={ref}
      style={{ scale, opacity }}
      className="group perspective-1000"
    >
      <motion.div
        className="relative h-full bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-3xl p-8 backdrop-blur-xl border border-white/10 shadow-2xl transform-style-preserve-3d"
        whileHover={{ rotateY: 10, rotateX: 5 }}
      >
        <div className="flex flex-col items-center text-center">
          {/* Profile Photo */}
          <motion.div 
            className="mb-6 relative"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-400/30 shadow-xl">
              <img 
                src={photo} 
                alt={name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Create a fallback SVG with the person's initial
                  const svg = `
                    <svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
                      <rect width="128" height="128" fill="#6366f1"/>
                      <text x="64" y="80" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="white">${name.charAt(0)}</text>
                    </svg>
                  `;
                  const blob = new Blob([svg], { type: 'image/svg+xml' });
                  e.currentTarget.src = URL.createObjectURL(blob);
                }}
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-2 shadow-lg">
              <Award className="w-6 h-6 text-white" />
            </div>
          </motion.div>

          {/* Name and Title */}
          <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
          <p className="text-purple-200 font-medium mb-3">{title}</p>
          
          {/* Specialization */}
          <div className="mb-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-500/20 text-purple-200 border border-purple-400/30">
            {specialization}
          </div>

          {/* Experience */}
          <p className="text-indigo-100 text-sm mb-4">
            <span className="font-semibold">Experience:</span> {experience}
          </p>

          {/* Contact Information */}
          {contact && (
            <p className="text-indigo-100 text-xs mb-2">
              <span className="font-semibold">Contact:</span> {contact}
            </p>
          )}
          {email && (
            <p className="text-indigo-100 text-xs mb-4">
              <span className="font-semibold">Email:</span> {email}
            </p>
          )}



          {/* Achievements */}
          <div className="space-y-2">
            <p className="text-indigo-100 text-sm font-semibold">Key Achievements:</p>
            <ul className="space-y-1">
              {achievements.map((achievement, index) => (
                <li key={index} className="flex items-start text-indigo-100 text-xs">
                  <Star className="w-3 h-3 text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Developer Card Component
const DeveloperCard = ({ name, role, specialization, year, achievements, photo, contact, email, skills, github, linkedin }: DeveloperCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "1.2 1"]
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.5, 1]);

  return (
    <motion.div
      ref={ref}
      style={{ scale, opacity }}
      className="group perspective-1000"
    >
      <motion.div
        className="relative h-full bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-3xl p-8 backdrop-blur-xl border border-white/10 shadow-2xl transform-style-preserve-3d"
        whileHover={{ rotateY: 10, rotateX: 5 }}
      >
        <div className="flex flex-col items-center text-center">
          {/* Profile Photo */}
          <motion.div 
            className="mb-6 relative"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-cyan-400/30 shadow-xl">
              <img 
                src={photo} 
                alt={name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Create a fallback SVG with the person's initial
                  const svg = `
                    <svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
                      <rect width="128" height="128" fill="#0891b2"/>
                      <text x="64" y="80" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="white">${name.charAt(0)}</text>
                    </svg>
                  `;
                  const blob = new Blob([svg], { type: 'image/svg+xml' });
                  e.currentTarget.src = URL.createObjectURL(blob);
                }}
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full p-2 shadow-lg">
              <BookOpenIcon className="w-6 h-6 text-white" />
            </div>
          </motion.div>

          {/* Name and Role */}
          <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
          <p className="text-cyan-200 font-medium mb-2">{role}</p>
          
          {/* Email */}
          {email && (
            <p className="text-cyan-100 text-sm mb-3">
              {email}
            </p>
          )}
          
          {/* Specialization */}
          <div className="mb-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">
            {specialization}
          </div>

          {/* Year */}
          <p className="text-cyan-100 text-sm mb-4">
            {year}
          </p>



          {/* Social Links */}
          {(github || linkedin) && (
            <div className="mt-4 flex gap-2">
              {github && (
                <a 
                  href={github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              )}
              {linkedin && (
                <a 
                  href={linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Adaptive algorithms that personalize your learning journey"
    },
    {
      icon: TestTube2,
      title: "Real Experiments",
      description: "Interactive simulations for practical understanding"
    },
    {
      icon: Globe,
      title: "Global Community",
      description: "Connect with learners worldwide in our network"
    }
  ];

  const additionalFeatures = [
    {
      icon: Laptop,
      title: "Dynamic Mock Tests",
      description: "Access a wide range of practice tests that simulate real exam conditions",
      forRole: "For Students"
    },
    {
      icon: Brain,
      title: "Real-time Progress",
      description: "Track your performance with detailed analytics and insights",
      forRole: "For Students"
    },
    {
      icon: Target,
      title: "Customized Learning",
      description: "Get personalized recommendations based on your performance",
      forRole: "For Students"
    },
    {
      icon: BookOpen,
      title: "Question Bank",
      description: "Create and manage comprehensive question banks for your subjects",
      forRole: "For Teachers"
    },
    {
      icon: Users,
      title: "Student Management",
      description: "Monitor and analyze student performance with detailed reports",
      forRole: "For Teachers"
    },
    {
      icon: BarChart,
      title: "Analytics Dashboard",
      description: "Get insights into student performance and identify areas for improvement",
      forRole: "For Teachers"
    }
  ];

  // Guides/Professors Data - Replace with actual photos, names, and details
  const guides = [
    {
      name: "Dr. Saravanan K",
      title: "Associate Professor",
      specialization: "Power Electronics & Drives",
      experience: "22+ years",
      achievements: [
        "Senior Member, IEEE",
        "Fellow member in FIE",
        "Life Member in ISTE & SESI",
        "PhD from JNTUK-Kakinada"
      ],
      photo: "/images/professors/dr-saravanan-k.jpg.png",
      contact: "9884452615",
      email: "saravank3@srmist.edu.in",
      researchInterests: [
        "Renewable Energy Resources",
        "Power Converters", 
        "Electrical Vehicle"
      ],
      courses: [
        "Circuit Theory",
        "Basic Electrical Engineering",
        "Electrical Engineering",
        "Electrical Machines",
        "Power Electronics",
        "Fundamentals of Computing and programming",
        "Sustainable Energy"
      ]
    },
    {
      name: "Dr. Vidyasagar S",
      title: "Assistant Professor",
      specialization: "Power Systems Engineering",
      experience: "17.8+ years",
      achievements: [
        "Senior Member, IEEE",
        "Lifetime Member of ISTE and IEI",
        "PhD from SRM Institute of Science and Technology",
        "Expert in Power System Operation and Control"
      ],
      photo: "/images/professors/dr-vidyasagar-s.jpg.png",
      contact: "9003028986",
      email: "vidyasas@srmist.edu.in",
      researchInterests: [
        "Radial Distribution",
        "Economic load dispatch",
        "Optimal power flow",
        "Hybrid electric vehicle",
        "Power Quality",
        "Feeder reconfiguration",
        "Distributed Generators",
        "Microgrid"
      ],
      courses: [
        "Power System Deregulation",
        "FACTS",
        "Renewable Energy Resources",
        "Power System Operation and Control",
        "Power Quality",
        "Digital Signal Processing",
        "Electrical Machine Design",
        "Electromagnetic Field Theory",
        "Transmission and Distribution"
      ]
    },
    {
      name: "Dr. Kalyanasundaram V",
      title: "Assistant Professor",
      specialization: "Power Systems",
      experience: "17.6+ years",
      achievements: [
        "Member, IEEE",
        "PhD in Deregulated Power Systems",
        "Expert in Power System Operation and Control",
        "Specialist in FACTS and Power System Protection"
      ],
      photo: "/images/professors/dr-kalyanasundara-v.jpg.png",
      contact: "9865231780",
      email: "kalyanav@srmist.edu.in",
      researchInterests: [
        "Power system deregulation",
        "Location marginal pricing",
        "Neural networks",
        "Economic load dispatch",
        "Optimal power flow",
        "Hybrid electric vehicle",
        "Power Quality",
        "Congestion management",
        "Custom power devices"
      ],
      courses: [
        "Power system operation and control",
        "Analysis of electric circuits",
        "Generation, Transmission and Distribution",
        "Measurements and Instrumentations",
        "Power system deregulation",
        "Power generation system"
      ]
    },
    {
      name: "Dr. D. Sattianadan",
      title: "Associate Professor",
      specialization: "Power Systems",
      experience: "25+ years",
      achievements: [
        "40+ journal papers published",
        "2 patents published",
        "Co-Principal Investigator of funded research project",
        "Expert in Distributed Generation and Microgrids"
      ],
      photo: "/images/professors/dr-sattianadan-d.jpg.png",
      contact: "9940209579",
      email: "sattiand@srmist.edu.in",
      researchInterests: [
        "Distributed Generation",
        "Relay coordination",
        "Power system Control and Operation",
        "Optimization",
        "FACTS",
        "Droop Control in DC Microgrids",
        "Distribution Systems",
        "Renewable Energy Sources",
        "Electric Vehicles",
        "Energy Management"
      ],
      courses: [
        "Power Systems",
        "Electrical and Electronics Engineering",
        "Distributed Generation",
        "Microgrid Systems",
        "Power System Control",
        "Renewable Energy Systems"
      ]
    }
  ];

  // Developers Data - Replace with actual student information
  const developers = [
    {
      name: "Mr. Rannadeer Kumar Seetha",
      role: "Full Stack Developer",
      specialization: "CSE AI ML",
      year: "2024-2028",
      achievements: [
        "Built complete frontend architecture",
        "Implemented user authentication system",
        "Designed responsive UI/UX",
        "AI/ML integration specialist"
      ],
      photo: "/images/developers/rannadeer-kumar-seetha.jpg",
      email: "rannadeer2006@gmail.com",
      skills: ["React", "TypeScript", "Node.js", "AI/ML", "Python", "Machine Learning"],
      github: "https://github.com/Rannadeer03",
      linkedin: "https://www.linkedin.com/in/rannadeer-kumar-seetha"
    },
    {
      name: "Mr. Shudhanshu Kumar",
      role: "Full Stack Developer",
      specialization: "CSE AI ML",
      year: "2024-2028",
      achievements: [
        "Passionate frontend developer",
        "Working on SRM Virtual Lab project",
        "Strong foundation in C, C++, Python",
        "Expert in HTML, CSS, JavaScript, React"
      ],
      photo: "/images/developers/shudhanshu-kumar.jpg.jpg",
      email: "shudhanshukumar112003@gmail.com",
      skills: ["HTML", "CSS", "JavaScript", "React", "C", "C++", "Python", "Node.js", "MongoDB"],
      github: "https://github.com/Shudhanshu9122",
      linkedin: "https://www.linkedin.com/in/shudhanshukumar"
    }
  ];

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden">
      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 z-50"
        style={{ scaleX }}
      />

      <GradientBackground />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            className="mb-8 sm:mb-12 lg:mb-16"
          >
            <Mascot />
          </motion.div>

          <h1 className="text-fluid-4xl sm:text-fluid-5xl lg:text-fluid-6xl xl:text-fluid-7xl font-bold text-white mb-6 sm:mb-8 leading-tight px-4">
            Transform Your
            <TypeAnimation
              sequence={[
                'Learning',
                2000,
                'Future',
                2000,
                'Career',
                2000
              ]}
              wrapper="div"
              cursor={true}
              repeat={Infinity}
              className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300"
            />
          </h1>

          <p className="text-fluid-lg sm:text-fluid-xl lg:text-fluid-2xl text-indigo-100 mb-8 sm:mb-10 lg:mb-12 max-w-3xl mx-auto px-4">
            <TypeAnimation
              sequence={[
                'Join thousands mastering their subjects with our intelligent platform...',
                3000,
                'Experience education reimagined through AI and expert insights...',
                3000
              ]}
              wrapper="span"
              cursor={true}
              repeat={Infinity}
            />
          </p>

          <motion.div 
            className="flex flex-wrap justify-center gap-4 sm:gap-6 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="btn-responsive group text-fluid-base sm:text-fluid-lg font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white min-h-[44px]"
            >
              <span className="flex items-center space-x-2 sm:space-x-3">
                <Rocket className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>Launch Your Journey</span>
              </span>
            </motion.button>
          </motion.div>

          <motion.div 
            className="mt-12 sm:mt-16 lg:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <StatCard number={10000} label="Active Learners" />
            <StatCard number={95} label="Success Rate" />
            <StatCard number={50000} label="Lessons Mastered" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12 sm:mb-16 lg:mb-24"
            initial={{ y: 50 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-fluid-3xl sm:text-fluid-4xl lg:text-fluid-5xl font-bold text-white mb-4 sm:mb-6 px-4">
              Revolutionary Features
            </h2>
            <p className="text-fluid-lg sm:text-fluid-xl text-indigo-100 max-w-2xl mx-auto px-4">
              Discover tools designed to accelerate your learning process
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {features.map((feature) => (
              <FeatureCard 
                key={feature.title}
                {...feature}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="py-32 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-24"
            initial={{ y: 50 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold text-white mb-6">
              Everything you need to excel
            </h2>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
              Comprehensive tools for both students and teachers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {additionalFeatures.map((feature, index) => (
              <motion.div 
                key={index} 
                className="group perspective-1000"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.div
                  className="relative h-full bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-3xl p-8 backdrop-blur-xl border border-white/10 shadow-2xl transform-style-preserve-3d"
                  whileHover={{ rotateY: 10, rotateX: 5 }}
                >
                  <div className="flex flex-col items-center text-center">
                    <motion.div 
                      className="mb-6 p-4 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg"
                      whileHover={{ scale: 1.1 }}
                    >
                      {React.createElement(feature.icon, { className: "w-12 h-12 text-white" })}
                    </motion.div>
                    <div className="mb-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-500/20 text-purple-200 border border-purple-400/30">
                      {feature.forRole}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                    <p className="text-indigo-100 leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Guides Section */}
      <section className="py-32 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-24"
            initial={{ y: 50 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold text-white mb-6">
              Meet Our Guides
            </h2>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
              Learn from distinguished professors and industry experts who are passionate about your success
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {guides.map((guide, index) => (
              <GuideCard 
                key={index}
                {...guide}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Developers Section */}
      <section className="py-32 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-24"
            initial={{ y: 50 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold text-white mb-6">
              Meet Our Developers
            </h2>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
              Talented students who brought this platform to life with their innovative coding skills
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2">
            {developers.map((developer, index) => (
              <DeveloperCard 
                key={index}
                {...developer}
              />
            ))}
          </div>
        </div>
      </section>


    </div>
  );
};

export default Home;