import React, { useState } from 'react';
import { useStore } from '../store';
import { formatCurrency } from '../lib/utils';
import { Plus, Users as UsersIcon, Trash2, Edit2, X, Check } from 'lucide-react';

export function Employees() {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    role: '',
    defaultRateByn: '',
    defaultRateUsd: '',
    comment: ''
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    role: '',
    defaultRateByn: '',
    defaultRateUsd: '',
    comment: ''
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.firstName.trim() || !newEmployee.lastName.trim()) return;
    
    addEmployee({
      firstName: newEmployee.firstName.trim(),
      lastName: newEmployee.lastName.trim(),
      role: newEmployee.role.trim() || 'Разнорабочий',
      defaultRateByn: parseFloat(newEmployee.defaultRateByn) || 0,
      defaultRateUsd: parseFloat(newEmployee.defaultRateUsd) || 0,
      comment: newEmployee.comment.trim(),
    });
    
    setNewEmployee({ firstName: '', lastName: '', role: '', defaultRateByn: '', defaultRateUsd: '', comment: '' });
    setIsAdding(false);
  };

  const handleSaveEdit = (id: string) => {
    if (!editData.firstName.trim() || !editData.lastName.trim()) return;
    updateEmployee(id, {
      firstName: editData.firstName.trim(),
      lastName: editData.lastName.trim(),
      role: editData.role.trim(),
      defaultRateByn: parseFloat(editData.defaultRateByn) || 0,
      defaultRateUsd: parseFloat(editData.defaultRateUsd) || 0,
      comment: editData.comment.trim(),
    });
    setEditingId(null);
  };

  const startEdit = (employee: any) => {
    setEditingId(employee.id);
    setEditData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      role: employee.role,
      defaultRateByn: String(employee.defaultRateByn ?? employee.defaultRate ?? ''),
      defaultRateUsd: String(employee.defaultRateUsd ?? employee.defaultRate ?? ''),
      comment: employee.comment || ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-[#2D332D]">Сотрудники</h1>
        <button
          onClick={() => { setIsAdding(true); setEditingId(null); }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#5A6B5A] hover:bg-[#4A5A4A] transition-colors"
        >
          <Plus className="-ml-1 mr-2 h-4 w-4" />
          Добавить сотрудника
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-[#E0E5E0]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-[#2D332D] mb-1">Имя</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-[#E0E5E0] bg-[#F9FBF9] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5A6B5A]/20 focus:border-[#5A6B5A]"
                value={newEmployee.firstName}
                onChange={(e) => setNewEmployee({ ...newEmployee, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2D332D] mb-1">Фамилия</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-[#E0E5E0] bg-[#F9FBF9] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5A6B5A]/20 focus:border-[#5A6B5A]"
                value={newEmployee.lastName}
                onChange={(e) => setNewEmployee({ ...newEmployee, lastName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2D332D] mb-1">Должность / Специализация</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-[#E0E5E0] bg-[#F9FBF9] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5A6B5A]/20 focus:border-[#5A6B5A]"
                value={newEmployee.role}
                onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                placeholder="Плиточник"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2D332D] mb-1">Ставка (BYN / м²)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-[#E0E5E0] bg-[#F9FBF9] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5A6B5A]/20 focus:border-[#5A6B5A]"
                  value={newEmployee.defaultRateByn}
                  onChange={(e) => setNewEmployee({ ...newEmployee, defaultRateByn: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D332D] mb-1">Ставка (USD / м²)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-[#E0E5E0] bg-[#F9FBF9] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5A6B5A]/20 focus:border-[#5A6B5A]"
                  value={newEmployee.defaultRateUsd}
                  onChange={(e) => setNewEmployee({ ...newEmployee, defaultRateUsd: e.target.value })}
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[#2D332D] mb-1">Примечание (необязательно)</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-[#E0E5E0] bg-[#F9FBF9] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5A6B5A]/20 focus:border-[#5A6B5A]"
                value={newEmployee.comment}
                onChange={(e) => setNewEmployee({ ...newEmployee, comment: e.target.value })}
              />
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

      {employees.length === 0 && !isAdding ? (
        <div className="text-center py-12 bg-white rounded-lg border border-[#E0E5E0] border-dashed">
          <UsersIcon className="mx-auto h-12 w-12 text-[#8A968A]" />
          <h3 className="mt-2 text-sm font-medium text-[#2D332D]">Сотрудников пока нет</h3>
          <p className="mt-1 text-sm text-[#6B776B]">Добавьте первого сотрудника для начала работы.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="bg-[#F9FBF9] rounded-xl border border-[#E0E5E0] shadow-sm overflow-hidden"
            >
              <div className="px-5 py-5 group">
                {editingId === employee.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                       <input
                         type="text"
                         className="w-full px-2 py-1 text-sm border border-[#E0E5E0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#5A6B5A]"
                         value={editData.firstName}
                         onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                         placeholder="Имя"
                       />
                       <input
                         type="text"
                         className="w-full px-2 py-1 text-sm border border-[#E0E5E0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#5A6B5A]"
                         value={editData.lastName}
                         onChange={(e) => setEditData({...editData, lastName: e.target.value})}
                         placeholder="Фамилия"
                       />
                    </div>
                    <input
                      type="text"
                      className="w-full px-2 py-1 text-sm border border-[#E0E5E0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#5A6B5A]"
                      value={editData.role}
                      onChange={(e) => setEditData({...editData, role: e.target.value})}
                      placeholder="Должность"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          title="Ставка в BYN"
                          className="w-full px-2 py-1 text-sm border border-[#E0E5E0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#5A6B5A]"
                          value={editData.defaultRateByn}
                          onChange={(e) => setEditData({...editData, defaultRateByn: e.target.value})}
                          placeholder="BYN/м²"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          title="Ставка в USD"
                          className="w-full px-2 py-1 text-sm border border-[#E0E5E0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#5A6B5A]"
                          value={editData.defaultRateUsd}
                          onChange={(e) => setEditData({...editData, defaultRateUsd: e.target.value})}
                          placeholder="USD/м²"
                        />
                      </div>
                    </div>
                    <input
                      type="text"
                      className="w-full px-2 py-1 text-sm border border-[#E0E5E0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#5A6B5A]"
                      value={editData.comment}
                      onChange={(e) => setEditData({...editData, comment: e.target.value})}
                      placeholder="Примечание"
                    />
                    <div className="flex justify-end gap-2 pt-2">
                      <button onClick={() => setEditingId(null)} className="p-1 text-[#8A968A] hover:bg-[#E0E5E0] rounded">
                        <X className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleSaveEdit(employee.id)} className="p-1 text-[#4A7A4A] hover:bg-[#E6EEE6] rounded">
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-[#2D332D] truncate">
                        {employee.lastName} {employee.firstName}
                      </h3>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => startEdit(employee)}
                          className="text-[#8A968A] hover:text-[#5A6B5A] p-1 rounded hover:bg-[#E0E5E0] bg-[#F0F4F0] sm:bg-transparent"
                        >
                          <Edit2 className="h-4 w-4"/>
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm('Удалить сотрудника? Все связанные записи о работах и выплатах будут удалены!')) {
                              deleteEmployee(employee.id);
                            }
                          }}
                          className="text-[#8A968A] hover:text-[#B45309] p-1 rounded hover:bg-[#FFF4F0] bg-[#FFF4F0] sm:bg-transparent"
                        >
                          <Trash2 className="h-4 w-4"/>
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#8A968A] uppercase tracking-wider mb-4">{employee.role}</p>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs text-[#6B776B]">
                        <span>Ставка (BYN):</span>
                        <span className="font-medium text-[#2D332D]">{employee.defaultRateByn ?? employee.defaultRate ?? 0} / м²</span>
                      </div>
                      <div className="flex justify-between text-xs text-[#6B776B]">
                        <span>Ставка (USD):</span>
                        <span className="font-medium text-[#2D332D]">{employee.defaultRateUsd ?? employee.defaultRate ?? 0} / м²</span>
                      </div>
                      
                      {employee.comment && (
                        <div className="pt-3 border-t border-[#E0E5E0]">
                          <p className="text-xs text-[#6B776B] italic">"{employee.comment}"</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
