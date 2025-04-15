import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth-buttons";
import { cookies } from "next/headers";
import Link from "next/link";

// ensure the user is authenticated
export default async function AdminPage() {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('pb_auth');
    const Authenticated = await isAuthenticated();
    if (!Authenticated) {
        redirect("/login");
    }
    const authData = JSON.parse(authCookie?.value || '{}');
    const email = authData.model?.email;
    const username = authData.model?.username;

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <LogoutButton />
            </div>
            
            <p className="mb-6">Welcome, {email}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link 
                    href="/admin/create" 
                    className="block bg-card hover:bg-card/90 p-6 rounded-lg shadow border border-border/50 transition-colors"
                >
                    <h2 className="text-xl font-bold mb-2">Create New Build</h2>
                    <p className="text-muted-foreground">
                        Create a new Destiny build with detailed configurations
                    </p>
                </Link>
                
                {/* Add more admin functions here */}
                
            </div>
            
            <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Auth Debug Info</h2>
                <pre className="bg-card p-4 rounded-lg overflow-x-auto text-xs">
                    {JSON.stringify(authData, null, 2)}
                </pre>
            </div>
        </div>
    );
}
