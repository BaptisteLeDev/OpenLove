package app.openlove

import android.content.Context
import app.openlove.core.theme.ThemeCache
import app.openlove.core.theme.Tokens
import io.ktor.client.HttpClient
import io.ktor.client.engine.okhttp.OkHttp
import java.io.File

class AppContainer(
    context: Context,
) {
    val httpClient: HttpClient by lazy { HttpClient(OkHttp) }

    // shortcut: nothing writes the cache until pairing gives an instance URL.
    val themeCache = ThemeCache(File(context.filesDir, "theme.json"))

    val tokens: Tokens by lazy {
        context.assets.open("tokens.json").use { Tokens.decode(it.reader().readText()) }
    }
}
