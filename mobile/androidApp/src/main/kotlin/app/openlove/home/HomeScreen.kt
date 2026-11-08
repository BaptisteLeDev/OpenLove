package app.openlove.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import app.openlove.R
import app.openlove.core.api.HomeResponse

@Composable
fun HomeScreen(home: HomeResponse) {
    Column(Modifier.fillMaxSize().padding(24.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(stringResource(R.string.home_milestone_title), style = MaterialTheme.typography.titleMedium)
        val total = home.milestone.totalDays
        Text(pluralStringResource(R.plurals.home_total_days, total, total), style = MaterialTheme.typography.displaySmall)
        Text(stringResource(R.string.home_upcoming_title), style = MaterialTheme.typography.titleMedium)
        val upcoming = home.upcomingDate
        if (upcoming == null) {
            Text(stringResource(R.string.home_upcoming_none))
        } else {
            Text(upcoming.label, style = MaterialTheme.typography.titleLarge)
            val days = upcoming.inDays
            Text(
                if (days == 0) {
                    stringResource(R.string.home_upcoming_today)
                } else {
                    pluralStringResource(R.plurals.home_upcoming_in_days, days, days)
                },
            )
        }
    }
}
