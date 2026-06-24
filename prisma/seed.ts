import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");
const adapter = new PrismaLibSql({ url });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean existing data
  await prisma.transactionTag.deleteMany();
  await prisma.debtPayment.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.savingGoal.deleteMany();
  await prisma.debt.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.account.deleteMany();
  await prisma.appSetting.deleteMany();
  await prisma.user.deleteMany();

  // ─── User ───
  const user = await prisma.user.create({
    data: {
      name: "Usuario Demo",
      email: "demo@finanzas.local",
      preferredCurrency: "DOP",
    },
  });

  // ─── Accounts ───
  const efectivo = await prisma.account.create({
    data: {
      userId: user.id,
      name: "Efectivo",
      type: "CASH",
      initialBalanceCents: 15000_00,
    },
  });

  const bancoPopular = await prisma.account.create({
    data: {
      userId: user.id,
      name: "Banco Popular",
      type: "BANK",
      initialBalanceCents: 120000_00,
    },
  });

  const tarjetaCredito = await prisma.account.create({
    data: {
      userId: user.id,
      name: "Tarjeta de Crédito",
      type: "CREDIT_CARD",
      initialBalanceCents: 0,
    },
  });

  const ahorroEmergencia = await prisma.account.create({
    data: {
      userId: user.id,
      name: "Ahorro Emergencia",
      type: "SAVINGS",
      initialBalanceCents: 150000_00,
    },
  });

  // ─── Categories (Income) ───
  const catSalario = await prisma.category.create({
    data: { userId: user.id, name: "Salario", type: "INCOME", color: "#10B981", icon: "briefcase", isDefault: true },
  });
  const catNegocio = await prisma.category.create({
    data: { userId: user.id, name: "Negocio", type: "INCOME", color: "#059669", icon: "building", isDefault: true },
  });
  await prisma.category.create({
    data: { userId: user.id, name: "Freelance", type: "INCOME", color: "#047857", icon: "laptop", isDefault: true },
  });
  const catOtrosIngresos = await prisma.category.create({
    data: { userId: user.id, name: "Otros ingresos", type: "INCOME", color: "#6EE7B7", icon: "plus-circle", isDefault: true },
  });

  // ─── Categories (Expense) ───
  const catComida = await prisma.category.create({
    data: { userId: user.id, name: "Comida", type: "EXPENSE", color: "#F43F5E", icon: "utensils", isDefault: true },
  });
  const catTransporte = await prisma.category.create({
    data: { userId: user.id, name: "Transporte", type: "EXPENSE", color: "#F59E0B", icon: "car", isDefault: true },
  });
  const catVivienda = await prisma.category.create({
    data: { userId: user.id, name: "Vivienda", type: "EXPENSE", color: "#3B82F6", icon: "home", isDefault: true },
  });
  const catServicios = await prisma.category.create({
    data: { userId: user.id, name: "Servicios", type: "EXPENSE", color: "#8B5CF6", icon: "zap", isDefault: true },
  });
  await prisma.category.create({
    data: { userId: user.id, name: "Educación", type: "EXPENSE", color: "#06B6D4", icon: "book", isDefault: true },
  });
  await prisma.category.create({
    data: { userId: user.id, name: "Salud", type: "EXPENSE", color: "#EC4899", icon: "heart", isDefault: true },
  });
  const catEntretenimiento = await prisma.category.create({
    data: { userId: user.id, name: "Entretenimiento", type: "EXPENSE", color: "#A855F7", icon: "film", isDefault: true },
  });
  const catDeuda = await prisma.category.create({
    data: { userId: user.id, name: "Deuda", type: "EXPENSE", color: "#EF4444", icon: "credit-card", isDefault: true },
  });
  await prisma.category.create({
    data: { userId: user.id, name: "Ahorro", type: "EXPENSE", color: "#14B8A6", icon: "piggy-bank", isDefault: true },
  });
  await prisma.category.create({
    data: { userId: user.id, name: "Otros gastos", type: "EXPENSE", color: "#64748B", icon: "more-horizontal", isDefault: true },
  });

  // ─── Transactions ───
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const d = (day: number) => new Date(year, month, day);

  // Incomes
  await prisma.transaction.create({
    data: {
      userId: user.id, type: "INCOME", amountCents: 44000_00,
      date: d(1), destinationAccountId: bancoPopular.id, categoryId: catSalario.id,
      description: "Salario quincenal 1ra", status: "CONFIRMED",
    },
  });
  await prisma.transaction.create({
    data: {
      userId: user.id, type: "INCOME", amountCents: 44000_00,
      date: d(15), destinationAccountId: bancoPopular.id, categoryId: catSalario.id,
      description: "Salario quincenal 2da", status: "CONFIRMED",
    },
  });
  await prisma.transaction.create({
    data: {
      userId: user.id, type: "INCOME", amountCents: 8500_00,
      date: d(10), destinationAccountId: bancoPopular.id, categoryId: catNegocio.id,
      description: "Venta de productos", status: "CONFIRMED",
    },
  });
  await prisma.transaction.create({
    data: {
      userId: user.id, type: "INCOME", amountCents: 3000_00,
      date: d(5), destinationAccountId: efectivo.id, categoryId: catOtrosIngresos.id,
      description: "Reembolso seguro", status: "CONFIRMED",
    },
  });

  // Expenses
  await prisma.transaction.create({
    data: {
      userId: user.id, type: "EXPENSE", amountCents: 22000_00,
      date: d(1), sourceAccountId: bancoPopular.id, categoryId: catVivienda.id,
      description: "Pago alquiler", status: "CONFIRMED",
    },
  });
  await prisma.transaction.create({
    data: {
      userId: user.id, type: "EXPENSE", amountCents: 4850_00,
      date: d(3), sourceAccountId: tarjetaCredito.id, categoryId: catComida.id,
      description: "Supermercado Nacional", status: "CONFIRMED",
    },
  });
  await prisma.transaction.create({
    data: {
      userId: user.id, type: "EXPENSE", amountCents: 3200_00,
      date: d(5), sourceAccountId: efectivo.id, categoryId: catComida.id,
      description: "Restaurante y delivery", status: "CONFIRMED",
    },
  });
  await prisma.transaction.create({
    data: {
      userId: user.id, type: "EXPENSE", amountCents: 2800_00,
      date: d(7), sourceAccountId: tarjetaCredito.id, categoryId: catComida.id,
      description: "Compras colmado", status: "CONFIRMED",
    },
  });
  await prisma.transaction.create({
    data: {
      userId: user.id, type: "EXPENSE", amountCents: 1200_00,
      date: d(4), sourceAccountId: efectivo.id, categoryId: catTransporte.id,
      description: "Uber / InDriver", status: "CONFIRMED",
    },
  });
  await prisma.transaction.create({
    data: {
      userId: user.id, type: "EXPENSE", amountCents: 3500_00,
      date: d(8), sourceAccountId: bancoPopular.id, categoryId: catTransporte.id,
      description: "Gasolina", status: "CONFIRMED",
    },
  });
  await prisma.transaction.create({
    data: {
      userId: user.id, type: "EXPENSE", amountCents: 2500_00,
      date: d(10), sourceAccountId: bancoPopular.id, categoryId: catServicios.id,
      description: "Internet Altice", status: "CONFIRMED",
    },
  });
  await prisma.transaction.create({
    data: {
      userId: user.id, type: "EXPENSE", amountCents: 1800_00,
      date: d(10), sourceAccountId: bancoPopular.id, categoryId: catServicios.id,
      description: "Electricidad EDESUR", status: "CONFIRMED",
    },
  });
  await prisma.transaction.create({
    data: {
      userId: user.id, type: "EXPENSE", amountCents: 1500_00,
      date: d(12), sourceAccountId: bancoPopular.id, categoryId: catServicios.id,
      description: "Agua CAASD", status: "CONFIRMED",
    },
  });
  await prisma.transaction.create({
    data: {
      userId: user.id, type: "EXPENSE", amountCents: 3500_00,
      date: d(14), sourceAccountId: tarjetaCredito.id, categoryId: catEntretenimiento.id,
      description: "Cine + cena fuera", status: "CONFIRMED",
    },
  });
  await prisma.transaction.create({
    data: {
      userId: user.id, type: "EXPENSE", amountCents: 5000_00,
      date: d(15), sourceAccountId: bancoPopular.id, categoryId: catDeuda.id,
      description: "Cuota préstamo personal", status: "CONFIRMED",
    },
  });

  // Transfer
  await prisma.transaction.create({
    data: {
      userId: user.id, type: "TRANSFER", amountCents: 10000_00,
      date: d(2), sourceAccountId: bancoPopular.id, destinationAccountId: ahorroEmergencia.id,
      description: "Transferencia a ahorro", status: "CONFIRMED",
    },
  });

  // Pending transaction
  await prisma.transaction.create({
    data: {
      userId: user.id, type: "EXPENSE", amountCents: 2000_00,
      date: d(18), sourceAccountId: tarjetaCredito.id, categoryId: catComida.id,
      description: "Pedido PedidosYa (pendiente)", status: "PENDING",
    },
  });

  // ─── Budgets ───
  const currentMonth = month + 1;

  await prisma.budget.create({
    data: { userId: user.id, categoryId: catComida.id, month: currentMonth, year, limitAmountCents: 15000_00 },
  });
  await prisma.budget.create({
    data: { userId: user.id, categoryId: catTransporte.id, month: currentMonth, year, limitAmountCents: 8000_00 },
  });
  await prisma.budget.create({
    data: { userId: user.id, categoryId: catEntretenimiento.id, month: currentMonth, year, limitAmountCents: 5000_00 },
  });
  await prisma.budget.create({
    data: { userId: user.id, categoryId: catServicios.id, month: currentMonth, year, limitAmountCents: 7000_00 },
  });
  await prisma.budget.create({
    data: { userId: user.id, categoryId: catDeuda.id, month: currentMonth, year, limitAmountCents: 10000_00 },
  });

  // ─── Saving Goals ───
  await prisma.savingGoal.create({
    data: {
      userId: user.id, name: "Fondo de emergencia",
      targetAmountCents: 300000_00, currentAmountCents: 150000_00,
      targetDate: new Date(year, 11, 31), accountId: ahorroEmergencia.id,
    },
  });
  await prisma.savingGoal.create({
    data: {
      userId: user.id, name: "Viaje",
      targetAmountCents: 80000_00, currentAmountCents: 25000_00,
      targetDate: new Date(year + 1, 2, 1),
    },
  });

  // ─── Debts ───
  await prisma.debt.create({
    data: {
      userId: user.id, creditorName: "Tarjeta de Crédito",
      originalAmountCents: 45000_00, currentBalanceCents: 32000_00,
      interestRate: 3.5, monthlyPaymentCents: 5000_00,
      dueDate: new Date(year + 1, 5, 30), status: "ACTIVE",
    },
  });
  await prisma.debt.create({
    data: {
      userId: user.id, creditorName: "Préstamo Personal",
      originalAmountCents: 150000_00, currentBalanceCents: 95000_00,
      interestRate: 1.8, monthlyPaymentCents: 8500_00,
      dueDate: new Date(year + 2, 0, 15), status: "ACTIVE",
    },
  });

  // ─── Tags ───
  await prisma.tag.create({ data: { userId: user.id, name: "recurrente", color: "#3B82F6" } });
  await prisma.tag.create({ data: { userId: user.id, name: "importante", color: "#EF4444" } });
  await prisma.tag.create({ data: { userId: user.id, name: "variable", color: "#F59E0B" } });

  // ─── App Setting ───
  await prisma.appSetting.create({
    data: { userId: user.id, primaryCurrency: "DOP", dateFormat: "dd/MM/yyyy", theme: "SYSTEM" },
  });

  console.log("✅ Seed completado exitosamente");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
