import * as xlsx from 'xlsx';
import { format } from 'date-fns';
import { useStore } from '../store';

export function exportProjectReportToExcel(projectId: string) {
  const state = useStore.getState();
  const project = state.projects.find(p => p.id === projectId);
  if (!project) return;

  const projReceipts = state.receipts.filter(r => r.projectId === projectId).sort((a,b) => b.date - a.date);
  const projWork = state.workEntries.filter(w => w.projectId === projectId).sort((a,b) => b.date - a.date);
  const projPayments = state.payments.filter(p => p.projectId === projectId).sort((a,b) => b.date - a.date);

  const totalReceipts = projReceipts.reduce((sum, r) => sum + r.amount, 0);
  const totalPaid = projPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalAccrued = projWork.reduce((sum, w) => sum + w.amount, 0);

  // Sheet 1: Summary & Employees
  const employeeStats = state.employees.map(emp => {
    const w = projWork.filter(x => x.employeeId === emp.id);
    const p = projPayments.filter(x => x.employeeId === emp.id);
    const accrued = w.reduce((sum, x) => sum + x.amount, 0);
    const paid = p.reduce((sum, x) => sum + x.amount, 0);
    const sqm = w.reduce((sum, x) => sum + x.sqm, 0);
    return { 
      'Сотрудник': `${emp.lastName} ${emp.firstName}`,
      'Должность': emp.role,
      'Работы (м²)': sqm,
      'Начислено': accrued,
      'Выплачено': paid,
      'Задолженность': accrued - paid
    };
  }).filter(e => e['Начислено'] > 0 || e['Выплачено'] > 0);

  const summaryData = [
    { 'Показатель': 'Получено средств', 'Сумма': totalReceipts },
    { 'Показатель': 'Сумма начислений', 'Сумма': totalAccrued },
    { 'Показатель': 'Выплачено', 'Сумма': totalPaid },
    { 'Показатель': 'Остаток', 'Сумма': totalReceipts - totalPaid },
  ];

  // Sheet 2: Received Funds
  const receiptsSheetData = projReceipts.map(r => ({
    'Дата': format(r.date, 'dd.MM.yyyy HH:mm'),
    'Сумма': r.amount,
    'Комментарий': r.comment || ''
  }));

  // Sheet 3: Works
  const worksSheetData = projWork.map(w => {
    const emp = state.employees.find(e => e.id === w.employeeId);
    return {
      'Дата': format(w.date, 'dd.MM.yyyy HH:mm'),
      'Сотрудник': emp ? `${emp.lastName} ${emp.firstName}` : 'Удаленный сотрудник',
      'Объем (м²)': w.sqm,
      'Ставка': w.rate,
      'Начислено': w.amount,
      'Комментарий': w.comment || ''
    };
  });

  // Sheet 4: Payments
  const paymentsSheetData = projPayments.map(p => {
    const emp = state.employees.find(e => e.id === p.employeeId);
    return {
      'Дата': format(p.date, 'dd.MM.yyyy HH:mm'),
      'Сотрудник': emp ? `${emp.lastName} ${emp.firstName}` : 'Удаленный сотрудник',
      'Сумма': p.amount,
      'Комментарий': p.comment || ''
    };
  });

  const wb = xlsx.utils.book_new();
  
  const ws1 = xlsx.utils.json_to_sheet(summaryData);
  xlsx.utils.sheet_add_json(ws1, [{'Показатель': '', 'Сумма': ''}], {skipHeader: true, origin: -1});
  xlsx.utils.sheet_add_json(ws1, employeeStats, {origin: -1});
  xlsx.utils.book_append_sheet(wb, ws1, "Сводка");

  const ws2 = xlsx.utils.json_to_sheet(receiptsSheetData);
  xlsx.utils.book_append_sheet(wb, ws2, "Поступления");

  const ws3 = xlsx.utils.json_to_sheet(worksSheetData);
  xlsx.utils.book_append_sheet(wb, ws3, "Работы");

  const ws4 = xlsx.utils.json_to_sheet(paymentsSheetData);
  xlsx.utils.book_append_sheet(wb, ws4, "Выплаты");

  xlsx.writeFile(wb, `Отчет_${project.name}.xlsx`);
}
