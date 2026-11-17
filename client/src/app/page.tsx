import { redirect } from "next/navigation";
import { ROUTES } from "@/config/routes";

export default function RootPage() {
  redirect(ROUTES.dashboard);
}
