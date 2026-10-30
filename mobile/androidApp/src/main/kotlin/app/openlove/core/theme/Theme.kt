package app.openlove.core.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import app.openlove.core.api.ThemeResponse
import kotlinx.serialization.json.Json
import java.io.File

@Composable
fun OpenLoveTheme(
    theme: ThemeResponse?,
    tokens: Tokens,
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = colorScheme(theme, isSystemInDarkTheme()),
        shapes = tokens.shapes(),
        typography = tokens.typography(),
        content = content,
    )
}

fun colorScheme(
    theme: ThemeResponse?,
    dark: Boolean,
): ColorScheme {
    val base = if (dark) darkColorScheme() else lightColorScheme()
    val c = (if (dark) theme?.dark else theme?.light) ?: return base
    return base.copy(
        primary = Color(c.primary),
        onPrimary = Color(c.onPrimary),
        primaryContainer = Color(c.primaryContainer),
        onPrimaryContainer = Color(c.onPrimaryContainer),
        inversePrimary = Color(c.inversePrimary),
        secondary = Color(c.secondary),
        onSecondary = Color(c.onSecondary),
        secondaryContainer = Color(c.secondaryContainer),
        onSecondaryContainer = Color(c.onSecondaryContainer),
        tertiary = Color(c.tertiary),
        onTertiary = Color(c.onTertiary),
        tertiaryContainer = Color(c.tertiaryContainer),
        onTertiaryContainer = Color(c.onTertiaryContainer),
        background = Color(c.background),
        onBackground = Color(c.onBackground),
        surface = Color(c.surface),
        onSurface = Color(c.onSurface),
        surfaceVariant = Color(c.surfaceVariant),
        onSurfaceVariant = Color(c.onSurfaceVariant),
        surfaceTint = Color(c.surfaceTint),
        inverseSurface = Color(c.inverseSurface),
        inverseOnSurface = Color(c.inverseOnSurface),
        error = Color(c.error),
        onError = Color(c.onError),
        errorContainer = Color(c.errorContainer),
        onErrorContainer = Color(c.onErrorContainer),
        outline = Color(c.outline),
        outlineVariant = Color(c.outlineVariant),
        scrim = Color(c.scrim),
        surfaceBright = Color(c.surfaceBright),
        surfaceContainer = Color(c.surfaceContainer),
        surfaceContainerHigh = Color(c.surfaceContainerHigh),
        surfaceContainerHighest = Color(c.surfaceContainerHighest),
        surfaceContainerLow = Color(c.surfaceContainerLow),
        surfaceContainerLowest = Color(c.surfaceContainerLowest),
        surfaceDim = Color(c.surfaceDim),
    )
}

class ThemeCache(
    private val file: File,
) {
    // Unreadable or stale cache must never block startup: fall back to defaults.
    fun read(): ThemeResponse? = runCatching { Json.decodeFromString<ThemeResponse>(file.readText()) }.getOrNull()

    fun save(theme: ThemeResponse) = file.writeText(Json.encodeToString(theme))
}
