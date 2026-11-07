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

        fun parse(raw: String): PairingLink? {
            if (!raw.startsWith(PREFIX)) return null
            val params =
                raw.removePrefix(PREFIX).split('&').associate {
                    it.substringBefore('=').decodeURLQueryComponent() to
                        it.substringAfter('=', "").decodeURLQueryComponent()
                }
            val code = params["code"]?.takeIf { it.isNotEmpty() } ?: return null
            return instanceUrl(params["instance"] ?: return null)?.let { PairingLink(it, code) }
        }

        fun instanceUrl(raw: String): String? {
            val url = raw.trim().trimEnd('/')
            val host = url.removePrefixOrNull("https://") ?: url.removePrefixOrNull("http://")
            return url.takeIf { !host.isNullOrEmpty() }
        }

        private fun String.removePrefixOrNull(prefix: String) = if (startsWith(prefix)) removePrefix(prefix) else null
    }
}
