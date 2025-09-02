
import React from 'react';

interface PageContainerProps {
    children: React.ReactNode;
}

const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
    return (
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
            {children}
        </main>
    );
};

export default PageContainer;
