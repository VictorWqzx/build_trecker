import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Employee, Project, Receipt, WorkEntry, Payment } from './types';

interface AppState {
  employees: Employee[];
  projects: Project[];
  receipts: Receipt[];
  workEntries: WorkEntry[];
  payments: Payment[];

  addEmployee: (employee: Omit<Employee, 'id' | 'createdAt'>) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  addReceipt: (receipt: Omit<Receipt, 'id'>) => void;
  updateReceipt: (id: string, data: Partial<Receipt>) => void;
  deleteReceipt: (id: string) => void;

  addWorkEntry: (entry: Omit<WorkEntry, 'id' | 'amount'>) => void;
  updateWorkEntry: (id: string, data: Partial<WorkEntry>) => void;
  deleteWorkEntry: (id: string) => void;

  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (id: string, data: Partial<Payment>) => void;
  deletePayment: (id: string) => void;

  importData: (data: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      employees: [],
      projects: [],
      receipts: [],
      workEntries: [],
      payments: [],

      addEmployee: (emp) =>
        set((state) => ({
          employees: [
            ...state.employees,
            { ...emp, id: crypto.randomUUID(), createdAt: Date.now() },
          ],
        })),
      updateEmployee: (id, data) =>
        set((state) => ({
          employees: state.employees.map((e) => (e.id === id ? { ...e, ...data } : e)),
        })),
      deleteEmployee: (id) =>
        set((state) => ({
          employees: state.employees.filter((e) => e.id !== id),
          workEntries: state.workEntries.filter((w) => w.employeeId !== id),
          payments: state.payments.filter((p) => p.employeeId !== id),
        })),

      addProject: (proj) =>
        set((state) => ({
          projects: [
            ...state.projects,
            { ...proj, id: crypto.randomUUID(), createdAt: Date.now() },
          ],
        })),
      updateProject: (id, data) =>
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, ...data } : p)),
        })),
      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          receipts: state.receipts.filter((r) => r.projectId !== id),
          workEntries: state.workEntries.filter((w) => w.projectId !== id),
          payments: state.payments.filter((p) => p.projectId !== id),
        })),

      addReceipt: (receipt) =>
        set((state) => ({
          receipts: [...state.receipts, { ...receipt, id: crypto.randomUUID() }],
        })),
      updateReceipt: (id, data) =>
        set((state) => ({
          receipts: state.receipts.map((r) => (r.id === id ? { ...r, ...data } : r)),
        })),
      deleteReceipt: (id) =>
        set((state) => ({ receipts: state.receipts.filter((r) => r.id !== id) })),

      addWorkEntry: (entry) =>
        set((state) => ({
          workEntries: [
            ...state.workEntries,
            { ...entry, id: crypto.randomUUID(), amount: entry.sqm * entry.rate },
          ],
        })),
      updateWorkEntry: (id, data) =>
        set((state) => ({
          workEntries: state.workEntries.map((w) => {
            if (w.id === id) {
              const updated = { ...w, ...data };
              updated.amount = updated.sqm * updated.rate;
              return updated;
            }
            return w;
          }),
        })),
      deleteWorkEntry: (id) =>
        set((state) => ({ workEntries: state.workEntries.filter((w) => w.id !== id) })),

      addPayment: (payment) =>
        set((state) => ({
          payments: [...state.payments, { ...payment, id: crypto.randomUUID() }],
        })),
      updatePayment: (id, data) =>
        set((state) => ({
          payments: state.payments.map((p) => (p.id === id ? { ...p, ...data } : p)),
        })),
      deletePayment: (id) =>
        set((state) => ({ payments: state.payments.filter((p) => p.id !== id) })),

      importData: (data) => {
        try {
          const parsed = JSON.parse(data);
          if (parsed && typeof parsed === 'object') {
            set({
              employees: parsed.employees || [],
              projects: parsed.projects || [],
              receipts: parsed.receipts || [],
              workEntries: parsed.workEntries || [],
              payments: parsed.payments || [],
            });
          }
        } catch (e) {
          console.error("Failed to import data", e);
          alert("Ошибка при импорте данных. Проверьте формат файла.");
        }
      },
    }),
    {
      name: 'salary-tracker-storage',
    }
  )
);
