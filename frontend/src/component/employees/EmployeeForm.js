import React, { useState, useEffect } from 'react';
import { Button, Input } from '../../component/common';

export default function EmployeeForm({ employee = null, onSubmit, loading = false }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (employee) {
      setName(employee.name);
      setEmail(employee.email);
      setPassword('');
    } else {
      setName('');
      setEmail('');
      setPassword('');
    }
    setErrors({});
  }, [employee]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!employee && !password) {
      newErrors.password = 'Password is required for new employees';
    } else if (password && password.length < 4) {
      newErrors.password = 'Password should be at least 4 characters long';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      name: name.trim(),
      email: email.trim(),
    };

    if (password) {
      payload.password = password;
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Employee Name"
        id="name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        placeholder="Enter full name"
      />

      <Input
        label="Email Address"
        id="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        placeholder="employee@teashop.com"
      />

      <Input
        label={employee ? "Change Password (optional)" : "Password"}
        id="password"
        type="password"
        required={!employee}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        placeholder="••••••"
      />

      <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
        <Button variant="primary" type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? 'Saving...' : employee ? 'Update Employee' : 'Add Employee'}
        </Button>
      </div>
    </form>
  );
}
