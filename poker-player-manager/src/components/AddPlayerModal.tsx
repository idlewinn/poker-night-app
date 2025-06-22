import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, Mail } from 'lucide-react';

interface AddPlayerModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (playerData: { name: string; email: string }) => Promise<void>;
  loading?: boolean;
}

function AddPlayerModal({ open, onClose, onSubmit, loading = false }: AddPlayerModalProps): React.JSX.Element {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { name?: string; email?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Player name is required';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim()
      });
      
      // Reset form on success
      setName('');
      setEmail('');
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Failed to add player:', error);
    }
  };

  const handleClose = () => {
    setName('');
    setEmail('');
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-[95vw] sm:w-full p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
            <User className="h-5 w-5" />
            Add New Player
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Player Name */}
          <div className="space-y-2">
            <Label htmlFor="player-name" className="text-sm font-medium">
              Player Name *
            </Label>
            <Input
              id="player-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter player name..."
              className={errors.name ? 'border-red-500' : ''}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Player Email */}
          <div className="space-y-2">
            <Label htmlFor="player-email" className="text-sm font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="player-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email (optional)..."
                className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                disabled={loading}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
            <p className="text-xs text-gray-500">
              Email is optional but required for sending invitations
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Player'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddPlayerModal;
