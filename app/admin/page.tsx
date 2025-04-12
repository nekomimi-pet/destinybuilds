import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth-buttons";
import { cookies } from "next/headers";
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
        <div>
            <h1>Admin Page</h1>
            <LogoutButton />
            <p>Welcome, {email}</p>
            <pre>{JSON.stringify(authData, null, 2)}</pre>
        </div>
    );
}
