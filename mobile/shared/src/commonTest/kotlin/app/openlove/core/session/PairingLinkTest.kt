package app.openlove.core.session

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

class PairingLinkTest {
    @Test
    fun parsesValidLink() {
        assertEquals(
            PairingLink("https://a.b", "abc_-123"),
            PairingLink.parse("openlove://pair?instance=https%3A%2F%2Fa.b%2F&code=abc_-123"),
        )
    }

    @Test
    fun rejectsInvalidLinks() {
        listOf(
            "https://a.b/pair?instance=https%3A%2F%2Fa.b&code=x",
            "openlove://other?instance=https%3A%2F%2Fa.b&code=x",
            "openlove://pair?instance=https%3A%2F%2Fa.b",
            "openlove://pair?instance=ftp%3A%2F%2Fa.b&code=x",
            "openlove://pair?instance=https%3A%2F%2Fa.b&code=%zz",
            "openlove://pair?instance=https%3A%2F%2Fexa%20mple.com&code=x",
            "openlove://pair?instance=https%3A%2F%2Fhost%3Aabc&code=x",
            "garbage",
        ).forEach { assertNull(PairingLink.parse(it), it) }
    }

    @Test
    fun normalizesInstanceUrl() {
        assertEquals("https://a.b", PairingLink.instanceUrl(" https://a.b/ "))
        assertNull(PairingLink.instanceUrl("a.b"))
        assertNull(PairingLink.instanceUrl("https://exa mple.com"))
        assertNull(PairingLink.instanceUrl("https://host:abc"))
        assertEquals("https://a.b:8080", PairingLink.instanceUrl("https://a.b:8080/"))
    }
}
