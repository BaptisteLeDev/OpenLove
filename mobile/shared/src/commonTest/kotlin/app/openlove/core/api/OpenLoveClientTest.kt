package app.openlove.core.api

import app.openlove.core.session.PairingLink
import app.openlove.core.session.SessionStore
import app.openlove.core.session.StoredSession
import io.ktor.client.engine.mock.MockEngine
import io.ktor.client.engine.mock.MockRequestHandleScope
import io.ktor.client.engine.mock.respond
import io.ktor.client.engine.mock.toByteArray
import io.ktor.client.request.HttpRequestData
import io.ktor.client.request.HttpResponseData
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.headersOf
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.test.runTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertNull

private class FakeSessionStore(
    var value: StoredSession? = null,
) : SessionStore {
    override suspend fun read() = value

    override suspend fun write(value: StoredSession?) {
        this.value = value
    }
}

private val json = headersOf(HttpHeaders.ContentType, "application/json")
private const val BASE = "https://x.test"
private val s1 = Session("a1", "r1", 100)
private val s2 = Session("a2", "r2", 200)
private const val SESSION2 = """{"data":{"accessToken":"a2","refreshToken":"r2","expiresAt":200}}"""
private const val HOME = """{"data":{"milestone":{"years":1,"months":2,"days":3,"totalDays":430},"upcomingDate":null}}"""
private const val UNAUTHORIZED = """{"error":{"code":"unauthorized","message":"nope"}}"""

private fun MockRequestHandleScope.reply(
    status: HttpStatusCode,
    body: String,
): HttpResponseData = respond(body, status, json)

private fun client(
    store: SessionStore,
    handler: suspend MockRequestHandleScope.(HttpRequestData) -> HttpResponseData,
) = OpenLoveClient(store, createApiClient(MockEngine(handler)))

class OpenLoveClientTest {
    private val paired get() = FakeSessionStore(StoredSession(BASE, s1))

    @Test
    fun pairPostsCodeAndStoresSession() =
        runTest {
            val store = FakeSessionStore()
            var url = ""
            var body = ""
            val c =
                client(store) {
                    url = it.url.toString()
                    body = it.body.toByteArray().decodeToString()
                    reply(HttpStatusCode.OK, """{"data":{"accessToken":"a1","refreshToken":"r1","expiresAt":100}}""")
                }
            c.pair(PairingLink(BASE, "c0de"))
            assertEquals("$BASE/api/pairing", url)
            assertEquals("""{"code":"c0de"}""", body)
            assertEquals(StoredSession(BASE, s1), store.value)
        }

    @Test
    fun homeSendsBearerAndUnwrapsData() =
        runTest {
            var auth: String? = null
            val c =
                client(paired) {
                    auth = it.headers[HttpHeaders.Authorization]
                    reply(HttpStatusCode.OK, HOME)
                }
            val home = c.home()
            assertEquals("Bearer a1", auth)
            assertEquals(430, home.milestone.totalDays)
            assertNull(home.upcomingDate)
        }

    @Test
    fun home401RefreshesOnceAndRetries() =
        runTest {
            val store = paired
            val auths = mutableListOf<String?>()
            var refreshBody = ""
            val c =
                client(store) {
                    when (it.url.encodedPath) {
                        "/api/session/refresh" -> {
                            refreshBody = it.body.toByteArray().decodeToString()
                            reply(HttpStatusCode.OK, SESSION2)
                        }
                        else -> {
                            auths += it.headers[HttpHeaders.Authorization]
                            if (auths.size == 1) reply(HttpStatusCode.Unauthorized, UNAUTHORIZED) else reply(HttpStatusCode.OK, HOME)
                        }
                    }
                }
            c.home()
            assertEquals("""{"refreshToken":"r1"}""", refreshBody)
            assertEquals(listOf<String?>("Bearer a1", "Bearer a2"), auths)
            assertEquals(StoredSession(BASE, s2), store.value)
        }

    @Test
    fun parallel401sRefreshOnce() =
        runTest {
            val store = paired
            var refreshes = 0
            val gate = CompletableDeferred<Unit>()
            var first401 = 0
            val c =
                client(store) {
                    if (it.url.encodedPath == "/api/session/refresh") {
                        refreshes++
                        reply(HttpStatusCode.OK, SESSION2)
                    } else if (it.headers[HttpHeaders.Authorization] == "Bearer a1") {
                        if (++first401 == 2) gate.complete(Unit)
                        gate.await()
                        reply(HttpStatusCode.Unauthorized, UNAUTHORIZED)
                    } else {
                        reply(HttpStatusCode.OK, HOME)
                    }
                }
            val results = listOf(async { c.home() }, async { c.home() }).awaitAll()
            assertEquals(2, first401)
            assertEquals(2, results.size)
            assertEquals(1, refreshes)
        }

    @Test
    fun refresh401WipesSession() =
        runTest {
            val store = paired
            var refreshes = 0
            val c =
                client(store) {
                    if (it.url.encodedPath == "/api/session/refresh") refreshes++
                    reply(HttpStatusCode.Unauthorized, UNAUTHORIZED)
                }
            val e = assertFailsWith<ApiException> { c.home() }
            assertEquals(401, e.status)
            assertNull(store.read())
            assertEquals(1, refreshes)
        }

    @Test
    fun errorEnvelopeBecomesApiException() =
        runTest {
            val store = FakeSessionStore()
            val c =
                client(
                    store,
                ) { reply(HttpStatusCode.Unauthorized, """{"error":{"code":"unauthorized","message":"invalid pairing code"}}""") }
            val e = assertFailsWith<ApiException> { c.pair(PairingLink(BASE, "bad")) }
            assertEquals(401, e.status)
            assertEquals("unauthorized", e.code)
            assertEquals("invalid pairing code", e.message)
            assertNull(store.value)
        }

    @Test
    fun htmlErrorBecomesUnavailable() =
        runTest {
            val c =
                client(paired) {
                    respond("<html>bad gateway</html>", HttpStatusCode.BadGateway, headersOf(HttpHeaders.ContentType, "text/html"))
                }
            val e = assertFailsWith<ApiException> { c.home() }
            assertEquals(502, e.status)
            assertEquals("unavailable", e.code)
        }
}
