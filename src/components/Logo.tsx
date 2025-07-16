import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'default' | 'white' | 'dark';
  showText?: boolean;
}

export default function Logo({ className = '', variant = 'default', showText = false }: LogoProps) {
  const getColor = () => {
    switch (variant) {
      case 'white':
        return 'white';
      case 'dark':
        return '#032B2A';
      default:
        return '#32AE5D';
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <svg 
        viewBox="0 0 32 32" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
      >
        <path fillRule="evenodd" clipRule="evenodd" d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32ZM15.3884 8.29999C15.3884 7.69999 15.8884 7.19999 16.4884 7.19999C17.0884 7.19999 17.5884 7.69999 17.5884 8.29999V13.5C17.5884 14.1 17.0884 14.6 16.4884 14.6C15.8884 14.6 15.3884 14.1 15.3884 13.5V8.29999ZM19.7884 11.6C19.7884 11 20.2884 10.5 20.8884 10.5C21.4884 10.5 21.9884 11 21.9884 11.6V16.8C21.9884 17.4 21.4884 17.9 20.8884 17.9C20.2884 17.9 19.7884 17.4 19.7884 16.8V11.6ZM11.0884 10.5C10.4884 10.5 9.98837 11 9.98837 11.6V16.8C9.98837 17.4 10.4884 17.9 11.0884 17.9C11.6884 17.9 12.1884 17.4 12.1884 16.8V11.6C12.1884 11 11.6884 10.5 11.0884 10.5ZM15.3884 18.5C15.3884 17.9 15.8884 17.4 16.4884 17.4C17.0884 17.4 17.5884 17.9 17.5884 18.5V23.7C17.5884 24.3 17.0884 24.8 16.4884 24.8C15.8884 24.8 15.3884 24.3 15.3884 23.7V18.5Z" fill={getColor()}/>
      </svg>
      {showText && (
        <span className={`text-xl font-semibold ml-3 ${
          variant === 'white' 
            ? 'text-white' 
            : variant === 'dark' 
              ? 'text-brand-dark'
              : 'text-brand'
        }`}>
          igrib
        </span>
      )}
    </div>
  );
}