'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface Address {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export function AddressBook() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  });

  const handleAddAddress = async () => {
    try {
      const response = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const newAddress = await response.json();
        setAddresses([...addresses, newAddress]);
        setFormData({
          name: '',
          address: '',
          city: '',
          state: '',
          zip: '',
          country: 'US',
        });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error adding address:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Saved Addresses</h3>
        <Button onClick={() => setShowForm(!showForm)} variant="outline">
          {showForm ? 'Cancel' : 'Add Address'}
        </Button>
      </div>

      {showForm && (
        <div className="space-y-3 rounded-lg border p-4">
          <div>
            <Label>Address Name</Label>
            <Input
              placeholder="Home, Office, etc."
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Street Address</Label>
            <Input
              placeholder="123 Main St"
              value={formData.address}
              onChange={e =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>City</Label>
              <Input
                placeholder="City"
                value={formData.city}
                onChange={e =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />
            </div>
            <div>
              <Label>State</Label>
              <Input
                placeholder="CA"
                value={formData.state}
                onChange={e =>
                  setFormData({ ...formData, state: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>ZIP Code</Label>
              <Input
                placeholder="90210"
                value={formData.zip}
                onChange={e =>
                  setFormData({ ...formData, zip: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Country</Label>
              <Input
                placeholder="US"
                value={formData.country}
                onChange={e =>
                  setFormData({ ...formData, country: e.target.value })
                }
              />
            </div>
          </div>
          <Button onClick={handleAddAddress} className="w-full">
            Save Address
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {addresses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No addresses saved yet
          </p>
        ) : (
          addresses.map(addr => (
            <div key={addr.id} className="rounded-lg border p-3">
              <p className="font-medium">{addr.name}</p>
              <p className="text-sm text-muted-foreground">{addr.address}</p>
              <p className="text-sm text-muted-foreground">
                {addr.city}, {addr.state} {addr.zip}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
