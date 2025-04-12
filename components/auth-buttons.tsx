'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { logout } from '@/lib/auth';

export function LoginButton() {
  return (
    <Link href="/login" passHref>
      <Button variant="outline" size="sm">
        Login
      </Button>
    </Link>
  );
}

export function LogoutButton() {
  const router = useRouter();
  
  const handleLogout = async () => {
    await logout();
    router.refresh();
  };
  
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleLogout}
    >
      Logout
    </Button>
  );
}

export function UserNav({ username }: { username: string }) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm">Hello, {username}</span>
      <LogoutButton />
    </div>
  );
} 