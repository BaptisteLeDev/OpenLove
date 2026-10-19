plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.ktlint)
}

kotlin {
    jvmToolchain(21)
}

abstract class CopyTokens : DefaultTask() {
    @get:InputFile
    abstract val tokens: RegularFileProperty

    @get:OutputDirectory
    abstract val outputDir: DirectoryProperty

    @TaskAction
    fun copy() {
        tokens.get().asFile.copyTo(outputDir.file("tokens.json").get().asFile, overwrite = true)
    }
}

val copyTokens =
    tasks.register<CopyTokens>("copyTokens") {
        tokens.set(rootProject.file("../design/tokens.json"))
    }

androidComponents {
    onVariants { variant ->
        variant.sources.assets?.addGeneratedSourceDirectory(copyTokens, CopyTokens::outputDir)
    }
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
            val tokens = rootProject.file("../design/tokens.json")
            it.inputs.file(tokens)
            it.systemProperty("tokens.file", tokens.absolutePath)
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
