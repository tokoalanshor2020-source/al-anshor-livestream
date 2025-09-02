import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'normal' | 'sm';
    children: React.ReactNode;
    className?: string;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'normal', children, className = '', ...props }) => {
    const baseClasses = 'font-bold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center';
    
    const variantClasses = {
        primary: 'bg-accent hover:bg-indigo-600 text-white',
        secondary: 'bg-secondary hover:bg-gray-600 text-text-primary',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
    };

    const sizeClasses = {
        normal: 'py-2 px-4',
        sm: 'py-1 px-3 text-sm',
    };

    return (
        <button className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} {...props}>
            {children}
        </button>
    );
};

export default Button;