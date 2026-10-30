import org.gradle.api.DefaultTask
import org.gradle.api.file.DirectoryProperty
import org.gradle.api.tasks.InputDirectory
import org.gradle.api.tasks.OutputDirectory
import org.gradle.api.tasks.TaskAction

plugins {
    alias(libs.plugins.kotlin.multiplatform)
    alias(libs.plugins.android.kotlin.multiplatform.library)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.sqldelight)
    alias(libs.plugins.ktlint)
}

kotlin {
    jvmToolchain(21)

    android {
        namespace = "app.openlove.shared"
        compileSdk = 37
        minSdk = 26
        withHostTest {}
    }

    iosArm64()
    iosSimulatorArm64()

    sourceSets {
        commonMain.dependencies {
            api(libs.ktor.client.core)
            implementation(libs.ktor.client.content.negotiation)
            implementation(libs.ktor.serialization.kotlinx.json)
            api(libs.serialization.json)
        }
        androidMain.dependencies {
            implementation(libs.ktor.client.okhttp)
        }
        iosMain.dependencies {
            implementation(libs.ktor.client.darwin)
        }
        commonTest.dependencies {
            implementation(kotlin("test"))
        }
    }
}

sqldelight {
    databases {
        create("OpenLoveDatabase") {
            packageName.set("app.openlove.db")
        }
    }
}

abstract class GenerateContractFixtures : DefaultTask() {
    @get:InputDirectory
    abstract val contracts: DirectoryProperty

    @get:OutputDirectory
    abstract val outputDir: DirectoryProperty

    @TaskAction
    fun generate() {
        val entries =
            contracts
                .get()
                .asFile
                .listFiles { f -> f.extension == "json" }
                .orEmpty()
                .sortedBy { it.name }
                .joinToString("") { "        \"${it.name}\" to \"\"\"${it.readText().replace("$", "\${'$'}")}\"\"\",\n" }
        outputDir.get().file("app/openlove/ContractFixtures.kt").asFile.apply {
            parentFile.mkdirs()
            val header = "package app.openlove\n\n// generated from contracts/*.json, do not edit\n"
            writeText(header + "val contractFixtures =\n    mapOf(\n$entries    )\n")
        }
    }
}

val generateContractFixtures =
    tasks.register<GenerateContractFixtures>("generateContractFixtures") {
        contracts.set(rootProject.layout.projectDirectory.dir("../contracts"))
        outputDir.set(layout.buildDirectory.dir("generated/contracts"))
    }

kotlin.sourceSets.commonTest {
    kotlin.srcDir(generateContractFixtures.flatMap { it.outputDir })
}

// AGP lint tasks read commonTest sources without declaring the generator as a dependency
tasks.matching { it.name.contains("lint", ignoreCase = true) }.configureEach {
    dependsOn(generateContractFixtures)
}
