package app.openlove.core.api

import kotlinx.serialization.Serializable

@Serializable
data class ErrorResponse(
    val error: ErrorBody,
)

@Serializable
data class ErrorBody(
    val code: String,
    val message: String,
)
