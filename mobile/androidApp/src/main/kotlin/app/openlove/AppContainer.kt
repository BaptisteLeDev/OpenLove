package app.openlove

import android.content.Context
import app.openlove.core.api.createApiClient
import app.openlove.core.theme.ThemeCache
import app.openlove.core.theme.Tokens
import java.io.File

class AppContainer(
    context: Context,
) {
    val httpClient by lazy { createApiClient() }

    // shortcut: nothing writes the cache until pairing gives an instance URL.
    val themeCache = ThemeCache(File(context.filesDir, "theme.json"))

    val tokens: Tokens by lazy {
        context.assets.open("tokens.json").use { Tokens.decode(it.reader().readText()) }
    }
}
