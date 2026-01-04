import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer } from 'lucide-react';

const Tools: React.FC = () => {
  const baseUrl = window.location.origin;
  const newQuestUrl = `${baseUrl}/quests/new`;
  const newAchievementUrl = `${baseUrl}/achievements/new`;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white print:hidden">Tools & Printables</h1>

      <div className="bg-white dark:bg-dcc-card shadow rounded-lg p-6 border dark:border-dcc-system/20">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
            <div>
                <h2 className="text-xl font-bold dark:text-dcc-system">Quick Access QR Codes</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Print these QR codes and attach them to your physical achievement box for quick access.</p>
            </div>
            <button 
                onClick={() => window.print()}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm flex items-center gap-2 print:hidden"
            >
                <Printer className="w-4 h-4" />
                Print QR Codes
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-orange-600 dark:text-dcc-system">New Quest</h2>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <QRCodeSVG value={newQuestUrl} size={200} />
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 font-mono">{newQuestUrl}</p>
          </div>

          <div className="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-green-600 dark:text-green-400">New Achievement</h2>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <QRCodeSVG value={newAchievementUrl} size={200} />
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 font-mono">{newAchievementUrl}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tools;
