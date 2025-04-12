import { supabase } from "@/lib/supabase";

/**
 * Comprehensive Supabase verification utility
 * Run this to verify all aspects of your Supabase setup
 */
export async function verifySupabaseSetup() {
  console.log("🔍 Starting Supabase verification...");

  const results = {
    database: { success: false, tables: {} },
    auth: { success: false },
    storage: { success: false },
    realtime: { success: false },
    functions: { success: false },
    overall: false,
  };

  try {
    // 1. Database Check
    console.log("\n📊 Checking database tables...");
    try {
      const dbResult = await verifyDatabaseTables();
      results.database = dbResult;
    } catch (dbError) {
      console.error("Database verification failed:", dbError);
      results.database.error = dbError;
    }

    // 2. Authentication Check
    console.log("\n🔐 Checking authentication...");
    try {
      const authResult = await verifyAuthentication();
      results.auth = authResult;
    } catch (authError) {
      console.error("Authentication verification failed:", authError);
      results.auth.error = authError;
    }

    // 3. Storage Check
    console.log("\n📁 Checking storage...");
    try {
      const storageResult = await verifyStorage();
      results.storage = storageResult;
    } catch (storageError) {
      console.error("Storage verification failed:", storageError);
      results.storage.error = storageError;
    }

    // 4. Realtime Check
    console.log("\n⚡ Setting up realtime listener...");
    try {
      const channel = setupRealtimeListener();
      results.realtime = { success: true, channel };
    } catch (realtimeError) {
      console.error("Realtime verification failed:", realtimeError);
      results.realtime.error = realtimeError;
    }

    // 5. Edge Functions Check
    console.log("\n🔧 Checking edge functions...");
    try {
      const functionsResult = await verifyEdgeFunctions();
      results.functions = functionsResult;
    } catch (functionsError) {
      console.error("Edge functions verification failed:", functionsError);
      results.functions.error = functionsError;
    }

    // Determine overall success
    results.overall = [
      results.database.success,
      results.auth.success,
      results.storage.success,
      results.realtime.success,
      results.functions.success,
    ].some((success) => success);

    if (results.overall) {
      console.log("\n✅ Supabase verification completed with some successes!");
    } else {
      console.error("\n❌ Supabase verification failed in all areas!");
    }

    return {
      success: results.overall,
      channel: results.realtime.channel,
      results: results,
    };
  } catch (error) {
    console.error(
      "❌ Supabase verification failed with unexpected error:",
      error,
    );
    return { success: false, error, results };
  }
}

async function verifyDatabaseTables() {
  const tables = [
    "products",
    "incoming_box_stock",
    "unit_stock",
    "recipients",
    "outgoing_stock",
    "outgoing_stock_items",
  ];

  const results = {
    success: false,
    tables: {},
  };

  let successCount = 0;

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select("*").limit(1);

      if (error) {
        console.error(`❌ ${table} table error: ${error.message}`);
        results.tables[table] = { success: false, error, count: 0 };
      } else {
        console.log(
          `✓ ${table} table accessible: ${data?.length || 0} records found`,
        );
        results.tables[table] = { success: true, count: data?.length || 0 };
        successCount++;
      }
    } catch (tableError) {
      console.error(`❌ Error checking ${table} table: ${tableError.message}`);
      results.tables[table] = { success: false, error: tableError, count: 0 };
    }
  }

  // Check if at least one table was successfully verified
  results.success = successCount > 0;

  if (results.success) {
    console.log(
      `✓ Database verification: ${successCount}/${tables.length} tables accessible`,
    );
  } else {
    console.error("❌ Database verification failed: No tables accessible");
  }

  return results;
}

async function verifyAuthentication() {
  try {
    // Get current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error(`❌ Session error: ${sessionError.message}`);
      return { success: false, error: sessionError };
    }

    // Check if auth service is accessible even without a session
    const { error: authError } = await supabase.auth.getUser();

    if (authError && authError.message !== "JWT expired") {
      console.error(`❌ Auth service error: ${authError.message}`);
      return { success: false, error: authError };
    }

    if (session) {
      console.log(`✓ User authenticated: ${session.user.email}`);
      console.log(`✓ User ID: ${session.user.id}`);
      console.log(`✓ User metadata:`, session.user.user_metadata);
      return {
        success: true,
        session,
        authenticated: true,
      };
    } else {
      console.log("ℹ️ No active session found. User is not authenticated.");
      console.log("✓ Auth service is accessible");
      return {
        success: true,
        authenticated: false,
      };
    }
  } catch (error) {
    console.error(`❌ Authentication verification error: ${error.message}`);
    return { success: false, error };
  }
}

async function verifyStorage() {
  try {
    // List all buckets
    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error(`❌ Storage buckets error: ${bucketsError.message}`);
      return { success: false, error: bucketsError };
    }

    console.log(`✓ Storage buckets found: ${buckets.length}`);

    const bucketResults = [];

    // List files in each bucket
    for (const bucket of buckets) {
      try {
        const { data: files, error: filesError } = await supabase.storage
          .from(bucket.name)
          .list();

        if (filesError) {
          console.warn(
            `⚠️ Error listing files in bucket ${bucket.name}: ${filesError.message}`,
          );
          bucketResults.push({
            name: bucket.name,
            success: false,
            error: filesError,
          });
          continue;
        }

        console.log(`✓ Bucket '${bucket.name}': ${files.length} files found`);
        bucketResults.push({
          name: bucket.name,
          success: true,
          fileCount: files.length,
          files: files.map((f) => f.name),
        });
      } catch (bucketError) {
        console.error(
          `❌ Error processing bucket ${bucket.name}: ${bucketError.message}`,
        );
        bucketResults.push({
          name: bucket.name,
          success: false,
          error: bucketError,
        });
      }
    }

    return {
      success: true,
      bucketCount: buckets.length,
      buckets: bucketResults,
    };
  } catch (error) {
    console.error("❌ Storage verification error:", error);
    return { success: false, error };
  }
}

function setupRealtimeListener() {
  // Set up a realtime listener for the products table
  const channel = supabase
    .channel("schema-db-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "products",
      },
      (payload) => {
        console.log("⚡ Realtime change detected:", payload);
      },
    )
    .subscribe((status) => {
      console.log(`✓ Realtime subscription status: ${status}`);
    });

  console.log("✓ Realtime listener set up for products table");
  console.log(
    "ℹ️ Make changes to the products table to test realtime functionality",
  );

  return channel;
}

async function verifyEdgeFunctions() {
  try {
    // List available functions
    // Note: Supabase JS client doesn't provide a way to list functions
    // This would require checking the Supabase dashboard

    // Try to invoke a test function if it exists
    try {
      console.log("📡 Testing hello-world edge function...");
      const { data, error } = await supabase.functions.invoke("hello-world", {
        body: { name: "Verification Test" },
      });

      if (error) {
        console.warn(`⚠️ Edge function test failed: ${error.message}`);
        throw new Error(`Edge function test failed: ${error.message}`);
      } else {
        console.log(`✓ Edge function test successful:`, data);
        return { success: true, data };
      }
    } catch (functionError) {
      console.warn(
        `⚠️ Edge function not found or error: ${functionError.message}`,
      );
      console.log(
        "ℹ️ This is expected if you haven't created any edge functions yet",
      );
      return { success: false, error: functionError };
    }
  } catch (error) {
    console.error("Edge functions verification error:", error);
    return { success: false, error };
  }
}
