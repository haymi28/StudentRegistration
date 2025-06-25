"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, UserCheck } from 'lucide-react';
import { getStudents, addAttendanceRecord } from '@/lib/data';

export function CheckInForm() {
  const [studentId, setStudentId] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string; studentName?: string; checkInTime?: string; }>({ type: null, message: '' });

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const students = getStudents();
    const student = students.find(s => s.id.toLowerCase() === studentId.toLowerCase());
    
    if (student) {
      const now = new Date();
      addAttendanceRecord({
        id: `ATT-${Date.now()}`,
        studentId: student.id,
        studentName: student.fullName,
        checkInTime: now,
      });
      setFeedback({ 
        type: 'success', 
        message: `Successfully checked in.`,
        studentName: student.fullName,
        checkInTime: now.toLocaleString()
      });
    } else {
      setFeedback({ type: 'error', message: 'Student ID not found. Please try again.' });
    }
    setStudentId('');
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2"><UserCheck /> Student Check-In</CardTitle>
        <CardDescription>Enter a student's ID to record their attendance.</CardDescription>
      </CardHeader>
      <form onSubmit={handleCheckIn}>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="studentId">Student ID</Label>
              <Input 
                id="studentId" 
                placeholder="e.g., STU001" 
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                autoFocus
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">Check In</Button>
        </CardFooter>
      </form>
      {feedback.type && (
        <div className="p-6 pt-0">
          <Alert variant={feedback.type === 'error' ? 'destructive' : 'default'} className={feedback.type === 'success' ? 'bg-green-100 dark:bg-green-900 border-green-400 dark:border-green-600' : ''}>
            {feedback.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            <AlertTitle>{feedback.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
            <AlertDescription>
              {feedback.message}
              {feedback.type === 'success' && feedback.studentName && (
                <div className="mt-2 text-sm">
                  <p><strong>Name:</strong> {feedback.studentName}</p>
                  <p><strong>Time:</strong> {feedback.checkInTime}</p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </Card>
  );
}
