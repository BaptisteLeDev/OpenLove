package app.openlove.core.theme

import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.openlove.core.api.ApiJson
import app.openlove.core.api.ThemeResponse
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import java.io.File

class ThemeTest {
    @get:Rule val tmp = TemporaryFolder()

    private val fixture: ThemeResponse =
        ApiJson
            .parseToJsonElement(File(System.getProperty("contracts.dir"), "theme.json").readText())
            .jsonObject
            .getValue("valid")
            .jsonArray
            .first()
            .let { ApiJson.decodeFromJsonElement(ThemeResponse.serializer(), it) }

    @Test
    fun payloadRoleMapsToColorScheme() {
        val payload = fixture.copy(dark = fixture.dark.copy(primary = 0xFF123456))
        assertEquals(Color(0xFF123456), colorScheme(payload, dark = true).primary)
        assertEquals(Color(fixture.light.onSurface), colorScheme(payload, dark = false).onSurface)
    }

    @Test
    fun noCacheFallsBackToDefaultM3Scheme() {
        val cache = ThemeCache(File(tmp.root, "theme.json"))
        val cached = cache.read()
        assertEquals(null, cached)
        assertEquals(lightColorScheme().primary, colorScheme(cached, dark = false).primary)
        assertEquals(darkColorScheme().primary, colorScheme(cached, dark = true).primary)
    }

    @Test
    fun cacheRoundTrips() {
        val cache = ThemeCache(File(tmp.root, "theme.json"))
        cache.save(fixture)
        assertEquals(fixture, cache.read())
    }

    @Test
    fun corruptCacheFallsBack() {
        val file = File(tmp.root, "theme.json").apply { writeText("{") }
        assertEquals(null, ThemeCache(file).read())
    }

    @Test
    fun sharedTokensDecodeToTypographyAndShapes() {
        val tokens = Tokens.decode(File(System.getProperty("tokens.file")).readText())
        assertEquals(22.sp, tokens.typography().titleLarge.fontSize)
        assertEquals(
            androidx.compose.foundation.shape
                .RoundedCornerShape(12.dp),
            tokens.shapes().medium,
        )
    }
}
