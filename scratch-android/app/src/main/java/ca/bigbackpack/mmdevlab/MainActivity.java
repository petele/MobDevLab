package ca.bigbackpack.mmdevlab;

import android.app.ActivityManager;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.SharedPreferences;
import android.net.Uri;
import android.util.Log;
import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.content.Intent;
import android.view.WindowManager;

import android.widget.Switch;
import android.widget.EditText;
import android.widget.Toast;

import com.firebase.client.Firebase;


public class MainActivity extends Activity {

  private static final String FB_APP_ID = "shining-inferno-4243";

  private static final String TAG = MainActivity.class.getSimpleName();
  private String fbAppID;
  private boolean bFirstRun;

  private EditText etAppID;
  private Switch swStartAtBoot;
  private Switch swStartKSOAtBoot;
  private Switch swRunning;

  public static final class PREF_CONST {
    public static final String PREFS_NAME = "MDLPrefs";
    public static final String APP_ID = "FIREBASE_APP_ID";
    public static final String START_AT_BOOT = "START_AT_BOOT";
    public static final String START_KEEP_SCREEN_ON_AT_BOOT = "START_KSO_AT_BOOT";
    public static final String FIRST_RUN = "FIRST_RUN";
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    setContentView(R.layout.activity_main);

    Intent startIntent = getIntent();
    Log.i("--" + TAG + "--", "onCreate " + startIntent);

    etAppID = (EditText) findViewById(R.id.tbFBAppID);
    swStartAtBoot = (Switch) findViewById(R.id.swStartAtBoot);
    swStartKSOAtBoot = (Switch) findViewById(R.id.swStartKSOAtBoot);
    swRunning = (Switch) findViewById(R.id.swRunning);

    readConfig();

    if (isServiceRunning(FBURLService.class)) {
      swRunning.setChecked(true);
    }

    if ((!bFirstRun) && (savedInstanceState == null)) {
      toggleService(true);
    }
  }

  private void readConfig() {
    SharedPreferences settings = getSharedPreferences(PREF_CONST.PREFS_NAME, 0);
    fbAppID = settings.getString(PREF_CONST.APP_ID, FB_APP_ID);
    etAppID.setText(fbAppID);
    boolean bStartAtBoot = settings.getBoolean(PREF_CONST.START_AT_BOOT, false);
    swStartAtBoot.setChecked(bStartAtBoot);
    boolean bStartKSOAtBoot = settings.getBoolean(PREF_CONST.START_KEEP_SCREEN_ON_AT_BOOT, false);
    swStartKSOAtBoot.setChecked(bStartKSOAtBoot);
    bFirstRun = settings.getBoolean(PREF_CONST.FIRST_RUN, true);
    if (bFirstRun) {
      SharedPreferences.Editor editor = settings.edit();
      editor.putBoolean(PREF_CONST.FIRST_RUN, false);
      editor.apply();
    }
  }

  private boolean isServiceRunning(Class<?> serviceClass) {
    ActivityManager manager = (ActivityManager) getSystemService(Context.ACTIVITY_SERVICE);
    for (ActivityManager.RunningServiceInfo service : manager.getRunningServices(Integer.MAX_VALUE)) {
      if (serviceClass.getName().equals(service.service.getClassName())) {
        return true;
      }
    }
    return false;
  }


  public void switchService(View v) {
    if (((Switch) v).isChecked()) {
      toggleService(true);
    } else {
      toggleService(false);
    }
  }

  public void saveAppID(View v) {
    Log.i(TAG, "Save App ID");
    SharedPreferences settings = getSharedPreferences(PREF_CONST.PREFS_NAME, 0);
    SharedPreferences.Editor editor = settings.edit();
    String newAppID = etAppID.getText().toString();
    if (newAppID.compareToIgnoreCase(fbAppID) != 0) {
      editor.putString(PREF_CONST.APP_ID, newAppID);
      fbAppID = newAppID;
      Log.i(TAG, "Settings saved, App Restart required");
      editor.apply();

      Toast t = Toast.makeText(getApplicationContext(), R.string.settings_saved, Toast.LENGTH_SHORT);
      t.show();
    } else {

    }
  }

  public void toggleStartAtBoot(View v) {
    Log.i(TAG, "Toggle StartAtBoot");
    SharedPreferences settings = getSharedPreferences(PREF_CONST.PREFS_NAME, 0);
    SharedPreferences.Editor editor = settings.edit();
    editor.putBoolean(PREF_CONST.START_AT_BOOT, swStartAtBoot.isChecked());
    editor.apply();
  }

  public void toggleStartKSOAtBoot(View v) {
    Log.i(TAG, "Toggle StartKSOAtBoot");
    SharedPreferences settings = getSharedPreferences(PREF_CONST.PREFS_NAME, 0);
    SharedPreferences.Editor editor = settings.edit();
    editor.putBoolean(PREF_CONST.START_KEEP_SCREEN_ON_AT_BOOT, swStartKSOAtBoot.isChecked());
    editor.apply();
  }

  private void toggleService(Boolean start) {
    Intent fbService = new Intent(this, FBURLService.class);
    boolean isRunning = isServiceRunning(FBURLService.class);
    if (start) {
      if (isRunning) {
        Log.w(TAG, "FBURLService is already running.");
        return;
      }
      Log.i(TAG, "Starting FBURLService.");
      swRunning.setChecked(true);
      fbService.putExtra("APP_ID", fbAppID);
      startService(fbService);
      getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    } else if (isRunning) {
      Log.i(TAG, "Stopping FBURLService.");
      swRunning.setChecked(false);
      stopService(fbService);
      getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    }
  }

  public void installKSO(View v) {
    Log.i(TAG, "install KSO");
    try {
      Intent intent = new Intent(Intent.ACTION_VIEW);
      intent.setData(Uri.parse("market://details?id=com.synetics.stay.alive"));
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      startActivity(intent);
    } catch (Exception ex) {
      Log.w(TAG, "Exception: " + ex.toString());
    }
  }

  @Override
  public void onSaveInstanceState(Bundle savedInstanceState) {
    // Save the user's current game state
    savedInstanceState.putBoolean("isRunning", true);
    Log.i(TAG, "****** Saving instance state");

    // Always call the superclass so it can save the view hierarchy state
    super.onSaveInstanceState(savedInstanceState);
  }

  //public class StartAtBoot extends BroadcastReceiver

}
