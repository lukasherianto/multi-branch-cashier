
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmployeeList } from '@/components/settings/employee/EmployeeList';
import { useEmployeeData } from '@/components/settings/employee/useEmployeeData';
import { useEmployeeDelete } from '@/components/settings/employee/useEmployeeDelete';

const Employee = () => {
  const { isLoading, employees, loadEmployees } = useEmployeeData();
  const { deleteEmployee, isDeleting } = useEmployeeDelete(loadEmployees);
  
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Manajemen Karyawan</CardTitle>
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
