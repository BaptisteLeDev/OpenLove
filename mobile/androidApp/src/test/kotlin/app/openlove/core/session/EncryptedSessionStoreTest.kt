package app.openlove.core.session

import app.openlove.core.api.Session
import com.google.crypto.tink.Aead
import com.google.crypto.tink.KeyTemplates
import com.google.crypto.tink.KeysetHandle
import com.google.crypto.tink.RegistryConfiguration
import com.google.crypto.tink.aead.AeadConfig
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import java.io.File

class EncryptedSessionStoreTest {
    @get:Rule
    val tmp = TemporaryFolder()

    private val value =
        StoredSession("https://love.example.org", Session("access-secret-1", "refresh-secret-2", 1_900_000_000L))
    private lateinit var file: File
    private val aead = newAead()

    @Before
    fun setUp() {
        file = File(tmp.root, "session.enc")
    }

    private fun scope(job: Job = SupervisorJob()) = CoroutineScope(job)

    @Test
    fun emptyFileReadsNull() =
        runBlocking {
            val job = SupervisorJob()
            assertNull(EncryptedSessionStore(file, aead, scope(job)).read())
            job.cancel()
        }

    @Test
    fun writeThenNewInstanceReads() =
        runBlocking {
            val first = SupervisorJob()
            EncryptedSessionStore(file, aead, scope(first)).write(value)
            first.cancel()
            val second = SupervisorJob()
            assertEquals(value, EncryptedSessionStore(file, aead, scope(second)).read())
            second.cancel()
        }

    @Test
    fun fileHoldsNoPlaintext() =
        runBlocking {
            val job = SupervisorJob()
            EncryptedSessionStore(file, aead, scope(job)).write(value)
            job.cancel()
            val text = String(file.readBytes(), Charsets.ISO_8859_1)
            listOf("access-secret-1", "refresh-secret-2", "love.example.org").forEach {
                assertFalse(it, text.contains(it))
            }
        }

    @Test
    fun wrongKeyReadsNull() =
        runBlocking {
            val first = SupervisorJob()
            EncryptedSessionStore(file, aead, scope(first)).write(value)
            first.cancel()
            val second = SupervisorJob()
            assertNull(EncryptedSessionStore(file, newAead(), scope(second)).read())
            second.cancel()
        }

    @Test
    fun garbageFileReadsNull() =
        runBlocking {
            file.writeText("{")
            val job = SupervisorJob()
            assertNull(EncryptedSessionStore(file, aead, scope(job)).read())
            job.cancel()
        }

    @Test
    fun writeNullClears() =
        runBlocking {
            val job = SupervisorJob()
            val store = EncryptedSessionStore(file, aead, scope(job))
            store.write(value)
            store.write(null)
            assertNull(store.read())
            job.cancel()
        }

    private fun newAead(): Aead {
        AeadConfig.register()
        return KeysetHandle
            .generateNew(KeyTemplates.get("AES256_GCM"))
            .getPrimitive(RegistryConfiguration.get(), Aead::class.java)
    }
}
