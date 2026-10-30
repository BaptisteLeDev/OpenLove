package app.openlove.core.api

import io.ktor.client.HttpClient
import io.ktor.client.engine.HttpClientEngineFactory
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.serialization.kotlinx.json.json

expect val httpEngine: HttpClientEngineFactory<*>

fun createApiClient(): HttpClient =
    HttpClient(httpEngine) {
        install(ContentNegotiation) { json(ApiJson) }
    }
