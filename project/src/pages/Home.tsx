import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  BarChart3,
  MessageCircle,
  ClipboardList,
  Code,
  Zap,
  Users,
  Award,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  Target,
  Video,
  FileCheck,
  Briefcase
} from 'lucide-react';

// Stat Card Component with Counter Animation
interface StatCardProps {
  number: number;
  label: string;
  icon: React.ElementType;
  suffix?: string;
}

const StatCard: React.FC<StatCardProps> = ({ number, label, icon: Icon, suffix = '+' }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = number / steps;
    const stepDuration = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= number) {
        setCount(number);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isVisible, number]);

  return (
    <div
      ref={ref}
      className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl mb-4">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <div className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-gray-600 text-sm sm:text-base font-medium">{label}</div>
    </div>
  );
};

// Feature Card Component
interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => {
  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
      <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl mb-4">
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
};

// Category Card Component
interface CategoryCardProps {
  icon: React.ElementType;
  title: string;
  subjects: string[];
  color: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ icon: Icon, title, subjects, color }) => {
  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
      <div className={`flex items-center justify-center w-14 h-14 ${color} rounded-xl mb-4`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
      <ul className="space-y-2">
        {subjects.map((subject, index) => (
          <li key={index} className="flex items-center text-gray-600">
            <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
            <span className="text-sm sm:text-base">{subject}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: FileText,
      title: 'Study Notes',
      description: 'Access well-organized, downloadable study materials for all your subjects. Comprehensive notes that help you understand concepts better.'
    },
    {
      icon: ClipboardList,
      title: 'Practice Quizzes',
      description: 'Test your knowledge with instant feedback. Practice quizzes help you identify weak areas and improve your understanding.'
    },
    {
      icon: Video,
      title: 'Video Courses',
      description: 'Learn from expert-led video courses. Watch, pause, and rewind to master concepts at your own pace.'
    },
    {
      icon: BarChart3,
      title: 'Progress Tracking',
      description: 'Monitor your learning journey with detailed analytics. Track your performance and see your improvement over time.'
    },
    {
      icon: MessageCircle,
      title: 'Doubt Support',
      description: 'Get help when you need it. Connect with teachers and peers through our AI-powered chat support system.'
    },
    {
      icon: FileCheck,
      title: 'Assignment Management',
      description: 'Submit assignments, track deadlines, and receive feedback. Stay organized with our comprehensive assignment system.'
    }
  ];

  const categories = [
    {
      icon: Code,
      title: 'Computer Science',
      subjects: ['Data Structures & Algorithms', 'Operating Systems', 'Database Management', 'Computer Networks', 'Software Engineering'],
      color: 'bg-gradient-to-br from-blue-500 to-cyan-500'
    },
    {
      icon: Zap,
      title: 'Engineering',
      subjects: ['Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Electronics', 'Power Systems'],
      color: 'bg-gradient-to-br from-purple-500 to-pink-500'
    },
    {
      icon: Target,
      title: 'GATE Preparation',
      subjects: ['GATE CS', 'GATE EE', 'GATE ME', 'Previous Year Papers', 'Mock Tests'],
      color: 'bg-gradient-to-br from-green-500 to-emerald-500'
    },
    {
      icon: Briefcase,
      title: 'Placement Preparation',
      subjects: ['Aptitude Tests', 'Technical Interviews', 'Coding Practice', 'Resume Building', 'Company Prep'],
      color: 'bg-gradient-to-br from-orange-500 to-red-500'
    }
  ];

  const guides: Array<{
    name: string;
    title: string;
    specialization: string;
    experience: string;
    achievements: string[];
    photo: string;
    email: string;
    contact?: string;
  }> = [
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
      email: "saravank3@srmist.edu.in",
      contact: "9884452615"
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
      email: "vidyasas@srmist.edu.in",
      contact: "9003028986"
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
      email: "kalyanav@srmist.edu.in",
      contact: "9865231780"
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
      email: "sattiand@srmist.edu.in",
      contact: "9940209579"
    },
  ];

  const developers: Array<{
    name: string;
    role: string;
    specialization: string;
    year: string;
    achievements: string[];
    photo: string;
    email: string;
    github?: string;
    linkedin?: string;
  }> = [
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
      github: "https://github.com/Shudhanshu9122",
      linkedin: "https://www.linkedin.com/in/shudhanshukumar"
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
              Master Your Subjects with
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                Interactive Learning
              </span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Access notes, quizzes, courses, and track your progress all in one place. 
              Start your learning journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 min-h-[56px] border-none focus-visible:ring-2 focus-visible:ring-indigo-600 outline-none"
              >
                Launch Your Journey
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 sm:h-16 lg:h-20 text-gray-50" fill="currentColor" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
          </svg>
        </div>
      </section>

      {/* Key Stats Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <StatCard number={10000} label="Active Students" icon={Users} />
            <StatCard number={500} label="Courses Available" icon={BookOpen} />
            <StatCard number={50000} label="Study Hours Tracked" icon={TrendingUp} />
            <StatCard number={95} label="Success Rate" icon={Award} suffix="%" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools designed to help you learn better and achieve your academic goals
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Course Categories Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Explore Our Course Categories
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from a wide range of subjects and start learning what interests you
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {categories.map((category, index) => (
              <CategoryCard key={index} {...category} />
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Guides Section */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 xs:px-6 sm:px-8 lg:px-12 relative bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 isolate-layer">
        <div className="max-w-7xl mx-auto" style={{ position: 'relative' }}>
          <div className="text-center mb-12 sm:mb-16 lg:mb-24">
            <h2 className="text-fluid-3xl sm:text-fluid-4xl lg:text-fluid-5xl font-bold text-blue-900 mb-4">
              Meet Our Guides
            </h2>
            <p className="text-fluid-lg sm:text-fluid-xl text-green-700 max-w-2xl mx-auto">
              Learn from passionate professors and experts guiding your journey
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 content-visibility-auto cis-600" style={{ position: 'relative' }}>
            {guides.map((guide: typeof guides[number], idx: number) => (
              <div key={idx} className="relative flex flex-col items-center bg-gradient-to-br from-purple-600/90 to-indigo-700/90 rounded-3xl shadow-2xl border border-purple-300/30 py-8 px-6 sm:px-8 mx-auto transition-transform hover:-translate-y-1 duration-200 min-w-[260px] max-w-sm w-full">
                <div className="relative w-28 h-28">
                  <img src={guide.photo} alt={guide.name} className="w-28 h-28 rounded-full mx-auto border-4 border-white shadow-lg object-cover bg-purple-100" />
                  <span className="absolute -bottom-2 -right-2 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 via-pink-400 to-purple-400 ring-2 ring-white shadow-lg">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </span>
                </div>
                <div className="mt-6 text-center">
                  <span className="block text-2xl md:text-2.5xl lg:text-3xl font-extrabold text-white leading-tight break-words whitespace-break-spaces">
                    {guide.name.split(' ').map((part, i, arr) => i === arr.length - 1 ? <span key={i} className="block">{part}</span> : part + ' ')}
                  </span>
                  <div className="mt-1 text-purple-100 text-base font-medium">{guide.title}</div>
                  <div className="mt-2 flex items-center justify-center">
                    <span className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-purple-400 to-purple-700/80 text-white/90 text-xs font-semibold shadow-inner border border-purple-200/30">
                      {guide.specialization}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-col items-center gap-1 text-sm text-purple-100">
                    <div><span className="text-white font-semibold">Experience:</span> {guide.experience}</div>
                    {guide.contact && <div><span className="text-white font-semibold">Contact:</span> {guide.contact}</div>}
                    <div><span className="text-white font-semibold">Email:</span> <span className="underline text-blue-200/80 hover:text-blue-100">{guide.email}</span></div>
                  </div>
                  <div className="mt-4">
                    <div className="font-bold text-purple-100 mb-1">Key Achievements:</div>
                    <ul className="flex flex-col items-start gap-1 mx-auto text-sm text-purple-50">
                      {guide.achievements.map((ach, i) => (
                        <li key={i} className="flex items-center gap-2"><Award className="w-4 h-4 text-yellow-200 shrink-0" /> {ach}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Meet Our Developers Section */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 xs:px-6 sm:px-8 lg:px-12 relative bg-gradient-to-br from-green-100 via-blue-100 to-purple-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-24">
            <h2 className="text-fluid-3xl sm:text-fluid-4xl lg:text-fluid-5xl font-bold text-blue-900 mb-4">
              Meet Our Developers
            </h2>
            <p className="text-fluid-lg sm:text-fluid-xl text-blue-700 max-w-2xl mx-auto">
              Talented students building the future of learning
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-12">
            {developers.map((dev: typeof developers[number], idx: number) => (
              <div key={idx} className="relative flex flex-col items-center bg-gradient-to-br from-blue-600/90 to-purple-700/80 rounded-3xl shadow-2xl border border-blue-300/30 py-8 px-6 sm:px-8 mx-auto transition-transform hover:-translate-y-1 duration-200 min-w-[260px] max-w-sm w-full">
                <div className="relative w-28 h-28">
                  <img src={dev.photo} alt={dev.name} className="w-28 h-28 rounded-full mx-auto border-4 border-white shadow-lg object-cover bg-blue-100" />
                  <span className="absolute -bottom-2 -right-2 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-green-400 ring-2 ring-white shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </span>
                </div>
                <div className="mt-6 text-center">
                  <span className="block text-2xl md:text-2.5xl lg:text-3xl font-extrabold text-white leading-tight break-words whitespace-break-spaces">
                    {dev.name.split(' ').map((part, i, arr) => i === arr.length - 1 ? <span key={i} className="block">{part}</span> : part + ' ')}
                  </span>
                  <div className="mt-1 text-blue-100 text-base font-medium">{dev.role}</div>
                  <div className="mt-2 flex items-center justify-center">
                    <span className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-blue-400 to-blue-700/80 text-white/90 text-xs font-semibold shadow-inner border border-blue-200/30">
                      {dev.specialization + (dev.year ? ' • ' + dev.year : '')}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-col items-center gap-1 text-sm text-blue-100">
                    <div><span className="text-white font-semibold">Email:</span> <span className="underline text-blue-200/80 hover:text-blue-100">{dev.email}</span></div>
                  </div>
                  <div className="mt-4">
                    <div className="font-bold text-blue-100 mb-1">Key Achievements:</div>
                    <ul className="flex flex-col items-start gap-1 mx-auto text-sm text-blue-50">
                      {dev.achievements.map((ach, j) => (
                        <li key={j} className="flex items-center gap-2"><Award className="w-4 h-4 text-yellow-100 shrink-0" /> {ach}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4 flex gap-2 justify-center">
                    {dev.github && <a href={dev.github} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-blue-200 bg-blue-400/20 hover:bg-blue-600/40 p-2 rounded-full transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></a>}
                    {dev.linkedin && <a href={dev.linkedin} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-blue-200 bg-blue-400/20 hover:bg-blue-600/40 p-2 rounded-full transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003zM7.119 20.452H3.56V9h3.559zM5.34 7.433C4.207 7.433 3.24 6.475 3.24 5.338c0-1.137.968-2.063 2.101-2.063s2.1.927 2.1 2.063c0 1.137-.967 2.095-2.1 2.095zm14.878 13.019h-3.56v-5.569c0-1.327-.027-3.036-1.847-3.036-1.847 0-2.13 1.445-2.13 2.938v5.667h-3.558V9h3.414v1.561h.049c.476-.9 1.635-1.849 3.366-1.849 3.6 0 4.267 2.369 4.267 5.453v6.287z"/></svg></a>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Final CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white shadow-inner">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Ready to Explore?
          </h2>
          <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of students advancing their knowledge with an eco-friendly, future-forward study platform. Your journey starts today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white px-10 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 border-none focus-visible:ring-2 focus-visible:ring-indigo-600 min-h-[56px] outline-none"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-green-700 transition-all duration-300 min-h-[56px]"
            >
              Already have an account? Sign In
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
