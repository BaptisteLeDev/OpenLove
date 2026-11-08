package app.openlove

import android.app.Application

class OpenLoveApp : Application() {
    // One per process: DataStore refuses two stores on session.enc.
    val container by lazy { AppContainer(this) }
}
