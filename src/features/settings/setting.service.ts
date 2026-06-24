import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/demo-user";
import type { Theme } from "@/generated/prisma/client";

export async function getAppSettings() {
  const user = await getDemoUser();

  let settings = await prisma.appSetting.findUnique({ where: { userId: user.id } });

  if (!settings) {
    settings = await prisma.appSetting.create({
      data: {
        userId: user.id,
        primaryCurrency: user.preferredCurrency,
        dateFormat: user.dateFormat,
        theme: user.theme,
      },
    });
  }

  return {
    ...settings,
    userName: user.name,
    userEmail: user.email,
  };
}

export async function updateAppSettings(input: {
  primaryCurrency: string;
  dateFormat: string;
  theme: string;
}) {
  const user = await getDemoUser();

  const settings = await prisma.appSetting.upsert({
    where: { userId: user.id },
    update: {
      primaryCurrency: input.primaryCurrency,
      dateFormat: input.dateFormat,
      theme: input.theme as Theme,
    },
    create: {
      userId: user.id,
      primaryCurrency: input.primaryCurrency,
      dateFormat: input.dateFormat,
      theme: input.theme as Theme,
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      preferredCurrency: input.primaryCurrency,
      dateFormat: input.dateFormat,
      theme: input.theme as Theme,
    },
  });

  return settings;
}
