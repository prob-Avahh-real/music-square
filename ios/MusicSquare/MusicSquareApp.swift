import SwiftUI

@main
struct MusicSquareApp: App {
    @StateObject private var authVM = AuthViewModel()
    @StateObject private var compositionsVM = CompositionsViewModel()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authVM)
                .environmentObject(compositionsVM)
        }
    }
}
