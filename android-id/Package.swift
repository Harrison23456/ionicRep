// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "AndroidId",
    platforms: [.iOS(.v13)],
    products: [
        .library(
            name: "AndroidId",
            targets: ["AndroidIdPluginPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", branch: "main")
    ],
    targets: [
        .target(
            name: "AndroidIdPluginPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/AndroidIdPluginPlugin"),
        .testTarget(
            name: "AndroidIdPluginPluginTests",
            dependencies: ["AndroidIdPluginPlugin"],
            path: "ios/Tests/AndroidIdPluginPluginTests")
    ]
)