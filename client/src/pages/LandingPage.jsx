import { Link } from "react-router-dom";
import { FileText, Users, Zap, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            CollabDoc
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 hover:shadow transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-blue-50/50 to-white">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/50 text-blue-700 text-sm font-medium border border-blue-200">
             <span className="flex h-2 w-2 relative">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
             </span>
             Real-time Collaboration Engine
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Write together. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Create instantly.
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            The minimal, fast, and secure rich-text editor that lets your team collaborate seamlessly in real time without the clutter.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="w-full sm:w-auto rounded-full bg-blue-600 px-8 py-3.5 text-base font-bold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Start Writing for Free
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto rounded-full bg-white px-8 py-3.5 text-base font-bold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all font-medium"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 px-4">
          <div className="flex flex-col items-center p-6 text-center space-y-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
              <Zap className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Lightning Fast</h3>
            <p className="text-gray-500 font-medium">Synchronized updates across all devices via WebSockets. Never wait for a change again.</p>
          </div>
          <div className="flex flex-col items-center p-6 text-center space-y-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Multiplayer Ready</h3>
            <p className="text-gray-500 font-medium">Invite your team and watch characters appear instantly as they type.</p>
          </div>
          <div className="flex flex-col items-center p-6 text-center space-y-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-green-50 rounded-2xl text-green-600">
              <Shield className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Secure Storage</h3>
            <p className="text-gray-500 font-medium">Your data is automatically saved and protected by enterprise-grade JWT Auth.</p>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-gray-500 border-t border-gray-100">
        <p>&copy; {new Date().getFullYear()} CollabDoc Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
