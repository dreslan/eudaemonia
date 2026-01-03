import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import { Printer } from 'lucide-react';

const Tools: React.FC = () => {
  const baseUrl = window.location.origin;
  const newQuestUrl = `${baseUrl}/quests/new`;
  const newAchievementUrl = `${baseUrl}/achievements/new`;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white print:hidden">Tools</h1>

      <div className="bg-white dark:bg-dcc-card shadow rounded-lg p-6 border dark:border-dcc-system/20">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
            <div>
                <h2 className="text-xl font-bold dark:text-dcc-system">QR Codes</h2>
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
      
      <div className="bg-white dark:bg-dcc-card shadow rounded-lg p-6 border dark:border-dcc-system/20 print:hidden">
          <h2 className="text-xl font-bold mb-4 dark:text-dcc-system">Data Export</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Download a copy of all your data.</p>
          <button 
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 dark:bg-dcc-system dark:text-black dark:hover:bg-orange-400"
            onClick={() => {
                // Simple download trigger
                window.open('http://localhost:8000/quests', '_blank');
            }}
          >
              Download Quests JSON
          </button>
      </div>

      <div className="bg-white dark:bg-dcc-card shadow rounded-lg p-6 border dark:border-dcc-system/20 print:hidden">
          <h2 className="text-xl font-bold mb-4 dark:text-dcc-system">Privacy Settings</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Manage the visibility of your quests and achievements on your public profile.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 className="font-semibold mb-2 dark:text-white">Quests</h3>
                <div className="flex gap-2">
                    <button 
                        onClick={async () => {
                            if(window.confirm("Hide all quests from public profile?")) {
                                await axios.post('http://localhost:8000/quests/bulk-visibility', { is_hidden: true });
                                alert("All quests hidden.");
                            }
                        }}
                        className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                    >
                        Hide All
                    </button>
                    <button 
                        onClick={async () => {
                            if(window.confirm("Show all quests on public profile?")) {
                                await axios.post('http://localhost:8000/quests/bulk-visibility', { is_hidden: false });
                                alert("All quests visible.");
                            }
                        }}
                        className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                    >
                        Show All
                    </button>
                </div>
            </div>
            <div>
                <h3 className="font-semibold mb-2 dark:text-white">Achievements</h3>
                <div className="flex gap-2">
                    <button 
                        onClick={async () => {
                            if(window.confirm("Hide all achievements from public profile?")) {
                                await axios.post('http://localhost:8000/achievements/bulk-visibility', { is_hidden: true });
                                alert("All achievements hidden.");
                            }
                        }}
                        className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                    >
                        Hide All
                    </button>
                    <button 
                        onClick={async () => {
                            if(window.confirm("Show all achievements on public profile?")) {
                                await axios.post('http://localhost:8000/achievements/bulk-visibility', { is_hidden: false });
                                alert("All achievements visible.");
                            }
                        }}
                        className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                    >
                        Show All
                    </button>
                </div>
            </div>
          </div>
      </div>

      <div className="bg-white dark:bg-dcc-card shadow rounded-lg p-6 border-l-4 border-red-500 dark:border-red-600 print:hidden">
          <h2 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400">Danger Zone</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Permanently delete all quests and achievements. This cannot be undone.</p>
          <button 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
            onClick={async () => {
                if (window.confirm("Are you sure you want to delete ALL data? This cannot be undone.")) {
                    try {
                        await axios.post('http://localhost:8000/reset');
                        alert("Data reset successfully.");
                        window.location.reload();
                    } catch (error) {
                        console.error("Error resetting data:", error);
                        alert("Error resetting data.");
                    }
                }
            }}
          >
              Reset All Data
          </button>
      </div>
    </div>
  );
};

export default Tools;
