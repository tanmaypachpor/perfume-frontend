import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/shared/lib/supabaseClient";

interface AdminProtectedRouteProps {
    children: React.ReactNode;
}

function AdminProtectedRoute({
    children,
}: AdminProtectedRouteProps) {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const {
                    data: { session },
                    error: sessionError,
                } = await supabase.auth.getSession();

                console.log("Session:", session);
                console.log("Session error:", sessionError);

                if (!session) {
                    setIsAdmin(false);
                    setLoading(false);
                    return;
                }

                const { data, error } = await supabase.rpc(
                    "is_admin"
                );

                console.log("Admin check:", data);
                console.log("Admin check error:", error);

                if (error) {
                    setIsAdmin(false);
                    setLoading(false);
                    return;
                }

                setIsAdmin(data === true);
            } catch (error) {
                console.error(
                    "Admin authentication error:",
                    error
                );

                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };

        checkAdmin();
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
                Checking admin access...
            </div>
        );
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}

export default AdminProtectedRoute;