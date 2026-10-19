package app.openlove

import io.ktor.client.HttpClient
import io.ktor.client.engine.okhttp.OkHttp

class AppContainer {
    val httpClient: HttpClient by lazy { HttpClient(OkHttp) }
}
