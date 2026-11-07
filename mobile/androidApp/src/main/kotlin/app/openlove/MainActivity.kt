package app.openlove

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.ui.res.stringResource
import app.openlove.core.theme.OpenLoveTheme

class MainActivity : ComponentActivity() {
    val container by lazy { AppContainer(applicationContext) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val theme = container.themeCache.read()
        setContent {
            OpenLoveTheme(theme, container.tokens) {
                Surface {
                    Text(stringResource(R.string.home_placeholder))
                }
            }
        }
    }
}
