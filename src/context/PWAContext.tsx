import React, { createContext, useContext, useEffect, useState } from "react";

interface PWAContextType {
    isInstallable: boolean;
    isInstalled: boolean;
    install: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export function PWAProvider({ children }: { children: React.ReactNode }) {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [supportStatus, setSupportStatus] = useState<string>("Initializing...");

    useEffect(() => {
        // 1. Check if already installed
        const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone;
        if (isStandalone) {
            console.log("Vault Status: Running in Native Standalone mode.");
            setIsInstalled(true);
            setSupportStatus("Active (Native)");
        } else {
            setSupportStatus("Scanning for Vault Signal...");
        }

        // 2. Browser Capability Detection
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        const supportsInstall = 'onbeforeinstallprompt' in window;

        if (isSafari && !isStandalone) {
            setSupportStatus("iOS Protocol: Use 'Add to Home Screen'");
        } else if (!supportsInstall && !isStandalone) {
            setSupportStatus("Browser Restriction: Auto-Install Blocked");
        }

        const handleBeforeInstallPrompt = (e: any) => {
            console.log("Vault Protocol: PWA Installation Signal Intercepted.");
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
            setSupportStatus("Vault Ready for Download");
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const install = async () => {
        if (!deferredPrompt) {
            console.warn("Vault Protocol: Install trigger attempted before verification.");
            return;
        }

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Vault Protocol: Installation outcome: ${outcome}`);

        if (outcome === "accepted") {
            setDeferredPrompt(null);
            setIsInstallable(false);
            setIsInstalled(true);
            setSupportStatus("Active (Native)");
        }
    };

    return (
        <PWAContext.Provider value={{ isInstallable, isInstalled, install }}>
            {children}
            {import.meta.env.DEV && (
                <div className="fixed bottom-4 left-4 z-50 px-3 py-1.5 bg-slate-900 border border-slate-700 text-white rounded-lg shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 pointer-events-none opacity-80 backdrop-blur-sm">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Vault PWA Debug</span>
                        <span className="text-[10px] font-mono leading-none">{supportStatus}</span>
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full ${isInstallable ? "bg-emerald-500 animate-pulse" : isInstalled ? "bg-emerald-500" : "bg-red-500"}`} />
                </div>
            )}
        </PWAContext.Provider>
    );
}

export function usePWA() {
    const context = useContext(PWAContext);
    if (context === undefined) {
        throw new Error("usePWA must be used within a PWAProvider");
    }
    return context;
}
