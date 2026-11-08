package app.openlove

import android.content.Context
import app.openlove.core.api.OpenLoveClient
import app.openlove.core.session.EncryptedSessionStore
import app.openlove.core.session.keystoreAead
import app.openlove.core.theme.ThemeCache
import app.openlove.core.theme.Tokens
import java.io.File

class AppContainer(
    context: Context,
) {
    val themeCache = ThemeCache(File(context.filesDir, "theme.json"))

    val client by lazy { OpenLoveClient(EncryptedSessionStore(File(context.filesDir, "session.enc"), keystoreAead(context))) }

    val model by lazy { AppModel(client, themeCache) }

    val tokens: Tokens by lazy {
        context.assets.open("tokens.json").use { Tokens.decode(it.reader().readText()) }
    }
}
