import { useState, useEffect } from 'react';
import { DashboardLayout } from "./components/DashboardLayout";
import { DemoModeBanner } from "./components/DemoModeBanner";
import { LoadingPage } from "./components/core/LoadingPage";
import { SplashPage } from "./components/core/SplashPage";
import { Toaster } from "@/components/ui/sonner";
import { AppProvider, useApp } from "./lib/app-context";
import { checkBackendHealth } from "./lib/backend-health";
import { soundManager } from "./lib/soundManager";
import { OfflineIndicator } from "./components/common/OfflineIndicator";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { ToastManager } from "./components/common/ToastManager";
import { setupTokenAutoRefresh } from "./lib/auth-utils";
import { logger } from "./lib/logger";

function AppContent() {
    const { isDemoMode, setDemoMode, setBackendAvailable } = useApp();
    const [isLoading, setIsLoading] = useState(true);
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        async function initializeApp() {
            setIsLoading(true);
            
            // Wait longer for backend to start (5 seconds minimum, with retries)
            // Backend needs time to: start Node.js process, load server, bind to port
            const maxRetries = 10;
            const initialDelay = 2000; // Start checking after 2 seconds
            
            // Initial wait for backend startup
            await new Promise(resolve => setTimeout(resolve, initialDelay));
            
            // Retry health check with exponential backoff
            let backendHealthy = await checkBackendHealth();
            for (let attempt = 0; attempt < maxRetries; attempt++) {
                if (backendHealthy.isHealthy) {
                    setBackendAvailable(true);
                    setDemoMode(false);
                    setIsLoading(false);
                    return; // Success - exit early
                }
                
                // Wait before retry (exponential backoff: 500ms, 1000ms, 1500ms, etc.)
                const retryDelay = Math.min(500 + (attempt * 500), 3000);
                if (attempt < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    backendHealthy = await checkBackendHealth();
                }
            }
            
            // All retries failed - run in demo mode
            setBackendAvailable(false);
            setDemoMode(true);
            setIsLoading(false);
        }

        initializeApp();

        // No cleanup needed - mock services removed
    }, [setDemoMode, setBackendAvailable]);

    useEffect(() => {
        soundManager.init();
        logger.info('APP', 'Application initialized');
        
        // Setup token auto-refresh
        const cleanupRefresh = setupTokenAutoRefresh();
        
        // Preload critical routes for faster navigation
        preloadCriticalRoutes();
        
        return () => {
            soundManager.destroy();
            cleanupRefresh();
            logger.info('APP', 'Application cleanup');
        };
    }, []);

    const handleConnectBackend = async () => {
        // Retry health check with exponential backoff
        const maxRetries = 5;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            const backendHealthy = await checkBackendHealth();
            if (backendHealthy.isHealthy) {
                setBackendAvailable(true);
                setDemoMode(false);
                window.location.reload();
                return;
            }
            // Wait before retry
            if (attempt < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000 + (attempt * 500)));
            }
        }
        // Failed to connect after retries
        alert('Backend server not available. Please check that the server is running on port 3001.');
    };

    // Show loading page during initialization
    if (isLoading) {
        return <LoadingPage />;
    }

    // Show splash page (auto-dismisses)
    if (showSplash) {
        return <SplashPage onComplete={() => setShowSplash(false)} />;
    }

    return (
        <>
            {isDemoMode && <DemoModeBanner onDisable={handleConnectBackend} />}
            <OfflineIndicator />
            <ToastManager />
            <Onboarding />
            <DashboardLayout />
        </>
    );
}

function App() {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
}

export default App