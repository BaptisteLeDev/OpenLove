package app.openlove.core.session

import app.openlove.core.api.Session
import io.ktor.http.decodeURLQueryComponent
import kotlinx.serialization.Serializable

@Serializable
data class StoredSession(
    val instanceUrl: String,
    val session: Session,
)

interface SessionStore {
    suspend fun read(): StoredSession?

    suspend fun write(value: StoredSession?)
}

data class PairingLink(
    val instanceUrl: String,
    val code: String,
) {
    companion object {
        private const val PREFIX = "openlove://pair?"

        fun parse(raw: String): PairingLink? =
            runCatching {
                if (!raw.startsWith(PREFIX)) return@runCatching null
                val params =
                    raw.removePrefix(PREFIX).split('&').associate {
                        it.substringBefore('=').decodeURLQueryComponent() to
                            it.substringAfter('=', "").decodeURLQueryComponent()
                    }
                val code = params["code"]?.takeIf { it.isNotEmpty() } ?: return@runCatching null
                instanceUrl(params["instance"] ?: return@runCatching null)?.let { PairingLink(it, code) }
            }.getOrNull()

        fun instanceUrl(raw: String): String? {
            val url = raw.trim().trimEnd('/')
            val host = url.removePrefixOrNull("https://") ?: url.removePrefixOrNull("http://")
            return url.takeIf { !host.isNullOrEmpty() }
        }

        private fun String.removePrefixOrNull(prefix: String) = if (startsWith(prefix)) removePrefix(prefix) else null
    }
}
