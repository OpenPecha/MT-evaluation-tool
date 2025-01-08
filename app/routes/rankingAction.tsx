import { redirect, type ActionFunction } from "@remix-run/node";
import { submitRanking } from "~/model/user.server";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const translationId = formData.get("translationId") as string;
  const userId = formData.get("userId") as string;
  const rankingsStr = formData.get("rankings") as string;

  const url = new URL(request.url);
  const session = url.searchParams.get("session");

  if(!session) {
    return { errors: { form: "Session not found" } };
  }
  
  try {
    const rankedCandidates = JSON.parse(rankingsStr) as string[];
    await submitRanking(translationId, userId, rankedCandidates);
    
    return redirect(`/?session=${session}`);
  } catch (error) {
    console.error("Ranking submission error:", error);
    return { errors: { form: "Failed to submit ranking" } };
  }
};