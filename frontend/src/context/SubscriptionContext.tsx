import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the context shape
interface SubscriptionContextType {
    isModalOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
}

// Create the context
const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Provider component
export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <SubscriptionContext.Provider value={{ isModalOpen, openModal, closeModal }}>
            {children}
        </SubscriptionContext.Provider>
    );
};

// Custom hook for using the context
export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
};
