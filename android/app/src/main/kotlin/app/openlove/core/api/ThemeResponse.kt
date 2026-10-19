package app.openlove.core.api

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import kotlinx.serialization.KSerializer
import kotlinx.serialization.Serializable
import kotlinx.serialization.SerializationException
import kotlinx.serialization.descriptors.PrimitiveKind
import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder

typealias HexColor =
    @Serializable(with = HexColorSerializer::class)
    Color

@Serializable
data class ThemeResponse(
    val seed: HexColor,
    val light: ColorRoles,
    val dark: ColorRoles,
)

@Serializable
data class ColorRoles(
    val primary: HexColor,
    val onPrimary: HexColor,
    val primaryContainer: HexColor,
    val onPrimaryContainer: HexColor,
    val inversePrimary: HexColor,
    val secondary: HexColor,
    val onSecondary: HexColor,
    val secondaryContainer: HexColor,
    val onSecondaryContainer: HexColor,
    val tertiary: HexColor,
    val onTertiary: HexColor,
    val tertiaryContainer: HexColor,
    val onTertiaryContainer: HexColor,
    val background: HexColor,
    val onBackground: HexColor,
    val surface: HexColor,
    val onSurface: HexColor,
    val surfaceVariant: HexColor,
    val onSurfaceVariant: HexColor,
    val surfaceTint: HexColor,
    val inverseSurface: HexColor,
    val inverseOnSurface: HexColor,
    val error: HexColor,
    val onError: HexColor,
    val errorContainer: HexColor,
    val onErrorContainer: HexColor,
    val outline: HexColor,
    val outlineVariant: HexColor,
    val scrim: HexColor,
    val surfaceBright: HexColor,
    val surfaceContainer: HexColor,
    val surfaceContainerHigh: HexColor,
    val surfaceContainerHighest: HexColor,
    val surfaceContainerLow: HexColor,
    val surfaceContainerLowest: HexColor,
    val surfaceDim: HexColor,
)

object HexColorSerializer : KSerializer<Color> {
    private val hex = Regex("#[0-9a-f]{6}")

    override val descriptor = PrimitiveSerialDescriptor("HexColor", PrimitiveKind.STRING)

    override fun deserialize(decoder: Decoder): Color {
        val s = decoder.decodeString()
        if (!hex.matches(s)) throw SerializationException("not a #rrggbb color: $s")
        return Color(0xFF000000 or s.drop(1).toLong(16))
    }

    override fun serialize(
        encoder: Encoder,
        value: Color,
    ) = encoder.encodeString("#%06x".format(value.toArgb() and 0xFFFFFF))
}
