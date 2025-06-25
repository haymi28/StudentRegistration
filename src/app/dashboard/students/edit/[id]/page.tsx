import { EditStudentForm } from "@/components/dashboard/edit-student-form";

export default function EditStudentPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex-1 flex items-start justify-center py-8">
        <EditStudentForm studentId={params.id} />
    </div>
  );
}
