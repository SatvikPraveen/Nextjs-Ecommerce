'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

export function ProfileForm() {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: '',
      email: '',
      image: '',
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        alert('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input {...register('name')} placeholder="Your name" />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          {...register('email')}
          type="email"
          placeholder="your@email.com"
        />
      </div>
      <div>
        <Label htmlFor="image">Image URL</Label>
        <Input {...register('image')} placeholder="https://..." />
      </div>
      <Button type="submit">Update Profile</Button>
    </form>
  );
}
