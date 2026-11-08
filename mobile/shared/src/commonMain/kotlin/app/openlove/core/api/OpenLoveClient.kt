package app.openlove.core.api

import app.openlove.core.session.PairingLink
import app.openlove.core.session.SessionStore
import app.openlove.core.session.StoredSession
import io.ktor.client.HttpClient
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.HttpResponse
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.contentType
import io.ktor.http.isSuccess
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.serialization.Serializable
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString

class ApiException(
    val status: Int,
    val code: String,
    override val message: String,
) : Exception(message)

@Serializable
private data class Envelope<T>(
    val data: T,
)

@Serializable
private data class PairingBody(
    val code: String,
)

@Serializable
private data class SignInBody(
    val email: String,
    val password: String,
)

@Serializable
private data class RefreshBody(
    val refreshToken: String,
)

class OpenLoveClient(
    private val store: SessionStore,
    private val http: HttpClient = createApiClient(),
) {
    private val refreshLock = Mutex()

    suspend fun isPaired(): Boolean = store.read() != null

    suspend fun pair(link: PairingLink) = start(link.instanceUrl, "/api/pairing", PairingBody(link.code))

    suspend fun signIn(
        instanceUrl: String,
        email: String,
        password: String,
    ) = start(instanceUrl, "/api/session", SignInBody(email, password))

    suspend fun home(): HomeResponse = authed("/api/home")

    suspend fun theme(): ThemeResponse = send(current().instanceUrl, "/api/theme")

    private suspend inline fun <reified B : Any> start(
        instanceUrl: String,
        path: String,
        body: B,
    ) {
        val session: Session = send(instanceUrl, path, ApiJson.encodeToString(body))
        store.write(StoredSession(instanceUrl, session))
    }

    private suspend fun current() = store.read() ?: error("not paired")

    private suspend inline fun <reified T> authed(path: String): T {
        val stale = current()
        try {
            return send(stale.instanceUrl, path, token = stale.session.accessToken)
        } catch (e: ApiException) {
            if (e.status != 401) throw e
        }
        val fresh = refresh(stale)
        return send(fresh.instanceUrl, path, token = fresh.session.accessToken)
    }

    private suspend fun refresh(stale: StoredSession): StoredSession =
        refreshLock.withLock {
            val now = store.read() ?: throw ApiException(401, "unauthorized", "session expired")
            if (now.session.accessToken != stale.session.accessToken) return now
            try {
                val session: Session =
                    send(now.instanceUrl, "/api/session/refresh", ApiJson.encodeToString(RefreshBody(now.session.refreshToken)))
                StoredSession(now.instanceUrl, session).also { store.write(it) }
            } catch (e: ApiException) {
                if (e.status == 401) store.write(null)
                throw e
            }
        }

    private suspend inline fun <reified T> send(
        instanceUrl: String,
        path: String,
        json: String? = null,
        token: String? = null,
    ): T {
        val response =
            if (json == null) {
                http.get(instanceUrl + path) { token?.let { header(HttpHeaders.Authorization, "Bearer $it") } }
            } else {
                http.post(instanceUrl + path) {
                    contentType(ContentType.Application.Json)
                    setBody(json)
                }
            }
        return unwrap(response)
    }

    private suspend inline fun <reified T> unwrap(response: HttpResponse): T {
        val status = response.status.value
        val text = response.bodyAsText()
        try {
            if (response.status.isSuccess()) return ApiJson.decodeFromString<Envelope<T>>(text).data
            val error = ApiJson.decodeFromString<ErrorResponse>(text).error
            throw ApiException(status, error.code, error.message)
        } catch (e: IllegalArgumentException) {
            throw ApiException(status, "unavailable", "unexpected response")
        }
    }
}
