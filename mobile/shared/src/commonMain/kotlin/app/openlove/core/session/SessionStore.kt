package app.openlove.core.session

import app.openlove.core.api.Session
import io.ktor.http.URLProtocol
import io.ktor.http.Url
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

        private val HOST = Regex("[A-Za-z0-9.-]+")

        fun instanceUrl(raw: String): String? {
            val url = runCatching { Url(raw.trim()) }.getOrNull() ?: return null
            val web = url.protocol == URLProtocol.HTTPS || url.protocol == URLProtocol.HTTP
            val bare = url.encodedPath.trimEnd('/').isEmpty() && url.encodedQuery.isEmpty()
            if (!web || !bare || !HOST.matches(url.host)) return null
            val port = if (url.specifiedPort == 0) "" else ":${url.specifiedPort}"
            return "${url.protocol.name}://${url.host}$port"
        }
    }
}
