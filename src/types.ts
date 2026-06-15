export type Currency = 'BYN' | 'USD';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  defaultRate?: number; // legacy
  defaultRateByn?: number;
  defaultRateUsd?: number;
  comment: string;
  createdAt: number;
}

export interface Project {
  id: string;
  name: string;
  currency: Currency;
  createdAt: number;
}

export interface Receipt {
  id: string;
  projectId: string;
  date: number;
  amount: number;
  comment: string;
}

export interface WorkEntry {
  id: string;
  projectId: string;
  employeeId: string;
  date: number;
  sqm: number;
  rate: number;
  amount: number;
  comment: string;
}

export interface Payment {
  id: string;
  projectId: string;
  employeeId: string;
  date: number;
  amount: number;
  comment: string;
}
