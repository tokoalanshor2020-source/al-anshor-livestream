
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    className?: string;
}

const Input: React.FC<InputProps> = ({ label, id, className = '', ...props }) => {
    return (
        <div className="w-full">
            {label && <label htmlFor={id} className="block text-sm font-medium text-text-secondary mb-1">{label}</label>}
            <input
                id={id}
                className={`w-full bg-secondary border border-gray-600 text-text-primary rounded-md p-2 focus:ring-accent focus:border-accent transition ${className}`}
                {...props}
            />
        </div>
    );
};

export default Input;
