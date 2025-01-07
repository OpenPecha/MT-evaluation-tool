import { LoaderFunction, redirect } from "@remix-run/node";
import { Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { Toaster } from "react-hot-toast";
import { db } from "~/services/db.server";
import Menu from "~/routes/admin/components/Menu";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const sessionEmail = url.searchParams.get("session");

  if (!sessionEmail) {
    return redirect("/");
  }

  const user = await db.user.findUnique({ where: { email: sessionEmail } });

  if (!user || user.role !== "ADMIN") {
    return redirect("/");
  }

  return { user };
};

export default function AdminLayout() {
  const { user } = useLoaderData<{ user: { email: string; role: string } }>();
  const location = useLocation();

  return (
    <div className="p-8 flex flex-col items-center">
      <Toaster position="top-right" />
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-lg font-semibold text-center text-gray-800 p-4 bg-blue-100 rounded-md shadow-md inline-block">
            Admin
          </h1>
        </div>
        <div className="flex justify-center mb-8">
          <Menu user={user} />
        </div>
        <main className="mt-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}