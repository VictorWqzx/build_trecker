import React, { useState } from 'react';
import { useStore } from '../store';
import { Download, Upload } from 'lucide-react';

export function Settings() {
  const { employees, projects, receipts, workEntries, payments, importData } = useStore();
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExport = () => {
    const data = {
      employees,
      projects,
      receipts,
      workEntries,
      payments,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buildtracker_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        importData(content);
        setImportStatus('Данные успешно импортированы!');
        setTimeout(() => setImportStatus(null), 3000);
      } catch (err) {
        setImportStatus('Ошибка импорта. Проверьте файл.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset input
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#2D332D] mb-6">Настройки</h1>
        
        <div className="bg-[#F9FBF9] rounded-2xl shadow-sm border border-[#E0E5E0] overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-[#2D332D] mb-4">Резервное копирование (JSON)</h2>
            <p className="text-sm text-[#6B776B] mb-6">
              Все ваши данные хранятся локально в браузере. Регулярно создавайте резервные копии,
              чтобы не потерять информацию и иметь возможность перенести её на другое устройство.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleExport}
                className="inline-flex items-center justify-center px-4 py-2 border border-[#E0E5E0] shadow-sm text-sm font-medium rounded-md text-[#2D332D] bg-white hover:bg-[#F0F4F0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5A6B5A]"
              >
                <Download className="-ml-1 mr-2 h-4 w-4" />
                Экспорт данных (Backup)
              </button>
              
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#5A6B5A] hover:bg-[#4A5A4A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5A6B5A]"
                >
                  <Upload className="-ml-1 mr-2 h-4 w-4" />
                  Импорт из JSON
                </button>
              </div>
            </div>
            
            {importStatus && (
              <p className="mt-4 text-sm font-medium text-green-600">{importStatus}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-[#F0F4F0] rounded-2xl p-6 border border-[#E0E5E0]">
        <h3 className="text-sm font-semibold text-[#3D523D] mb-2">О приложении</h3>
        <p className="text-sm text-[#4A7A4A] mb-2">
          BuildTracker — инструмент для строителей и бригадиров.
        </p>
        <p className="text-[11px] text-[#6B776B]">
          Версия 1.0. Предназначено для личного использования (Single-user).
          Все данные хранятся непосредственно на вашем устройстве, регистрация не требуется.
        </p>
      </div>
    </div>
  );
}
