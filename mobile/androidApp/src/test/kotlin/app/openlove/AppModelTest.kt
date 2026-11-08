package app.openlove

import app.openlove.core.api.ApiJson
import app.openlove.core.api.HomeResponse
import app.openlove.core.api.OpenLoveClient
import app.openlove.core.api.ThemeResponse
import app.openlove.core.api.createApiClient
import app.openlove.core.session.EncryptedSessionStore
import app.openlove.core.theme.ThemeCache
import com.google.crypto.tink.Aead
import com.google.crypto.tink.KeyTemplates
import com.google.crypto.tink.KeysetHandle
import com.google.crypto.tink.RegistryConfiguration
import com.google.crypto.tink.aead.AeadConfig
import io.ktor.client.engine.mock.MockEngine
import io.ktor.client.engine.mock.MockRequestHandleScope
import io.ktor.client.engine.mock.respond
import io.ktor.client.request.HttpRequestData
import io.ktor.client.request.HttpResponseData
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.headersOf
import io.ktor.http.isSuccess
import kotlinx.coroutines.CompletableJob
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancelAndJoin
import kotlinx.coroutines.test.runTest
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import java.io.File

class AppModelTest {
    @get:Rule
    val tmp = TemporaryFolder()

    private val aead = newAead()
    private val link = "openlove://pair?instance=https%3A%2F%2Fx.test&code=" + "a".repeat(24)
    private val sessionJson = fixture("session.json").toString()
    private val homeFixture = ApiJson.decodeFromJsonElement(HomeResponse.serializer(), fixture("home.json"))
    private val themeFixture = ApiJson.decodeFromJsonElement(ThemeResponse.serializer(), fixture("theme.json"))

    private val calls = mutableListOf<String>()
    private val homeBearers = mutableListOf<String?>()
    private var pairingStatus = HttpStatusCode.OK
    private var pairingHtml: String? = null
    private var signInStatus = HttpStatusCode.OK
    private val homeStatuses = ArrayDeque<HttpStatusCode>()
    private var refreshStatus = HttpStatusCode.OK
    private lateinit var scope: CompletableJob

    private fun fixture(name: String): JsonElement =
        Json
            .parseToJsonElement(File(System.getProperty("contracts.dir"), name).readText())
            .jsonObject
            .getValue("valid")
            .jsonArray
            .first()

    private val errorBody = """{"error":{"code":"unauthorized","message":"no"}}"""

    private fun MockRequestHandleScope.reply(
        status: HttpStatusCode,
        data: String,
    ) = respond(
        if (status.isSuccess()) """{"data":$data}""" else errorBody,
        status,
        headersOf(HttpHeaders.ContentType, "application/json"),
    )

    private fun MockRequestHandleScope.route(req: HttpRequestData): HttpResponseData {
        val path = req.url.encodedPath
        calls += path
        return when (path) {
            "/api/pairing" ->
                pairingHtml?.let { respond(it, pairingStatus, headersOf(HttpHeaders.ContentType, "text/html")) }
                    ?: reply(pairingStatus, sessionJson)
            "/api/session" -> reply(signInStatus, sessionJson)
            "/api/session/refresh" -> reply(refreshStatus, sessionJson)
            "/api/home" -> {
                homeBearers += req.headers[HttpHeaders.Authorization]
                reply(homeStatuses.removeFirstOrNull() ?: HttpStatusCode.OK, fixture("home.json").toString())
            }
            "/api/theme" -> reply(HttpStatusCode.OK, fixture("theme.json").toString())
            else -> respond("", HttpStatusCode.NotFound)
        }
    }

    private fun newModel(): AppModel {
        scope = SupervisorJob()
        val store = EncryptedSessionStore(File(tmp.root, "session.enc"), aead, CoroutineScope(scope))
        val client = OpenLoveClient(store, createApiClient(MockEngine { route(it) }))
        return AppModel(client, ThemeCache(File(tmp.root, "theme.json")))
    }

    private fun sessionFile() = File(tmp.root, "session.enc")

