import OrganizationChart from "@/components/pages/organization-structure";
import BackupOrganizationChart from "@/components/pages/organization-structure/backup-index";

export default function DepartmentManagementPage() {
  return (
    <div className="font-sans min-h-screen">
      <OrganizationChart />
    </div>
  );
}
