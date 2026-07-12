import SwiftUI

struct MainTabView: View {
    var body: some View {
        TabView {
            SquareView()
                .tabItem {
                    Image(systemName: "music.note.house.fill")
                    Text("广场")
                }

            ComposerView()
                .tabItem {
                    Image(systemName: "plus.circle.fill")
                    Text("作曲")
                }

            ProfileView()
                .tabItem {
                    Image(systemName: "person.circle.fill")
                    Text("我的")
                }
        }
        .tint(.purple)
    }
}