    @Test
    fun androidAppairageByQr() =
        runTest {
            val model = newModel()
            model.start()
            assertEquals(Screen.Pairing(null), model.screen.value)
            model.pair(link)
            assertEquals(Screen.Home(homeFixture), model.screen.value)
            assertEquals(listOf<String?>("Bearer access-token"), homeBearers)
            assertEquals(themeFixture, model.theme.value)
            assertEquals(themeFixture, ThemeCache(File(tmp.root, "theme.json")).read())
            scope.cancelAndJoin()
        }

    @Test
    fun sessionSurvivesAppRestart() =
        runTest {
            newModel().pair(link)
            scope.cancelAndJoin()
            val model = newModel()
            assertNotNull(model.theme.value)
            model.start()
            assertEquals(Screen.Home(homeFixture), model.screen.value)
            assertEquals(1, calls.count { it == "/api/pairing" })
            scope.cancelAndJoin()
        }

    @Test
    fun restartWithExpiredAccessTokenRefreshes() =
        runTest {
            newModel().pair(link)
            scope.cancelAndJoin()
            homeStatuses += HttpStatusCode.Unauthorized
            val model = newModel()
            model.start()
            assertEquals(Screen.Home(homeFixture), model.screen.value)
            assertEquals(1, calls.count { it == "/api/session/refresh" })
            scope.cancelAndJoin()
        }

    @Test
    fun expiredCodeShowsCodeExpired() =
        runTest {
            pairingStatus = HttpStatusCode.Unauthorized
            val model = newModel()
            model.pair(link)
            assertEquals(Screen.Pairing(PairingError.CodeExpired), model.screen.value)
            scope.cancelAndJoin()
            assertEquals(false, storeHolds())
        }

    @Test
    fun revokedRefreshTokenBackToPairing() =
        runTest {
            newModel().pair(link)
            scope.cancelAndJoin()
            homeStatuses += HttpStatusCode.Unauthorized
            refreshStatus = HttpStatusCode.Unauthorized
            val model = newModel()
            model.start()
            assertEquals(Screen.Pairing(null), model.screen.value)
            scope.cancelAndJoin()
            assertEquals(false, storeHolds())
        }

    @Test
    fun signInFallback() =
        runTest {
            val model = newModel()
            model.signIn("https://x.test", "a@b.c", "pw")
            assertEquals(Screen.Home(homeFixture), model.screen.value)
            scope.cancelAndJoin()
            signInStatus = HttpStatusCode.Forbidden
            calls.clear()
            val other = newModel()
            other.signIn("https://x.test", "a@b.c", "pw")
            assertEquals(Screen.Pairing(PairingError.NotMember), other.screen.value)
            calls.clear()
            other.signIn("x.test", "a@b.c", "pw")
            assertEquals(Screen.Pairing(PairingError.InvalidLink), other.screen.value)
            assertEquals(emptyList<String>(), calls)
            scope.cancelAndJoin()
        }

    @Test
    fun htmlProxyErrorShowsUnreachable() =
        runTest {
            pairingStatus = HttpStatusCode.BadGateway
            pairingHtml = "<html>Bad Gateway</html>"
            val model = newModel()
            model.pair(link)
            assertEquals(Screen.Pairing(PairingError.Unreachable), model.screen.value)
            scope.cancelAndJoin()
        }

    @Test
    fun homeFailureAfterPairingKeepsSession() =
        runTest {
            homeStatuses += HttpStatusCode.BadGateway
            val model = newModel()
            model.pair(link)
            assertEquals(Screen.Unreachable, model.screen.value)
            scope.cancelAndJoin()
            assertEquals(true, storeHolds())
        }

    private suspend fun storeHolds(): Boolean {
        val job = SupervisorJob()
        return (EncryptedSessionStore(sessionFile(), aead, CoroutineScope(job)).read() != null).also { job.cancelAndJoin() }
    }

    private fun newAead(): Aead {
        AeadConfig.register()
        return KeysetHandle
            .generateNew(KeyTemplates.get("AES256_GCM"))
            .getPrimitive(RegistryConfiguration.get(), Aead::class.java)
    }
}
