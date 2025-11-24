'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

export function PasswordChangeForm() {
  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const newPassword = watch('newPassword');

  const onSubmit = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      if (response.ok) {
        setMessage('Password updated successfully');
        reset();
      } else {
        setMessage('Failed to update password');
      }
    } catch (error) {
      setMessage('Error updating password');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input
          {...register('currentPassword')}
          type="password"
          placeholder="Enter current password"
        />
      </div>
      <div>
        <Label htmlFor="newPassword">New Password</Label>
        <Input
          {...register('newPassword')}
          type="password"
          placeholder="Enter new password"
        />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          {...register('confirmPassword')}
          type="password"
          placeholder="Confirm new password"
        />
      </div>
      {message && (
        <p
          className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}
        >
          {message}
        </p>
      )}
      <Button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Password'}
      </Button>
    </form>
  );
}
