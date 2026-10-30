package app.openlove.core.api

import kotlinx.serialization.Serializable

@Serializable
data class MessagesResponse(
    val items: List<Message>,
    val nextCursor: String?,
)

@Serializable
data class Message(
    val id: String,
    val authorId: String,
    val body: String,
    val createdAt: String,
)
