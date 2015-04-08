package ca.bigbackpack.mmdevlab;

import android.app.IntentService;
import android.app.Notification;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.pm.ResolveInfo;
import android.provider.Browser;
import android.util.Log;
import android.net.Uri;

import java.util.Map;
import java.util.List;

import android.support.v4.app.NotificationCompat.Builder;
import android.widget.Toast;

import com.firebase.client.AuthData;
import com.firebase.client.ChildEventListener;
import com.firebase.client.DataSnapshot;
import com.firebase.client.Firebase;
import com.firebase.client.FirebaseError;


public class FBURLService extends IntentService {

    private static final String TAG = FBURLService.class.getSimpleName();

    private Firebase firebaseRef;
    private String defaultBrowser;

    public FBURLService() {
        super("FBURLService");
    }

    public int onStartCommand(Intent intent, int flags, int startId) {
        String fbAppID = intent.getStringExtra("APP_ID");
        defaultBrowser = "com.android.chrome";

        Log.i(TAG, "Start received. " + intent);
        Log.i(TAG, "  - startID: " + startId);
        Log.i(TAG, "  - APP_ID:   " + fbAppID);
        Log.i(TAG, "  - Default Browser: " + defaultBrowser);

        firebaseRef = new Firebase("https://" + fbAppID + ".firebaseio.com/");
        firebaseRef.authAnonymously(new AuthResultHandler());
        Log.i(TAG, "  - Firebase auth started.");
        firebaseRef.child("url").limitToLast(1).addChildEventListener(fbChildListener);
        return 0;
    }

    ChildEventListener fbChildListener = new ChildEventListener() {
        @Override
        public void onChildAdded(DataSnapshot dataSnapshot, String s) {
            Map<String, Object> r = (Map<String, Object>)dataSnapshot.getValue();
            String url = (String)r.get("url");
            if (r.get("package") != null) {
                String packageName = (String)r.get("package");
                Log.i(TAG, "Package set: " + packageName);
                handleURL(url, packageName);
            } else {
                handleURL(url);
            }
        }
        @Override
        public void onChildChanged(DataSnapshot dataSnapshot, String s) { }
        @Override
        public void onChildRemoved(DataSnapshot dataSnapshot) { }
        @Override
        public void onChildMoved(DataSnapshot dataSnapshot, String s) { }
        @Override
        public void onCancelled(FirebaseError firebaseError) { }
    };

    @Override
    public void onDestroy() {
        Log.i(TAG, "onDestroy received.");
        firebaseRef.child("url").removeEventListener(fbChildListener);
        firebaseRef.unauth();
        stopForeground(true);
        stopSelf();
        super.onDestroy();
    }

    private void handleURL(String url) {
        handleURL(url, defaultBrowser);
    }

    private void handleURL(String url, String packageName) {
        Log.i(TAG + "-handleURL", url);
        try {
            android.content.Context context = getApplicationContext();
            Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            browserIntent.setPackage(packageName);
            browserIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            //browserIntent.addFlags(Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS);
            //browserIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
            //browserIntent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
            browserIntent.addFlags(Intent.FLAG_RECEIVER_FOREGROUND);
            browserIntent.putExtra(Browser.EXTRA_APPLICATION_ID, context.getPackageName());

            List<ResolveInfo> activitiesList = context.getPackageManager().queryIntentActivities(browserIntent, -1);
            if (activitiesList.size() > 0) {
                startActivity(browserIntent);
            } else {
                if (packageName != "com.android.chrome") {
                    handleURL(url);
                } else {
                    Log.w(TAG, "Chrome not found");
                }
            }
        } catch (Exception ex) {
            Log.w(TAG, "Exception: " + ex.toString());
        }
    }

    private class AuthResultHandler implements Firebase.AuthResultHandler {

        public AuthResultHandler() {
        }

        @Override
        public void onAuthenticated(AuthData authData) {
            Log.i(TAG, "Firebase Auth Successful");
            Intent notificationIntent = new Intent(getApplicationContext(), MainActivity.class);
            notificationIntent.putExtra("fromNotification", true);
            PendingIntent pendingIntent = PendingIntent.getActivity(
                getApplicationContext(), 0, notificationIntent, Intent.FLAG_RECEIVER_FOREGROUND);

            Builder mBuilder = new Builder(getApplicationContext());
            mBuilder.setContentTitle("MiniMobile Device Lab")
                    .setContentText("URL listener is running")
                    .setSmallIcon(R.mipmap.icon)
                    .setContentIntent(pendingIntent);
            Notification nService = mBuilder.build();
            startForeground(1, nService);
        }

        @Override
        public void onAuthenticationError(FirebaseError firebaseError) {
            Log.w(TAG, "Firebase Auth Error: " + firebaseError.toString());
            Toast t = Toast.makeText(getApplicationContext(), R.string.fb_auth_error, Toast.LENGTH_LONG);
            t.show();
            stopSelf();
        }
    }

    @Override
    protected void onHandleIntent(Intent intent) {
        Log.w(TAG, "Received intent: " + intent);
    }

}
