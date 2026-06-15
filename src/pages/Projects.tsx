import React, { useState } from 'react';
import { useStore } from '../store';
import { Link } from 'react-router-dom';
import { formatCurrency, cn } from '../lib/utils';
import { Plus, Building } from 'lucide-react';
import type { Currency } from '../types';

export function Projects() {
  const { projects, receipts, workEntries, payments, addProject } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', currency: 'BYN' as Currency });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;
    addProject({
      name: newProject.name.trim(),
      currency: newProject.currency,
    });
    setNewProject({ name: '', currency: 'BYN' });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-[#2D332D]">Объекты</h1>
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#5A6B5A] hover:bg-[#4A5A4A] transition-colors"
        >
          <Plus className="-ml-1 mr-2 h-4 w-4" />
          Добавить объект
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white p-4 rounded-lg shadow-sm border border-[#E0E5E0]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[#2D332D] mb-1">Название объекта</label>
              <input
                type="text"
                required
                autoFocus
                className="w-full px-3 py-2 border border-[#E0E5E0] bg-[#F9FBF9] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5A6B5A]/20 focus:border-[#5A6B5A]"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                placeholder="ЖК Центральный, дом 5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2D332D] mb-1">Валюта</label>
              <select
                className="w-full px-3 py-2 border border-[#E0E5E0] bg-[#F9FBF9] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5A6B5A]/20 focus:border-[#5A6B5A]"
                value={newProject.currency}
                onChange={(e) => setNewProject({ ...newProject, currency: e.target.value as Currency })}
              >
                <option value="BYN">BYN - Белорусский рубль</option>
                <option value="USD">USD - Доллар США</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 border border-[#E0E5E0] shadow-sm text-sm font-medium rounded-md text-[#5A6B5A] bg-white hover:bg-[#F9FBF9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5A6B5A]"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#5A6B5A] hover:bg-[#4A5A4A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5A6B5A]"
            >
              Сохранить
            </button>
          </div>
        </form>
      )}

      {projects.length === 0 && !isAdding ? (
        <div className="text-center py-12 bg-white rounded-lg border border-[#E0E5E0] border-dashed">
          <Building className="mx-auto h-12 w-12 text-[#8A968A]" />
          <h3 className="mt-2 text-sm font-medium text-[#2D332D]">Нет объектов</h3>
          <p className="mt-1 text-sm text-[#6B776B]">Начните с добавления нового строительного объекта.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const projectReceipts = receipts.filter((r) => r.projectId === project.id).reduce((sum, r) => sum + r.amount, 0);
            const projectPayments = payments.filter((p) => p.projectId === project.id).reduce((sum, p) => sum + p.amount, 0);
            const balance = projectReceipts - projectPayments;

            return (
              <Link
                key={project.id}
                to={`/project/${project.id}`}
                className="block bg-[#F0F4F0] rounded-xl border border-[#5A6B5A]/20 shadow-sm hover:bg-[#F9FBF9] transition-all overflow-hidden"
              >
                <div className="px-5 py-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#2D332D] truncate pr-4">{project.name}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] bg-white border border-[#E0E5E0] text-[#2D332D]">
                      {project.currency}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs text-[#6B776B]">
                      <span>Получено:</span>
                      <span className="font-medium text-[#2D332D]">{formatCurrency(projectReceipts, project.currency)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#6B776B]">
                      <span>Выплачено:</span>
                      <span className="font-medium text-[#2D332D]">{formatCurrency(projectPayments, project.currency)}</span>
                    </div>
                    <div className="pt-3 border-t border-[#E0E5E0] flex justify-between text-[11px] font-medium">
                      <span className="text-[#2D332D]">Остаток:</span>
                      <span className={cn(
                        "font-bold",
                        balance > 0 ? "text-[#4A7A4A]" : balance < 0 ? "text-[#D97706]" : "text-[#2D332D]"
                      )}>
                        {formatCurrency(balance, project.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
