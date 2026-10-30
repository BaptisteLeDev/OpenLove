package app.openlove.core.theme

import app.openlove.core.api.ApiJson
import kotlinx.serialization.Serializable

@Serializable
data class Tokens(
    val seed: String,
    val typography: TypeScale,
    val shape: ShapeScale,
) {
    companion object {
        fun decode(text: String) = ApiJson.decodeFromString(serializer(), text)
    }
}

@Serializable
data class TypeScale(
    val headlineLarge: TypeStyle,
    val titleLarge: TypeStyle,
    val titleMedium: TypeStyle,
    val bodyLarge: TypeStyle,
    val bodyMedium: TypeStyle,
    val labelLarge: TypeStyle,
)

@Serializable
data class TypeStyle(
    val fontSize: Float,
    val lineHeight: Float,
    val fontWeight: Int,
    val letterSpacing: Float,
)

@Serializable
data class ShapeScale(
    val extraSmall: Float,
    val small: Float,
    val medium: Float,
    val large: Float,
    val extraLarge: Float,
)
