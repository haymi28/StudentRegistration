import { PasswordSettingsForm } from '@/components/dashboard/password-settings-form';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl font-headline flex items-center gap-2">
                    <SettingsIcon />
                    ቅንብሮች
                </h1>
            </div>
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle className="font-headline">የይለፍ ቃል አስተዳደር</CardTitle>
                    <CardDescription>የአስተዳዳሪ ሚናዎችን የይለፍ ቃላት ይቀይሩ።</CardDescription>
                </CardHeader>
                <PasswordSettingsForm />
            </Card>
        </div>
    );
}
