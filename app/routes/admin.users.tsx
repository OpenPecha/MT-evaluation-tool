import { LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/services/db.server";
import { Role } from "@prisma/client";
import Users from "~/routes/admin/components/Users";

export const loader: LoaderFunction = async () => {
  const users = await db.user.findMany();
  
  return new Response(
    JSON.stringify({ users }), 
    { 
      headers: { "Content-Type": "application/json" }
    }
  );
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const userId = formData.get("userId") as string;
  const role = formData.get("role") as Role;

  if (!userId || !role) {
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Invalid data" 
      }), 
      { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    await db.user.update({
      where: { id: userId },
      data: { role },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Role updated successfully" 
      }), 
      { 
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Role update failed:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Failed to update role" 
      }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};

export default function AdminUsers() {
  const { users } = useLoaderData<{ users: User[] }>();
  return <Users users={users} />;
}