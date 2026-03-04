export interface ISupplier {
  name: string;
  active: boolean;

  createdAt: Date;

  leadTimeDays: number;
  safetyDays: number;
}
