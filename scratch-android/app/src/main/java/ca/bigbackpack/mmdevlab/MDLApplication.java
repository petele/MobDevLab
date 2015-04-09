package ca.bigbackpack.mmdevlab;

import android.app.Application;
import android.util.Log;

import com.firebase.client.Firebase;

/**
 * Created by petele on 4/9/15.
 */
public class MDLApplication extends Application {

  @Override
  public void onCreate() {
    super.onCreate();
    Log.i("***APP***", "onCreate");
    Firebase.setAndroidContext(this);
  }

  public void log() {
    Log.i("***APP***", "hey, log it here");
  }
}
