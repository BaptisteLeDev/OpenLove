package app.openlove.core.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
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
        primary = c.primary,
        onPrimary = c.onPrimary,
        primaryContainer = c.primaryContainer,
        onPrimaryContainer = c.onPrimaryContainer,
        inversePrimary = c.inversePrimary,
        secondary = c.secondary,
        onSecondary = c.onSecondary,
        secondaryContainer = c.secondaryContainer,
        onSecondaryContainer = c.onSecondaryContainer,
        tertiary = c.tertiary,
        onTertiary = c.onTertiary,
        tertiaryContainer = c.tertiaryContainer,
        onTertiaryContainer = c.onTertiaryContainer,
        background = c.background,
        onBackground = c.onBackground,
        surface = c.surface,
        onSurface = c.onSurface,
        surfaceVariant = c.surfaceVariant,
        onSurfaceVariant = c.onSurfaceVariant,
        surfaceTint = c.surfaceTint,
        inverseSurface = c.inverseSurface,
        inverseOnSurface = c.inverseOnSurface,
        error = c.error,
        onError = c.onError,
        errorContainer = c.errorContainer,
        onErrorContainer = c.onErrorContainer,
        outline = c.outline,
        outlineVariant = c.outlineVariant,
        scrim = c.scrim,
        surfaceBright = c.surfaceBright,
        surfaceContainer = c.surfaceContainer,
        surfaceContainerHigh = c.surfaceContainerHigh,
        surfaceContainerHighest = c.surfaceContainerHighest,
        surfaceContainerLow = c.surfaceContainerLow,
        surfaceContainerLowest = c.surfaceContainerLowest,
        surfaceDim = c.surfaceDim,
    )
}

class ThemeCache(
    private val file: File,
) {
    // Unreadable or stale cache must never block startup: fall back to defaults.
    fun read(): ThemeResponse? = runCatching { Json.decodeFromString<ThemeResponse>(file.readText()) }.getOrNull()

    fun save(theme: ThemeResponse) = file.writeText(Json.encodeToString(theme))
}
