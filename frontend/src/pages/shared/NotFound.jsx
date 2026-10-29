import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="h-16 w-16 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          404 - Page Not Found
        </h1>
        <p className="text-sm text-slate-500">
          The requested page could not be located or you may lack permissions to view it.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-md shadow-primary-500/20 transition-all"
        >
          <Home className="h-4 w-4" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
