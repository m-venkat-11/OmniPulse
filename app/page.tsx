import DashboardLayout from "./dashboard/layout";
import DashboardOverviewPage from "./dashboard/page";

export default function Home() {
  return (
    <DashboardLayout>
      <DashboardOverviewPage />
    </DashboardLayout>
  );
}
