'use client';

import { useState } from 'react';
import LoginForm from './components/LoginForm';
import WizardForm from './components/WizardForm';
import PreviewRender from './components/PreviewRender';
import ExportButtons from './components/ExportButtons';
import ApiLimitModal from './components/ApiLimitModal';
import ApiSettingsPanel from './components/ApiSettingsPanel';

interface User {
  kodeAkses: string;
  nama: string;
  sekolah: string;
  deviceHash: string;
}

type AppState = 'login' | 'wizard' | 'preview';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('login');
  const [user, setUser] = useState<User | null>(null);
  const [generatedRPPM, setGeneratedRPPM] = useState<{ fullHtml: string; generatedAt: string } | null>(null);

  // API Settings modals
  const [showApiLimitModal, setShowApiLimitModal] = useState(false);
  const [showApiSettings, setShowApiSettings] = useState(false);

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    setAppState('wizard');
  };

  const handleGenerate = (rppm: { fullHtml: string; generatedAt: string }) => {
    setGeneratedRPPM(rppm);
    setAppState('preview');
  };

  const handleBackToWizard = () => {
    setGeneratedRPPM(null);
    setAppState('wizard');
  };

  const handleLogout = () => {
    setAppState('login');
    setUser(null);
    setGeneratedRPPM(null);
  };

  // Handle rate limit error from WizardForm
  const handleRateLimitError = () => {
    setShowApiLimitModal(true);
  };

  // Open settings panel from modal
  const handleOpenSettings = () => {
    setShowApiSettings(true);
  };

  // After saving API key, close settings
  const handleApiKeySaved = () => {
    setShowApiSettings(false);
    // User can now retry generation with their personal API key
  };

  return (
    <div className="min-h-screen">
      {/* Header for authenticated users */}
      {appState !== 'login' && user && (
        <header className="header-main">
          <div className="container-main">
            <div className="header-content">
              <div className="header-brand">
                <div className="header-logo">G</div>
                <div>
                  <div className="header-title">GuruDok AI</div>
                  <div className="header-subtitle">Generator RPPM Deep Learning</div>
                </div>
              </div>
              <div className="header-user">
                <div className="header-user-name">{user.nama}</div>
                <div className="text-xs text-gray-500">{user.sekolah}</div>
                <button
                  onClick={handleLogout}
                  className="header-logout mt-1"
                >
                  Keluar
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main>
        {appState === 'login' && (
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        )}

        {appState === 'wizard' && (
          <div className="page-content">
            <div className="container-main">
              <WizardForm
                userSekolah={user?.sekolah}
                userName={user?.nama}
                onGenerate={handleGenerate}
                onRateLimitError={handleRateLimitError}
              />
            </div>
          </div>
        )}

        {appState === 'preview' && generatedRPPM && (
          <div className="page-content">
            <div className="container-main">
              <PreviewRender
                rppm={generatedRPPM}
                onBack={handleBackToWizard}
              />
            </div>
            <ExportButtons rppm={generatedRPPM} />
          </div>
        )}
      </main>

      {/* Footer for login */}
      {appState === 'login' && (
        <footer className="fixed bottom-0 left-0 right-0 p-4 text-center">
          <p className="text-xs text-gray-400">
            © 2025 GuruDok AI · Kurikulum Merdeka · SK 046/2025
          </p>
        </footer>
      )}

      {/* API Limit Modal */}
      <ApiLimitModal
        isOpen={showApiLimitModal}
        onClose={() => setShowApiLimitModal(false)}
        onOpenSettings={handleOpenSettings}
      />

      {/* API Settings Panel */}
      <ApiSettingsPanel
        isOpen={showApiSettings}
        onClose={() => setShowApiSettings(false)}
        onSave={handleApiKeySaved}
      />
    </div>
  );
}

