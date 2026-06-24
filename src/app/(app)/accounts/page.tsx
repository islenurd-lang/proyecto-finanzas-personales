import { getAccountsWithCalculatedBalance } from "@/features/accounts/account.service";
import { formatMoney } from "@/lib/money";
import AccountsClient from "./accounts-client";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const accounts = await getAccountsWithCalculatedBalance();

  const totalAccounts = accounts.length;
  const activeAccounts = accounts.filter((a) => a.isActive).length;
  const totalBalance = accounts
    .filter((a) => a.isActive)
    .reduce((sum, a) => sum + a.calculatedBalanceCents, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Cuentas</h2>
        <p className="text-sm text-slate-500 mt-1">
          Administra tus cuentas de efectivo, banco, tarjetas y más.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500">Total cuentas</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalAccounts}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500">Activas</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{activeAccounts}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500">Balance total</p>
          <p className="text-2xl font-bold text-navy-700 mt-1">{formatMoney(totalBalance)}</p>
        </div>
      </div>

      <AccountsClient accounts={JSON.parse(JSON.stringify(accounts))} />
    </div>
  );
}
