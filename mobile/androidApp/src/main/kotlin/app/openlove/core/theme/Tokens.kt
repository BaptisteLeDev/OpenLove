package app.openlove.core.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

fun Tokens.typography() =
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

fun Tokens.shapes() =
    Shapes(
        extraSmall = RoundedCornerShape(shape.extraSmall.dp),
        small = RoundedCornerShape(shape.small.dp),
        medium = RoundedCornerShape(shape.medium.dp),
        large = RoundedCornerShape(shape.large.dp),
        extraLarge = RoundedCornerShape(shape.extraLarge.dp),
    )

fun TypeStyle.applyTo(base: TextStyle) =
    base.copy(
        fontSize = fontSize.sp,
        lineHeight = lineHeight.sp,
        fontWeight = FontWeight(fontWeight),
        letterSpacing = letterSpacing.sp,
    )
