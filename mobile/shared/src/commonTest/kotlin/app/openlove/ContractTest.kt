package app.openlove

import app.openlove.core.api.HealthResponse
import app.openlove.core.api.ThemeResponse
import kotlinx.serialization.KSerializer
import kotlinx.serialization.SerializationException
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue

class ContractTest {
    private val json = Json { ignoreUnknownKeys = false }

    private val serializers: Map<String, KSerializer<*>> =
        mapOf(
            "health.json" to HealthResponse.serializer(),
            "theme.json" to ThemeResponse.serializer(),
        )

    private val fixtures = contractFixtures

    @Test
    fun everyFixtureHasASerializer() {
        assertTrue(fixtures.isNotEmpty(), "no fixtures found")
        assertEquals(fixtures.keys, serializers.keys)
    }

    @Test
    fun validDecodeAndInvalidThrow() {
        for ((name, text) in fixtures) {
            val serializer = serializers.getValue(name)
            val root = json.parseToJsonElement(text).jsonObject
            val valid = root.getValue("valid").jsonArray
            val invalid = root.getValue("invalid").jsonArray
            assertTrue(valid.isNotEmpty(), "$name: no valid example")
            assertTrue(invalid.isNotEmpty(), "$name: no invalid example")
            for (entry in valid) {
                json.decodeFromJsonElement(serializer, entry)
            }
            for (entry in invalid) {
                assertFailsWith<SerializationException>("$name: $entry") {
                    json.decodeFromJsonElement(serializer, entry)
                }
            }
        }
    }
}
