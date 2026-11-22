
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function AdminRoute({ children }) {
    const [status, setStatus] = useState("checking");

    useEffect(() => {
        let mounted = true;

        async function verifyAdmin(session) {
            if (!session) {
                if (mounted) setStatus("unauthenticated");
                return;
            }

            const { data, error } = await supabase.rpc("is_admin");

            if (!mounted) return;

            if (error || data !== true) {
                await supabase.auth.signOut();
                if (mounted) setStatus("unauthorized");
                return;
            }

            setStatus("authorized");
        }

        supabase.auth.getSession().then(({ data, error }) => {
            if (error) {
                if (mounted) setStatus("unauthenticated");
                return;
            }

            verifyAdmin(data.session);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            verifyAdmin(session);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    if (status === "checking") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0b0e14] text-slate-300">
                Verifying administrator access...
            </div>
        );
    }

    if (status !== "authorized") {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
}

export default AdminRoute;
