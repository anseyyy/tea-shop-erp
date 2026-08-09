import React, { useState, useEffect } from 'react';
import { Button, Input, Select } from '../../component/common';

const categories = [
  { value: 'Ingredients', label: 'Ingredients (Milk, Tea, Sugar)' },
  { value: 'Rent', label: 'Rent / Shop Space' },
  { value: 'Electricity', label: 'Electricity / Utility Bills' },
  { value: 'Salaries', label: 'Staff Salaries' },
  { value: 'Supplies', label: 'Supplies (Cups, Spoons, Cleaning)' },
  { value: 'Others', label: 'Others' }
];

export default function ExpenseForm({ expense = null, onSubmit, loading = false }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Ingredients');
  const [date, setDate] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (expense) {
      setAmount(expense.amount);
      setDescription(expense.description);
      setCategory(expense.category || 'Ingredients');
      const formattedDate = expense.date 
        ? new Date(expense.date).toISOString().split('T')[0] 
        : '';
      setDate(formattedDate);
    } else {
      setAmount('');
      setDescription('');
      setCategory('Ingredients');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [expense]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      newErrors.amount = 'Please enter a valid positive amount';
    }
    if (!description.trim()) {
      newErrors.description = 'Please enter a description';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      amount: Number(amount),
      description: description.trim(),
      category,
      date: date ? new Date(date) : new Date(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Amount (₹)"
        id="amount"
        type="number"
        step="0.01"
        required
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={errors.amount}
        placeholder="Enter amount (e.g. 150)"
      />

      <Input
        label="Description"
        id="description"
        required
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={errors.description}
        placeholder="Enter item purchased (e.g. Milk packet)"
      />

      <Select
        label="Category"
        id="category"
        options={categories}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <Input
        label="Date"
        id="date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
        <Button variant="primary" type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? 'Submitting...' : expense ? 'Update Expense' : 'Add Expense'}
        </Button>
      </div>
    </form>
  );
}
