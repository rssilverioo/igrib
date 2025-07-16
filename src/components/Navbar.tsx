import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, MessageSquare, User } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Sprout className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-green-600">Igrib</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/messages" className="p-2 hover:bg-gray-100 rounded-full">
              <MessageSquare className="h-6 w-6 text-gray-600" />
            </Link>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <User className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar