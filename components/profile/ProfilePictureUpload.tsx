"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Loader2 } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/hooks/useAuth';
import { usersApi } from '@/utils/api';
import { toast } from 'sonner';

export default function ProfilePictureUpload() {
  const { user } = useAuth();
  const { getProfilePicture, updateProfilePicture } = useUserProfile();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user?.uid) return;

    const file = files[0];
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }

    // Create a preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Upload the file
    try {
      setIsUploading(true);
      const response = await usersApi.uploadProfilePicture(file, user.uid);
      
      if (response.success) {
        await updateProfilePicture(response.imageUrl);
        toast.success('Profile picture updated successfully');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setIsUploading(false);
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />
      
      <Avatar className="h-24 w-24 cursor-pointer relative group" onClick={handleFileSelect}>
        <AvatarImage
          src={previewUrl || getProfilePicture()}
          alt={user?.displayName || "User"}
        />
        <AvatarFallback>
          {user?.displayName?.[0] || "U"}
        </AvatarFallback>
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <Upload className="h-8 w-8 text-white" />
        </div>
      </Avatar>
      
      <div className="text-center">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleFileSelect}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            'Change Profile Picture'
          )}
        </Button>
      </div>
    </div>
  );
} 