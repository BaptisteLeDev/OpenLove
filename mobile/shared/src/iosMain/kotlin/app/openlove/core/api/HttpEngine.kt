package app.openlove.core.api

import io.ktor.client.engine.HttpClientEngineFactory
import io.ktor.client.engine.darwin.Darwin

actual val httpEngine: HttpClientEngineFactory<*> = Darwin
