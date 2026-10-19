plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.ktlint)
}

kotlin {
    jvmToolchain(21)
}

android {
    namespace = "app.openlove"
    compileSdk = 37

    defaultConfig {
        applicationId = "app.openlove"
        minSdk = 26
        targetSdk = 37
        versionCode = 1
        versionName = "0.1.0"
    }

    buildFeatures {
        compose = true
    }

    testOptions {
        unitTests.all {
            val contracts = rootProject.file("../contracts")
            it.inputs.dir(contracts)
            it.systemProperty("contracts.dir", contracts.absolutePath)
        }
    }
}

dependencies {
    implementation(platform(libs.compose.bom))
    implementation(libs.compose.material3)
    implementation(libs.compose.ui)
    implementation(libs.activity.compose)
    implementation(libs.ktor.client.core)
    implementation(libs.ktor.client.okhttp)
    implementation(libs.serialization.json)

    testImplementation(libs.junit)
}
