
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmployeeList } from '@/components/settings/employee/EmployeeList';
import { useEmployeeData } from '@/components/settings/employee/useEmployeeData';
import { useEmployeeDelete } from '@/components/settings/employee/useEmployeeDelete';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Employee = () => {
  const { isLoading, employees, loadEmployees } = useEmployeeData();
  const { deleteEmployee, isDeleting } = useEmployeeDelete(loadEmployees);
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manajemen Karyawan</CardTitle>
          <Button 
            onClick={() => navigate('/settings')} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Tambah Karyawan
          </Button>
        </CardHeader>
        <CardContent>
          <EmployeeList 
            employees={employees} 
            onDelete={deleteEmployee} 
            isLoading={isLoading || isDeleting} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Employee;
