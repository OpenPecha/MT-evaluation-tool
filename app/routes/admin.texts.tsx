import { LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/services/db.server";
import Texts from "~/routes/admin/components/Texts";

export const loader: LoaderFunction = async () => {
  return new Response(
    JSON.stringify({ success: true }), 
    { headers: { "Content-Type": "application/json" } }
  );
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const data = formData.get("data") as string;

  if (!name || !data) {
    return new Response(
      JSON.stringify({ success: false, error: "Missing required fields" }), 
      { 
        status: 400,
        headers: { "Content-Type": "application/json" } 
      }
    );
  }

  try {
    const jsonData = JSON.parse(data);

    if (!Array.isArray(jsonData)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid JSON format: expected an array" 
        }), 
        { 
          status: 400,
          headers: { "Content-Type": "application/json" } 
        }
      );
    }

    const translations = await Promise.all(
      jsonData.map(async (item) => {
        if (!item.sourceText || !item.targetText) {
          throw new Error("Invalid entry: missing sourceText or targetText");
        }

        return await db.translation.create({
          data: {
            sourceText: item.sourceText,
            targetText: item.targetText,
            candidates: item.candidates || [],
            rankings: item.rankings || null,
          },
        });
      })
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully processed ${translations.length} translations`
      }), 
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing JSON file:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Failed to process file"
      }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
};

export default function AdminTexts() {
  return (
    <div className="w-full">
      <Texts />
    </div>
  );
}