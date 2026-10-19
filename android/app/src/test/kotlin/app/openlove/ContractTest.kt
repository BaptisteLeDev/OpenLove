package app.openlove

import app.openlove.core.api.HealthResponse
import kotlinx.serialization.KSerializer
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
            for (entry in root.getValue("valid").jsonArray) {
                json.decodeFromJsonElement(serializer, entry)
            }
            for (entry in root.getValue("invalid").jsonArray) {
                assertThrows("${file.name}: $entry", Exception::class.java) {
                    json.decodeFromJsonElement(serializer, entry)
                }
            }
        }
    }
}
