package app.openlove

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import app.openlove.core.theme.OpenLoveTheme
import app.openlove.home.HomeScreen
import app.openlove.pairing.PairingScreen
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.codescanner.GmsBarcodeScannerOptions
import com.google.mlkit.vision.codescanner.GmsBarcodeScanning
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    val container by lazy { AppContainer(applicationContext) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val model = container.model
        setContent {
            val theme by model.theme.collectAsState()
            val screen by model.screen.collectAsState()
            LaunchedEffect(Unit) { model.start() }
            OpenLoveTheme(theme, container.tokens) {
                Surface(Modifier.fillMaxSize()) { Content(model, screen) }
            }
        }
    }
}

@Composable
private fun Content(
    model: AppModel,
    screen: Screen,
) {
    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    when (screen) {
        Screen.Loading -> Centered { CircularProgressIndicator() }
        is Screen.Pairing ->
            PairingScreen(
                screen,
                onScan = { scan(context, scope, model) },
                onSignIn = { url, email, password -> scope.launch { model.signIn(url, email, password) } },
            )
        is Screen.Home -> HomeScreen(screen.home)
        Screen.Unreachable ->
            Centered {
                Text(stringResource(R.string.error_unreachable))
                Button(onClick = { scope.launch { model.start() } }) { Text(stringResource(R.string.retry)) }
            }
    }
}

private fun scan(
    context: android.content.Context,
    scope: CoroutineScope,
    model: AppModel,
) {
    val options = GmsBarcodeScannerOptions.Builder().setBarcodeFormats(Barcode.FORMAT_QR_CODE).build()
    GmsBarcodeScanning
        .getClient(context, options)
        .startScan()
        .addOnSuccessListener { scope.launch { model.pair(it.rawValue.orEmpty()) } }
}

@Composable
private fun Centered(content: @Composable () -> Unit) {
    Column(
        Modifier.fillMaxSize().padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp, Alignment.CenterVertically),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) { content() }
}
