const { createClient } = require('@supabase/supabase-js');
const admin = require('firebase-admin');

// REQUIREMENTS:
// npm install @supabase/supabase-js firebase-admin
// Follow instructions below for configuring keys

const SUPABASE_URL = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SUPABASE_SERVICE_KEY';

// You will need to download your Firebase Admin SDK service account JSON
// Go to Firebase Console -> Project Settings -> Service Accounts -> Generate new private key
const serviceAccount = require('./firebase-service-account.json');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

async function migrateUsers() {
    console.log('Fetching users from Supabase Auth...');

    // Requires the SUPABASE_SERVICE_KEY to list all users
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error fetching Supabase users:', error);
        return;
    }

    console.log(`Found ${users?.length || 0} users. Starting migration to Firebase Auth...`);

    let successCount = 0;
    let failureCount = 0;

    for (const user of users) {
        try {
            // 1. Create user in Firebase Auth
            const firebaseUser = await auth.createUser({
                uid: user.id, // Preserve original Supabase UID!
                email: user.email,
                emailVerified: user.email_confirmed_at != null,
                displayName: user.user_metadata?.full_name || '',
                photoURL: user.user_metadata?.avatar_url || '',
                // You cannot migrate raw passwords from Supabase.
                // We set a strong temporary password. Users MUST use "Forgot Password".
                password: Math.random().toString(36).slice(-8) + '!' + Math.random().toString(36).slice(-8)
            });

            // 2. Also save to Firestore `users` collection since our app relies on it
            await db.collection('users').doc(firebaseUser.uid).set({
                id: firebaseUser.uid,
                email: firebaseUser.email,
                full_name: user.user_metadata?.full_name || '',
                avatar_url: user.user_metadata?.avatar_url || '',
                subscription_tier: 'free',
                created_at: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            successCount++;
            console.log(`[Success] Migrated user: ${user.email} (UID: ${user.id})`);
        } catch (err) {
            if (err.code === 'auth/email-already-exists' || err.code === 'auth/uid-already-exists') {
                console.log(`[Skipped] User already exists in Firebase: ${user.email}`);
                successCount++;
            } else {
                console.error(`[Failed] Error migrating user ${user.email}:`, err.message);
                failureCount++;
            }
        }
    }

    console.log(`\n--- Migration Complete ---`);
    console.log(`Successfully Migrated/Skipped: ${successCount}`);
    console.log(`Failed: ${failureCount}`);
    console.log(`\nIMPORTANT: Users migrated this way will need to reset their password using the "Forgot Password" link on login, as Supabase password hashes cannot be directly ported to Firebase.`);
}

migrateUsers();
