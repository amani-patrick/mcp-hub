import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
  Home, 
  Search, 
  ArrowLeft, 
  AlertTriangle,
  Zap 
} from "lucide-react"; 

const NotFound = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const goHome = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 p-8 overflow-hidden relative">
      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-40 h-40 bg-gradient-to-r from-pink-400 to-red-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className={`text-center transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}`}>
        {/* Animated 404 with icon */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <h1 className="text-8xl md:text-9xl font-black bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent drop-shadow-2xl">
              4<span className="animate-bounce inline-block mx-1">0</span>4
            </h1>
            <AlertTriangle className="absolute -top-4 -right-4 w-12 h-12 text-red-500 animate-ping" />
          </div>
        </div>

        {/* Professional illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="w-32 h-32 md:w-48 md:h-48 bg-white/80 dark:bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl flex items-center justify-center p-8 animate-float border">
              <Zap className="w-16 h-16 md:w-20 md:h-20 text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
            </div>
            <p className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
              Connection Lost
            </p>
          </div>
        </div>

        <p className="mb-8 text-xl md:text-2xl text-gray-700 dark:text-gray-300 font-medium max-w-md mx-auto leading-relaxed">
          The requested page could not be found. 
          <span className="block mt-2 text-base text-muted-foreground">Path: <code className="bg-muted px-2 py-1 rounded font-mono text-sm">{location.pathname}</code></span>
        </p>

        {/* Action buttons with icons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <button
            onClick={goHome}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 text-lg flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            Return Home
          </button>
          <button className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-500 text-gray-700 dark:text-gray-300 hover:text-indigo-600 font-semibold rounded-2xl hover:shadow-lg transition-all duration-300 text-lg flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Site
          </button>
        </div>

        {/* Quick links with icons */}
        <div className="flex flex-wrap gap-6 justify-center text-sm">
          <a href="/" className="flex items-center gap-1 hover:text-indigo-600 transition-colors font-medium">
            <Home className="w-4 h-4" />
            Home
          </a>
          <a href="/about" className="flex items-center gap-1 hover:text-indigo-600 transition-colors font-medium">
            About
          </a>
          <a href="/features" className="flex items-center gap-1 hover:text-indigo-600 transition-colors font-medium">
            Features
          </a>
          <a href="/contact" className="flex items-center gap-1 hover:text-indigo-600 transition-colors font-medium">
            Contact
          </a>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default NotFound;
