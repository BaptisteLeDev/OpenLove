package app.openlove.core.api

import io.ktor.client.engine.HttpClientEngineFactory
import io.ktor.client.engine.okhttp.OkHttp

actual val httpEngine: HttpClientEngineFactory<*> = OkHttp
