package app.openlove.core.api

import kotlinx.serialization.json.Json

// ADR 0008: prod tolerates unknown keys so old APKs survive new response fields.
val ApiJson = Json { ignoreUnknownKeys = true }
