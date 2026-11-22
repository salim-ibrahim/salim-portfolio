import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
);

async function testConnection() {
    const { count, error } = await supabase
        .from("media_assets")
        .select("*", { count: "exact", head: true });

    if (error) {
        console.error("Connection test failed:", error.message);
        process.exit(1);
    }

    console.log("Supabase connection: SUCCESS");
    console.log("Media records currently in database:", count);
}

testConnection();
