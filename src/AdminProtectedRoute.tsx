import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "./lib/supabaseClient";

interface AdminProtectedRouteProps {
    children: React.ReactNode;
}

function AdminProtectedRoute({
    children,
}: AdminProtectedRouteProps) {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        const checkSession = async () => {
            const {
                data: { session },
                error,
            } = await supabase.auth.getSession();

            console.log("Admin session:", session);
            console.log("Session error:", error);

            setSession(session);
            setLoading(false);
        };

        checkSession();
    }, []);

    if (loading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f7f3ee",
                    color: "#222",
                    fontFamily: "Arial, sans-serif",
                }}
            >
                Checking authentication...
            </div>
        );
    }

    if (!session) {
        return (
            <Navigate
                to="/admin/login"
                replace
            />
        );
    }

    return <>{children}</>;
}

export default AdminProtectedRoute;