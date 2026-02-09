import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

interface AppLayoutProps {
    children: ReactNode;
    showFooter?: boolean;
}

/**
 * Main application layout component.
 * Provides consistent Navbar and Footer across all pages.
 * Uses AuthContext for authentication state.
 */
const AppLayout = ({
    children,
    showFooter = true
}: AppLayoutProps) => {
    const { user, isLoggedIn } = useAuth();
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Skip to main content link for accessibility */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md"
            >
                Skip to main content
            </a>

            {!isAdminRoute && <Navbar />}

            <main id="main-content" className="flex-1">
                {children}
            </main>

            {showFooter && !isAdminRoute && <Footer />}
        </div>
    );
};

export default AppLayout;
