import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { formatCurrency, cn } from '../lib/utils';
import { Trash2, ArrowLeft, Plus, Download, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { exportProjectReportToExcel } from '../lib/exportUtils';

export function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    projects, employees, receipts, workEntries, payments, 
    addReceipt, addWorkEntry, addPayment, deleteProject,
    deleteReceipt, deleteWorkEntry, deletePayment
  } = useStore();

  const [activeTab, setActiveTab] = useState<'summary' | 'receipts' | 'work' | 'payments'>('summary');
  
  const project = projects.find(p => p.id === id);

  // Forms state
  const [addingReceipt, setAddingReceipt] = useState(false);
  const [newReceipt, setNewReceipt] = useState({ amount: '', comment: '' });

  const [addingWork, setAddingWork] = useState(false);
  const [newWork, setNewWork] = useState({ employeeId: '', sqm: '', rate: '', comment: '' });

  const [addingPayment, setAddingPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({ employeeId: '', amount: '', comment: '' });

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-[#2D332D]">Объект не найден</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-[#5A6B5A] hover:underline">Вернуться к списку</button>
      </div>
    );
  }

  const projReceipts = receipts.filter(r => r.projectId === id).sort((a,b) => b.date - a.date);
  const projWork = workEntries.filter(w => w.projectId === id).sort((a,b) => b.date - a.date);
  const projPayments = payments.filter(p => p.projectId === id).sort((a,b) => b.date - a.date);

  const totalReceipts = projReceipts.reduce((sum, r) => sum + r.amount, 0);
  const totalPaid = projPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalAccrued = projWork.reduce((sum, w) => sum + w.amount, 0);
  const balance = totalReceipts - totalPaid;
  const totalSqm = projWork.reduce((sum, w) => sum + w.sqm, 0);

  const handleDeleteProject = () => {
    if (confirm('Вы уверены, что хотите удалить этот объект? Это действие нельзя отменить, все связанные данные (чеки, работы, выплаты по объекту) будут удалены.')) {
      deleteProject(project.id);
      navigate('/');
    }
  };

  const handleAddReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReceipt.amount) return;
    addReceipt({
      projectId: project.id,
      date: Date.now(),
      amount: parseFloat(newReceipt.amount),
      comment: newReceipt.comment
    });
    setNewReceipt({ amount: '', comment: '' });
    setAddingReceipt(false);
  };

  const handleAddWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWork.employeeId || !newWork.sqm || !newWork.rate) return;
    addWorkEntry({
      projectId: project.id,
      employeeId: newWork.employeeId,
      date: Date.now(),
      sqm: parseFloat(newWork.sqm),
      rate: parseFloat(newWork.rate),
      comment: newWork.comment
    });
    setNewWork({ employeeId: '', sqm: '', rate: '', comment: '' });
    setAddingWork(false);
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayment.employeeId || !newPayment.amount) return;
    addPayment({
      projectId: project.id,
      employeeId: newPayment.employeeId,
      date: Date.now(),
      amount: parseFloat(newPayment.amount),
      comment: newPayment.comment
    });
    setNewPayment({ employeeId: '', amount: '', comment: '' });
    setAddingPayment(false);
  };

  // Pre-fill rate when employee changes
  const handleWorkEmployeeChange = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    let rate = '';
    if (emp) {
      if (project.currency === 'BYN') rate = String(emp.defaultRateByn ?? emp.defaultRate ?? '');
      if (project.currency === 'USD') rate = String(emp.defaultRateUsd ?? emp.defaultRate ?? '');
    }
    setNewWork({ ...newWork, employeeId: empId, rate });
  };

  // Group stats by employee
  const employeeStats = employees.map(emp => {
    const w = projWork.filter(x => x.employeeId === emp.id);
    const p = projPayments.filter(x => x.employeeId === emp.id);
    const accrued = w.reduce((sum, x) => sum + x.amount, 0);
    const paid = p.reduce((sum, x) => sum + x.amount, 0);
    const sqm = w.reduce((sum, x) => sum + x.sqm, 0);
    return { ...emp, accrued, paid, debt: accrued - paid, sqm };
  }).filter(e => e.accrued > 0 || e.paid > 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="p-2 text-[#8A968A] hover:text-[#5A6B5A] hover:bg-[#F9FBF9] rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#2D332D]">{project.name}</h1>
            <p className="text-sm text-[#6B776B]">Валюта объекта: <span className="font-medium text-[#2D332D]">{project.currency}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center px-3 py-1.5 border border-[#E0E5E0] text-[#2D332D] bg-white hover:bg-[#F9FBF9] rounded-md text-sm font-medium transition-colors shadow-sm"
          >
             <Printer className="w-4 h-4 mr-2" />
            PDF / Печать
          </button>
          <button
            onClick={() => exportProjectReportToExcel(project.id)}
            className="inline-flex items-center px-3 py-1.5 border border-[#E0E5E0] text-[#2D332D] bg-white hover:bg-[#F9FBF9] rounded-md text-sm font-medium transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Экспорт в Excel
          </button>
          <button
            onClick={handleDeleteProject}
            className="inline-flex items-center px-3 py-1.5 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-md text-sm font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Удалить объект
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E0E5E0]">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {[
            { id: 'summary', name: 'Сводка' },
            { id: 'receipts', name: 'Поступления' },
            { id: 'work', name: 'Начисления работ' },
            { id: 'payments', name: 'Выплаты' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-[#5A6B5A] text-[#5A6B5A]'
                  : 'border-transparent text-[#8A968A] hover:text-[#5A6B5A] hover:border-[#D0D7D0]'
              )}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Contents */}
      <div className="mt-6">
        
        {/* SUMMARY TAB */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#F9FBF9] p-5 rounded-2xl border border-[#E0E5E0] shadow-sm flex flex-col justify-center">
                <p className="text-xs font-semibold text-[#8A968A] uppercase tracking-wider mb-2">Получено средств</p>
                <p className="text-2xl font-bold text-[#2D332D]">{formatCurrency(totalReceipts, project.currency)}</p>
              </div>
              <div className="bg-[#F9FBF9] p-5 rounded-2xl border border-[#E0E5E0] shadow-sm flex flex-col justify-center">
                <p className="text-xs font-semibold text-[#8A968A] uppercase tracking-wider mb-2">Сумма начислений</p>
                <p className="text-2xl font-bold text-[#2D332D]">{formatCurrency(totalAccrued, project.currency)}</p>
              </div>
              <div className="bg-[#F9FBF9] p-5 rounded-2xl border border-[#E0E5E0] shadow-sm flex flex-col justify-center">
                <p className="text-xs font-semibold text-[#8A968A] uppercase tracking-wider mb-2">Фактически выплачено</p>
                <p className="text-2xl font-bold text-[#2D332D]">{formatCurrency(totalPaid, project.currency)}</p>
              </div>
              <div className={cn(
                "p-5 rounded-2xl border shadow-sm flex flex-col justify-center",
                balance > 0 ? "bg-[#E6EEE6] border-[#CFDFCF]" : balance < 0 ? "bg-[#FFF4F0] border-[#FFD9C2]" : "bg-white border-[#E0E5E0]"
              )}>
                <p className={cn("text-xs font-semibold uppercase tracking-wider mb-2", balance > 0 ? "text-[#5A6B5A]" : balance < 0 ? "text-[#D97706]" : "text-[#8A968A]")}>Остаток средств</p>
                <p className={cn("text-2xl font-bold", balance > 0 ? "text-[#3D523D]" : balance < 0 ? "text-[#B45309]" : "text-[#2D332D]")}>
                  {formatCurrency(balance, project.currency)}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#E0E5E0] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E0E5E0]">
                <h3 className="text-lg font-medium text-[#2D332D]">Итого по объекту</h3>
              </div>
              <div className="p-5 flex flex-col sm:flex-row gap-6">
                <div>
                  <p className="text-sm text-[#6B776B]">Общая площадь работ:</p>
                  <p className="text-lg font-semibold text-[#2D332D]">{totalSqm.toFixed(2)} м²</p>
                </div>
                <div className="hidden sm:block border-l border-[#E0E5E0]" />
                <div>
                  <p className="text-sm text-[#6B776B]">Задолженность перед рабочими:</p>
                  <p className="text-lg font-semibold text-[#D97706]">{formatCurrency(totalAccrued - totalPaid, project.currency)}</p>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-medium text-[#2D332D] pt-4">Сотрудники на объекте</h3>
            {employeeStats.length === 0 ? (
               <div className="text-center py-8 bg-[#F9FBF9] rounded-2xl border border-[#E0E5E0]">
                 <p className="text-sm text-[#8A968A]">Нет данных о сотрудниках</p>
               </div>
            ) : (
              <div className="overflow-x-auto border border-[#E0E5E0] rounded-2xl shadow-sm">
                <table className="min-w-full divide-y divide-[#F0F2F0]">
                  <thead className="bg-[#F9FBF9] border-b border-[#E0E5E0]">
                    <tr>
                      <th className="px-6 py-4 text-left text-[11px] font-semibold text-[#8A968A] uppercase tracking-wider">Сотрудник</th>
                      <th className="px-6 py-4 text-right text-[11px] font-semibold text-[#8A968A] uppercase tracking-wider">Работы (м²)</th>
                      <th className="px-6 py-4 text-right text-[11px] font-semibold text-[#8A968A] uppercase tracking-wider">Начислено</th>
                      <th className="px-6 py-4 text-right text-[11px] font-semibold text-[#8A968A] uppercase tracking-wider">Выплачено</th>
                      <th className="px-6 py-4 text-right text-[11px] font-semibold text-[#8A968A] uppercase tracking-wider">Долг</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#F0F2F0] text-sm">
                    {employeeStats.map(emp => (
                      <tr key={emp.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-[#2D332D]">{emp.lastName} {emp.firstName}</div>
                          <div className="text-[11px] text-[#8A968A]">{emp.role}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-[#5A6B5A]">{emp.sqm.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-[#2D332D]">{formatCurrency(emp.accrued, project.currency)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-[#4A7A4A]">{formatCurrency(emp.paid, project.currency)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={cn("px-2 py-1 rounded text-[11px] font-bold", emp.debt > 0 ? "bg-[#FFF4F0] text-[#D97706]" : "bg-[#F0F9F0] text-[#4A7A4A]")}>
                            {formatCurrency(emp.debt, project.currency)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* RECEIPTS TAB */}
        {activeTab === 'receipts' && (
          <div className="space-y-4">
            <button onClick={() => setAddingReceipt(!addingReceipt)} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#5A6B5A] hover:bg-[#4A5A4A]">
              <Plus className="-ml-1 mr-2 h-4 w-4" /> Добавить поступление
            </button>
            
            {addingReceipt && (
              <form onSubmit={handleAddReceipt} className="bg-white p-4 rounded-2xl shadow-sm border border-[#E0E5E0] grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8A968A] uppercase tracking-wider mb-1">Сумма</label>
                  <input type="number" step="0.01" required value={newReceipt.amount} onChange={e => setNewReceipt({...newReceipt, amount: e.target.value})} className="w-full px-3 py-2 border border-[#E0E5E0] bg-[#F9FBF9] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5A6B5A]/20 focus:border-[#5A6B5A]" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#8A968A] uppercase tracking-wider mb-1">Комментарий</label>
                  <div className="flex gap-2">
                    <input type="text" value={newReceipt.comment} onChange={e => setNewReceipt({...newReceipt, comment: e.target.value})} className="flex-1 px-3 py-2 border border-[#E0E5E0] bg-[#F9FBF9] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5A6B5A]/20 focus:border-[#5A6B5A]" />
                    <button type="submit" className="px-4 py-2 bg-[#5A6B5A] hover:bg-[#4A5A4A] text-white rounded-md text-sm font-medium">OK</button>
                  </div>
                </div>
              </form>
            )}

            <div className="bg-white rounded-2xl border border-[#E0E5E0] overflow-hidden">
              <ul className="divide-y divide-[#F0F2F0]">
                {projReceipts.map(r => (
                  <li key={r.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[#4A7A4A] mb-1">+{formatCurrency(r.amount, project.currency)}</div>
                      <div className="text-xs text-[#8A968A]">{format(r.date, 'dd MMM yyyy, HH:mm', { locale: ru })} {r.comment && `— ${r.comment}`}</div>
                    </div>
                    <button onClick={() => deleteReceipt(r.id)} className="text-[#8A968A] hover:text-[#B45309]"><Trash2 className="h-4 w-4"/></button>
                  </li>
                ))}
                {projReceipts.length === 0 && <li className="p-4 text-center text-sm text-[#8A968A]">Нет записей о поступлениях</li>}
              </ul>
            </div>
          </div>
        )}

        {/* WORK ENTRIES TAB */}
        {activeTab === 'work' && (
          <div className="space-y-4">
            <button onClick={() => setAddingWork(!addingWork)} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#5A6B5A] hover:bg-[#4A5A4A]">
              <Plus className="-ml-1 mr-2 h-4 w-4" /> Начислить работу (м²)
            </button>
            
            {addingWork && (
              <form onSubmit={handleAddWork} className="bg-white p-4 rounded-2xl shadow-sm border border-[#E0E5E0]">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#8A968A] uppercase tracking-wider mb-1">Сотрудник</label>
                    <select required value={newWork.employeeId} onChange={e => handleWorkEmployeeChange(e.target.value)} className="w-full px-3 py-2 border border-[#E0E5E0] bg-[#F9FBF9] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5A6B5A]/20 focus:border-[#5A6B5A]">
                      <option value="">Выберите...</option>
                      {employees.map(e => (
                        <option key={e.id} value={e.id}>{e.lastName} {e.firstName} ({e.role})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8A968A] uppercase tracking-wider mb-1">Объем (м²)</label>
                    <input type="number" step="0.01" required value={newWork.sqm} onChange={e => setNewWork({...newWork, sqm: e.target.value})} className="w-full px-3 py-2 border border-[#E0E5E0] bg-[#F9FBF9] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5A6B5A]/20 focus:border-[#5A6B5A]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8A968A] uppercase tracking-wider mb-1">Ставка</label>
                    <input type="number" step="0.01" required value={newWork.rate} onChange={e => setNewWork({...newWork, rate: e.target.value})} className="w-full px-3 py-2 border border-[#E0E5E0] bg-[#F9FBF9] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5A6B5A]/20 focus:border-[#5A6B5A]" />
                  </div>
                  <div className="sm:col-span-4 flex gap-2">
                     <div className="flex-1">
                      <label className="block text-xs font-semibold text-[#8A968A] uppercase tracking-wider mb-1">Комментарий к работе</label>
                      <input type="text" value={newWork.comment} onChange={e => setNewWork({...newWork, comment: e.target.value})} className="w-full px-3 py-2 border border-[#E0E5E0] bg-[#F9FBF9] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5A6B5A]/20 focus:border-[#5A6B5A]" placeholder="Например: Пол на кухне" />
                     </div>
                     <div className="self-end pb-[2px]">
                       <button type="submit" className="px-6 py-2 bg-[#5A6B5A] text-white rounded-md text-sm font-medium hover:bg-[#4A5A4A]">Сохранить</button>
                     </div>
                  </div>
                </div>
              </form>
            )}

            <div className="bg-white rounded-2xl border border-[#E0E5E0] overflow-hidden">
              <ul className="divide-y divide-[#F0F2F0]">
                {projWork.map(w => {
                  const emp = employees.find(e => e.id === w.employeeId);
                  return (
                  <li key={w.id} className="p-4 flex items-center justify-between hover:bg-[#F9FBF9] transition-colors">
                    <div>
                      <div className="font-semibold text-[#2D332D] mb-1">
                        {emp ? `${emp.lastName} ${emp.firstName}` : 'Неизвестный'} — {formatCurrency(w.amount, project.currency)}
                      </div>
                      <div className="text-xs text-[#6B776B]">
                        <span className="font-mono text-[#5A6B5A]">{w.sqm} м²</span> × {formatCurrency(w.rate, project.currency)} | {format(w.date, 'dd MMM yyyy, HH:mm', { locale: ru })} {w.comment && `— ${w.comment}`}
                      </div>
                    </div>
                    <button onClick={() => deleteWorkEntry(w.id)} className="text-[#8A968A] hover:text-[#B45309]"><Trash2 className="h-4 w-4"/></button>
                  </li>
                )})}
                {projWork.length === 0 && <li className="p-4 text-center text-sm text-[#8A968A]">Нет записей о работах</li>}
              </ul>
            </div>
          </div>
        )}

        {/* PAYMENTS TAB */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <button onClick={() => setAddingPayment(!addingPayment)} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#5A6B5A] hover:bg-[#4A5A4A]">
              <Plus className="-ml-1 mr-2 h-4 w-4" /> Добавить выплату
            </button>
            
            {addingPayment && (
              <form onSubmit={handleAddPayment} className="bg-white p-4 rounded-2xl shadow-sm border border-[#E0E5E0]">
                 <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#8A968A] uppercase tracking-wider mb-1">Сотрудник</label>
                    <select required value={newPayment.employeeId} onChange={e => setNewPayment({...newPayment, employeeId: e.target.value})} className="w-full px-3 py-2 border border-[#E0E5E0] bg-[#F9FBF9] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5A6B5A]/20 focus:border-[#5A6B5A]">
                      <option value="">Выберите...</option>
                      {employees.map(e => (
                        <option key={e.id} value={e.id}>{e.lastName} {e.firstName} ({e.role})</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#8A968A] uppercase tracking-wider mb-1">Сумма выплаты</label>
                    <input type="number" step="0.01" required value={newPayment.amount} onChange={e => setNewPayment({...newPayment, amount: e.target.value})} className="w-full px-3 py-2 border border-[#E0E5E0] bg-[#F9FBF9] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5A6B5A]/20 focus:border-[#5A6B5A]" />
                  </div>
                  <div className="sm:col-span-4 flex gap-2">
                     <div className="flex-1">
                      <label className="block text-xs font-semibold text-[#8A968A] uppercase tracking-wider mb-1">Комментарий</label>
                      <input type="text" value={newPayment.comment} onChange={e => setNewPayment({...newPayment, comment: e.target.value})} className="w-full px-3 py-2 border border-[#E0E5E0] bg-[#F9FBF9] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5A6B5A]/20 focus:border-[#5A6B5A]" placeholder="" />
                     </div>
                     <div className="self-end pb-[2px]">
                       <button type="submit" className="px-6 py-2 bg-[#5A6B5A] text-white rounded-md text-sm font-medium hover:bg-[#4A5A4A]">Сохранить</button>
                     </div>
                  </div>
                </div>
              </form>
            )}

            <div className="bg-white rounded-2xl border border-[#E0E5E0] overflow-hidden">
              <ul className="divide-y divide-[#F0F2F0]">
                {projPayments.map(p => {
                  const emp = employees.find(e => e.id === p.employeeId);
                  return (
                  <li key={p.id} className="p-4 flex items-center justify-between hover:bg-[#F9FBF9] transition-colors">
                    <div>
                      <div className="font-semibold text-[#4A7A4A] mb-1">
                        {emp ? `${emp.lastName} ${emp.firstName}` : 'Неизвестный'} — {formatCurrency(p.amount, project.currency)}
                      </div>
                      <div className="text-xs text-[#8A968A]">
                        {format(p.date, 'dd MMM yyyy, HH:mm', { locale: ru })} {p.comment && `— ${p.comment}`}
                      </div>
                    </div>
                    <button onClick={() => deletePayment(p.id)} className="text-[#8A968A] hover:text-[#B45309]"><Trash2 className="h-4 w-4"/></button>
                  </li>
                )})}
                {projPayments.length === 0 && <li className="p-4 text-center text-sm text-[#8A968A]">Нет записей о выплатах</li>}
              </ul>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
