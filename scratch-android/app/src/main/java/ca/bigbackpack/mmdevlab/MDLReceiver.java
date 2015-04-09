package ca.bigbackpack.mmdevlab;

import android.content.ComponentName;
import android.os.Handler;
import android.util.Log;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;


public class MDLReceiver extends BroadcastReceiver {

  private static final String TAG = MDLReceiver.class.getSimpleName();

  public MDLReceiver() {
  }

  @Override
  public void onReceive(final Context context, Intent intent) {
    Log.i(TAG, "onReceive " + intent.getAction());
    SharedPreferences settings = context.getSharedPreferences(MainActivity.PREF_CONST.PREFS_NAME, 0);
    boolean bStartKSOAtBoot = settings.getBoolean(MainActivity.PREF_CONST.START_KEEP_SCREEN_ON_AT_BOOT, false);
    if ((bStartKSOAtBoot) && (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction()))) {
      startKSO(context);
    }
    boolean bStartAtBoot = settings.getBoolean(MainActivity.PREF_CONST.START_AT_BOOT, false);
    if ((bStartAtBoot) && (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction()))) {
      long handlerWait = 1;
      if (bStartKSOAtBoot) {
        handlerWait = 3000;
      }
      Handler handler = new Handler();
      handler.postDelayed(new Runnable() {
        public void run() {
          startMDL(context);
        }
      }, handlerWait);
    }
  }

  private void startKSO(Context context) {
    Log.i(TAG, "Starting KSO");
    try {
      Intent ksoIntent = new Intent();
      ksoIntent.setComponent(new ComponentName("com.synetics.stay.alive", "com.synetics.stay.alive.main"));
      ksoIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      context.startActivity(ksoIntent);
    } catch (Exception ex) {
      Log.w(TAG, "Unable to start Keep Screen On activity.");
    }
  }

  private void startMDL(Context context) {
    Log.i(TAG, "Starting MDL");
    try {
      Intent startMDL = new Intent(context, MainActivity.class);
      startMDL.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      context.startActivity(startMDL);
    } catch (Exception ex) {
      Log.w(TAG, "Unable to start MDL." + ex.toString());
    }
  }
}
