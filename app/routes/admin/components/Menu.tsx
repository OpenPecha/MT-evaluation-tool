import { Link, useLocation } from "@remix-run/react";
import {
  NavigationMenu,
  NavigationMenuList,
} from "~/components/ui/navigation-menu";

type MenuProps = {
  user: { email: string };
};

export default function Menu({ user }: MenuProps) {
  const location = useLocation();

  return (
    <NavigationMenu className="bg-gray-100 p-4 rounded-md shadow-md">
      <NavigationMenuList className="flex space-x-6">
        <Link
          to={`/admin/users?session=${user.email}`}
          className={`px-4 py-2 font-medium ${
            location.pathname.includes("/admin/users")
              ? "border-b-2 border-blue-500 text-blue-700"
              : "text-gray-700 hover:text-blue-500 transition"
          }`}
        >
          Users
        </Link>
        <Link
          to={`/admin/texts?session=${user.email}`}
          className={`px-4 py-2 font-medium ${
            location.pathname.includes("/admin/texts")
              ? "border-b-2 border-blue-500 text-blue-700"
              : "text-gray-700 hover:text-blue-500 transition"
          }`}
        >
          Texts
        </Link>
      </NavigationMenuList>
    </NavigationMenu>
  );
}