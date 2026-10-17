import { getCurrentUser, isFirstRun } from "@/src/server/auth/session";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const fresh = await isFirstRun();
  if (fresh) {
    redirect("/setup");
  }

  const session = await getCurrentUser();
  if (!session) {
    redirect("/sign-in");
  }

  redirect("/dashboard");
}
