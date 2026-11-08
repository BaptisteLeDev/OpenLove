package app.openlove.pairing

import androidx.annotation.StringRes
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import app.openlove.PairingError
import app.openlove.R
import app.openlove.Screen

@StringRes
fun PairingError.text(): Int =
    when (this) {
        PairingError.CodeExpired -> R.string.error_code_expired
        PairingError.BadCredentials -> R.string.error_bad_credentials
        PairingError.NotMember -> R.string.error_not_member
        PairingError.RateLimited -> R.string.error_rate_limited
        PairingError.InvalidLink -> R.string.error_invalid_link
        PairingError.Unreachable -> R.string.error_unreachable
    }

@Composable
fun PairingScreen(
    state: Screen.Pairing,
    onScan: () -> Unit,
    onSignIn: (String, String, String) -> Unit,
) {
    var manual by rememberSaveable { mutableStateOf(false) }
    var url by rememberSaveable { mutableStateOf("") }
    var email by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text(stringResource(R.string.pairing_title), style = MaterialTheme.typography.headlineSmall)
        state.error?.let {
            Text(stringResource(it.text()), color = MaterialTheme.colorScheme.error)
        }
        Button(onClick = onScan, modifier = Modifier.fillMaxWidth()) {
            Text(stringResource(R.string.pairing_scan))
        }
        Text(stringResource(R.string.pairing_scan_hint), style = MaterialTheme.typography.bodyMedium)
        TextButton(onClick = { manual = !manual }) {
            Text(stringResource(R.string.pairing_manual))
        }
        if (manual) {
            OutlinedTextField(
                value = url,
                onValueChange = { url = it },
                label = { Text(stringResource(R.string.pairing_instance_url)) },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Uri),
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text(stringResource(R.string.pairing_email)) },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text(stringResource(R.string.pairing_password)) },
                singleLine = true,
                visualTransformation = PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                modifier = Modifier.fillMaxWidth(),
            )
            Button(onClick = { onSignIn(url, email, password) }, modifier = Modifier.fillMaxWidth()) {
                Text(stringResource(R.string.pairing_submit))
            }
        }
    }
}
