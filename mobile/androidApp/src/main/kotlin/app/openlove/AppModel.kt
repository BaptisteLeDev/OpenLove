package app.openlove

import app.openlove.core.api.ApiException
import app.openlove.core.api.HomeResponse
import app.openlove.core.api.OpenLoveClient
import app.openlove.core.api.ThemeResponse
import app.openlove.core.session.PairingLink
import app.openlove.core.theme.ThemeCache
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import java.io.IOException

sealed interface Screen {
    data object Loading : Screen

    data class Pairing(
        val error: PairingError? = null,
    ) : Screen

    data class Home(
        val home: HomeResponse,
    ) : Screen

    data object Unreachable : Screen
}

enum class PairingError { CodeExpired, BadCredentials, NotMember, RateLimited, InvalidLink, Unreachable }

class AppModel(
    private val client: OpenLoveClient,
    private val themeCache: ThemeCache,
) {
    private val _screen = MutableStateFlow<Screen>(Screen.Loading)
    val screen: StateFlow<Screen> = _screen

    private val _theme = MutableStateFlow(themeCache.read())
    val theme: StateFlow<ThemeResponse?> = _theme

    suspend fun start() {
        if (!client.isPaired()) {
            _screen.value = Screen.Pairing()
            return
        }
        _screen.value =
            try {
                loadHome()
            } catch (e: ApiException) {
                if (e.status == 401) Screen.Pairing() else Screen.Unreachable
            } catch (e: IOException) {
                Screen.Unreachable
            }
    }

    suspend fun pair(raw: String) {
        val link = PairingLink.parse(raw) ?: return fail(PairingError.InvalidLink)
        enter(codeStatus = 401) { client.pair(link) }
    }

    suspend fun signIn(
        instanceUrl: String,
        email: String,
        password: String,
    ) {
        val url = PairingLink.instanceUrl(instanceUrl) ?: return fail(PairingError.InvalidLink)
        enter(codeStatus = null) { client.signIn(url, email, password) }
    }

    private suspend fun enter(
        codeStatus: Int?,
        begin: suspend () -> Unit,
    ) {
        _screen.value = Screen.Loading
        try {
            begin()
            _screen.value = loadHome()
        } catch (e: ApiException) {
            fail(errorOf(e.status, codeStatus))
        } catch (e: IOException) {
            fail(PairingError.Unreachable)
        }
    }

    private suspend fun loadHome(): Screen.Home {
        val home = Screen.Home(client.home())
        try {
            client.theme().let {
                themeCache.save(it)
                _theme.value = it
            }
        } catch (e: ApiException) {
            // theme is cosmetic: keep cached one
        } catch (e: IOException) {
            // same
        }
        return home
    }

    private fun fail(error: PairingError) {
        _screen.value = Screen.Pairing(error)
    }

    private fun errorOf(
        status: Int,
        codeStatus: Int?,
    ) = when (status) {
        codeStatus -> PairingError.CodeExpired
        400 -> if (codeStatus != null) PairingError.InvalidLink else PairingError.BadCredentials
        401 -> PairingError.BadCredentials
        403 -> PairingError.NotMember
        429 -> PairingError.RateLimited
        else -> PairingError.Unreachable
    }
}
