package app.openlove.core.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
data class Tokens(
    val seed: String,
    val typography: TypeScale,
    val shape: ShapeScale,
) {
    fun typography() =
        Typography().run {
            copy(
                headlineLarge = typography.headlineLarge.applyTo(headlineLarge),
                titleLarge = typography.titleLarge.applyTo(titleLarge),
                titleMedium = typography.titleMedium.applyTo(titleMedium),
                bodyLarge = typography.bodyLarge.applyTo(bodyLarge),
                bodyMedium = typography.bodyMedium.applyTo(bodyMedium),
                labelLarge = typography.labelLarge.applyTo(labelLarge),
            )
        }

    fun shapes() =
        Shapes(
            extraSmall = RoundedCornerShape(shape.extraSmall.dp),
            small = RoundedCornerShape(shape.small.dp),
            medium = RoundedCornerShape(shape.medium.dp),
            large = RoundedCornerShape(shape.large.dp),
            extraLarge = RoundedCornerShape(shape.extraLarge.dp),
        )

    companion object {
        fun decode(text: String) = Json.decodeFromString<Tokens>(text)
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
) {
    fun applyTo(base: TextStyle) =
        base.copy(
            fontSize = fontSize.sp,
            lineHeight = lineHeight.sp,
            fontWeight = FontWeight(fontWeight),
            letterSpacing = letterSpacing.sp,
        )
}

@Serializable
data class ShapeScale(
    val extraSmall: Float,
    val small: Float,
    val medium: Float,
    val large: Float,
    val extraLarge: Float,
)
