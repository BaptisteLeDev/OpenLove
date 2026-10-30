package app.openlove

import app.openlove.core.api.HealthResponse
import app.openlove.core.api.MessagesResponse
import app.openlove.core.api.ThemeResponse
import kotlinx.serialization.KSerializer
import kotlinx.serialization.SerializationException
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertThrows
import org.junit.Test
import java.io.File

class ContractTest {
    private val json = Json { ignoreUnknownKeys = false }

    private val serializers: Map<String, KSerializer<*>> =
        mapOf(
            "health.json" to HealthResponse.serializer(),
            "messages.json" to MessagesResponse.serializer(),
            "theme.json" to ThemeResponse.serializer(),
        )

    private val fixtures =
        File(System.getProperty("contracts.dir"))
            .listFiles { f -> f.extension == "json" }
            .orEmpty()
            .sortedBy { it.name }

    @Test
    fun everyFixtureHasASerializer() {
        assertFalse("no fixtures found", fixtures.isEmpty())
        assertEquals(fixtures.map { it.name }.toSet(), serializers.keys)
    }

    @Test
    fun validDecodeAndInvalidThrow() {
        for (file in fixtures) {
            val serializer = serializers.getValue(file.name)
            val root = json.parseToJsonElement(file.readText()).jsonObject
            val valid = root.getValue("valid").jsonArray
            val invalid = root.getValue("invalid").jsonArray
            assertFalse("${file.name}: no valid example", valid.isEmpty())
            assertFalse("${file.name}: no invalid example", invalid.isEmpty())
            for (entry in valid) {
                json.decodeFromJsonElement(serializer, entry)
            }
            for (entry in invalid) {
                assertThrows("${file.name}: $entry", SerializationException::class.java) {
                    json.decodeFromJsonElement(serializer, entry)
                }
            }
        }
    }
}
