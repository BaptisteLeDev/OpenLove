package app.openlove.core.api

import kotlinx.serialization.Serializable

@Serializable
data class HomeResponse(
    val milestone: Milestone,
    val upcomingDate: UpcomingDate?,
)

@Serializable
data class Milestone(
    val years: Int,
    val months: Int,
    val days: Int,
    val totalDays: Int,
) {
    init {
        require(years >= 0 && months >= 0 && days >= 0 && totalDays >= 0)
    }
}

@Serializable
data class UpcomingDate(
    val label: String,
    val date: String,
    val inDays: Int,
) {
    init {
        require(label.isNotEmpty())
        require(Regex("\\d{4}-\\d{2}-\\d{2}").matches(date))
        require(inDays in 0..30)
    }
}
