package app.openlove.core.api

import kotlinx.serialization.Serializable

@Serializable
data class Session(
    val accessToken: String,
    val refreshToken: String,
    val expiresAt: Long,
)
