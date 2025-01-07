import type { LoaderFunction } from "@remix-run/node";
import { getUserRankings } from "~/model/user.server";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const session = url.searchParams.get("session");

  if (!session) {
    return Response.json({ message: "Session required" }, { status: 400 });
  }

  try {
    const rankings = await getUserRankings(session);
    console.log('Found rankings:', rankings); 
    return Response.json({ rankings });
  } catch (error) {
    console.error("Failed to fetch rankings:", error);
    return Response.json({ rankings: [] }, { status: 500 });
  }
};