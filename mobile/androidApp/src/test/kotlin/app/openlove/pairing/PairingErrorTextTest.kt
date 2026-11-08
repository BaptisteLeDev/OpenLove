package app.openlove.pairing

import app.openlove.PairingError
import app.openlove.R
import org.junit.Assert.assertEquals
import org.junit.Test

class PairingErrorTextTest {
    @Test
    fun everyErrorHasItsOwnText() {
        val ids = PairingError.entries.map { it.text() }
        assertEquals(ids.size, ids.toSet().size)
    }

    @Test
    fun codeExpiredText() {
        assertEquals(R.string.error_code_expired, PairingError.CodeExpired.text())
    }
}
