package app.openlove.core.api

import kotlinx.serialization.Serializable

@Serializable
data class HealthResponse(
    val ok: Boolean,
)
