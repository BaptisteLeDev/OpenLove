package app.openlove.core.session

import android.content.Context
import androidx.datastore.core.CorruptionException
import androidx.datastore.core.DataStoreFactory
import androidx.datastore.core.Serializer
import androidx.datastore.core.handlers.ReplaceFileCorruptionHandler
import app.openlove.core.api.ApiJson
import com.google.crypto.tink.Aead
import com.google.crypto.tink.KeyTemplates
import com.google.crypto.tink.RegistryConfiguration
import com.google.crypto.tink.aead.AeadConfig
import com.google.crypto.tink.integration.android.AndroidKeysetManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.first
import kotlinx.serialization.encodeToString
import java.io.File
import java.io.IOException
import java.io.InputStream
import java.io.OutputStream
import java.security.GeneralSecurityException

private val ASSOCIATED_DATA = "openlove-session".encodeToByteArray()

private class AeadSerializer(
    private val aead: Aead,
) : Serializer<StoredSession?> {
    override val defaultValue: StoredSession? = null

    override suspend fun readFrom(input: InputStream): StoredSession? {
        val bytes = input.readBytes()
        if (bytes.isEmpty()) return null
        return try {
            ApiJson.decodeFromString<StoredSession>(aead.decrypt(bytes, ASSOCIATED_DATA).decodeToString())
        } catch (e: Exception) {
            throw CorruptionException("unreadable session", e)
        }
    }

    override suspend fun writeTo(
        t: StoredSession?,
        output: OutputStream,
    ) {
        if (t != null) output.write(aead.encrypt(ApiJson.encodeToString(t).encodeToByteArray(), ASSOCIATED_DATA))
    }
}

class EncryptedSessionStore(
    file: File,
    aead: Aead,
    scope: CoroutineScope = CoroutineScope(Dispatchers.IO + SupervisorJob()),
) : SessionStore {
    private val store =
        DataStoreFactory.create(
            serializer = AeadSerializer(aead),
            corruptionHandler = ReplaceFileCorruptionHandler { null },
            scope = scope,
        ) { file }

    override suspend fun read(): StoredSession? = store.data.first()

    override suspend fun write(value: StoredSession?) {
        store.updateData { value }
    }
}

private const val KEYSET_PREFS = "openlove_keystore_prefs"

fun keystoreAead(context: Context): Aead {
    AeadConfig.register()
    return try {
        buildAead(context)
    } catch (e: GeneralSecurityException) {
        resetAndBuild(context)
    } catch (e: IOException) {
        resetAndBuild(context)
    }
}

// Keystore master key lost (restore, reset): old keyset and session are unreadable.
private fun resetAndBuild(context: Context): Aead {
    context
        .getSharedPreferences(KEYSET_PREFS, Context.MODE_PRIVATE)
        .edit()
        .clear()
        .commit()
    File(context.filesDir, "session.enc").delete()
    return buildAead(context)
}

private fun buildAead(context: Context): Aead =
    AndroidKeysetManager
        .Builder()
        .withSharedPref(context, "openlove_session_keyset", KEYSET_PREFS)
        .withKeyTemplate(KeyTemplates.get("AES256_GCM"))
        .withMasterKeyUri("android-keystore://openlove_session_key")
        .build()
        .keysetHandle
        .getPrimitive(RegistryConfiguration.get(), Aead::class.java)
