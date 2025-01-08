import { db } from "~/services/db.server";
import type { Role } from "@prisma/client";

export async function createUserIfNotExists(email: string, role: Role = "ANNOTATOR") {
  let user = await db.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.log(`Creating user with email: ${email}`);
    user = await db.user.create({
      data: {
        email,
        role: "USER"  
      }
    });
  }

  return user;
}
export async function getUserRankings(
  email: string,
  options?: {
    limit?: number;
    offset?: number;
  }
) {
  const { limit = 10, offset = 0 } = options ?? {};

  const user = await db.user.findUnique({
    where: { email }
  });

  if (!user) {
    return [];
  }
  
  return await db.translation.findMany({
    where: {
      rankedById: user.id
    },
    orderBy: {
      updatedAt: 'desc'
    },
    take: limit,
    skip: offset,
    select: {
      id: true,
      sourceText: true,
      targetText: true,
      rankings: true,
      candidates: true,
      updatedAt: true  
    }
  });
}

export async function getNextTranslationToRank() {
  return await db.translation.findFirst({
    where: {
      rankedById: null
    },
    select: {
      id: true,
      sourceText: true,
      targetText: true,
      candidates: true
    }
  });
}

export async function submitRanking(
  translationId: string,
  userId: string,
  rankings: Record<string, number>
) {
  return await db.translation.update({
    where: { id: translationId },
    data: {
      rankings,
      rankedById: userId,
      updatedAt: new Date()
    }
  });
}