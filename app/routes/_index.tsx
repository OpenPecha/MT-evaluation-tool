import {
  redirect,
  type LoaderFunction,
  type MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { createUserIfNotExists, getNextTranslationToRank } from "~/model/user.server";
import RankingTranslation from "~/local_components/rankingtranslations";
import Sidebar from "~/local_components/sidebar";
import { MenuIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const session = url.searchParams.get("session") as string;

  if (!session) {
    return {
      error: "Please login with your email",
    };
  }

  try {
    const user = await createUserIfNotExists(session);

    if (user?.role === "ADMIN") {
      return redirect(`/admin?session=${session}`);
    }

    if (user?.role === "ANNOTATOR") {
      const translation = await getNextTranslationToRank();
      
      if (!translation) {
        return { 
          user,
          error: "No translations available for ranking. Please check back later."
        };
      }
      
      return { user, translation };
    }

    return { 
      user, 
      error: "Please wait for admin to assign you a role." 
    };

  } catch (error) {
    console.error("Database error:", error);
    return { error: "Something went wrong. Please try again later." };
  }
};

export const meta: MetaFunction = () => {
  return [
    { title: "MT Evaluation" },
    { name: "description", content: "Welcome to MT Evaluation!" },
  ];
};

export default function Index() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const data = useLoaderData<typeof loader>();

  return (
    <div className="p-3">
      {data.user?.role === "ANNOTATOR" && (
        <>
          <Sidebar 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen}
            user={data.user} 
          />
          <Button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mb-2"
          >
            <MenuIcon className="h-6 w-6" />
          </Button>
        </>
      )}

      {data.error && (
        <div className="mb-2">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">MT Evaluation</h1>
            <div className="text-red-500 mb-4">{data.error}</div>
          </div>
        </div>
      )}

      {data.user?.role === "ANNOTATOR" && data.translation && (
        <RankingTranslation 
          user={data.user} 
          translation={data.translation} 
          key={data.translation.id}
        />
      )}
    </div>
  );
}