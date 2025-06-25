import { CheckInForm } from '@/components/dashboard/checkin-form';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
        <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl font-headline">Dashboard</h1>
        </div>
        <div className="flex-1 flex items-start justify-center py-8">
            <CheckInForm />
        </div>
    </div>
  );
}
