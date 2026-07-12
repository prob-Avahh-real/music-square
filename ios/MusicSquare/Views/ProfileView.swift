import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authVM: AuthViewModel
    @EnvironmentObject var compositionsVM: CompositionsViewModel
    @State private var showEditProfile = false
    @State private var editBio = ""
    @State private var editUsername = ""
    @State private var selectedTab = "works"

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 0) {
                    // Profile header
                    VStack(spacing: 12) {
                        Circle()
                            .fill(
                                LinearGradient(colors: [.purple, .pink], startPoint: .topLeading, endPoint: .bottomTrailing)
                            )
                            .frame(width: 80, height: 80)
                            .overlay(
                                Text(authVM.currentUser?.username.prefix(2).uppercased() ?? "?")
                                    .font(.title.bold())
                                    .foregroundColor(.white)
                            )

                        Text(authVM.currentUser?.username ?? "用户")
                            .font(.title2.bold())

                        if let bio = authVM.currentUser?.bio, !bio.isEmpty {
                            Text(bio)
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal)
                        }

                        // Stats
                        HStack(spacing: 32) {
                            VStack(spacing: 2) {
                                Text("\(authVM.currentUser?.composition_count ?? 0)")
                                    .font(.headline)
                                Text("作品")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            VStack(spacing: 2) {
                                Text("\(authVM.currentUser?.follower_count ?? 0)")
                                    .font(.headline)
                                Text("粉丝")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            VStack(spacing: 2) {
                                Text("\(authVM.currentUser?.following_count ?? 0)")
                                    .font(.headline)
                                Text("关注")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                        .padding(.top, 8)

                        // Edit button
                        Button {
                            editBio = authVM.currentUser?.bio ?? ""
                            editUsername = authVM.currentUser?.username ?? ""
                            showEditProfile = true
                        } label: {
                            Text("编辑资料")
                                .font(.subheadline.weight(.medium))
                                .padding(.horizontal, 24)
                                .padding(.vertical, 8)
                                .background(Color.purple.opacity(0.1))
                                .foregroundColor(.purple)
                                .clipShape(Capsule())
                        }
                    }
                    .padding(.vertical, 28)
                    .frame(maxWidth: .infinity)
                    .background(Color(.systemBackground))

                    // Tab picker
                    HStack(spacing: 0) {
                        ForEach(["works", "likes"], id: \.self) { tab in
                            Button(tab == "works" ? "我的作品" : "我赞过的") {
                                withAnimation { selectedTab = tab }
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .foregroundColor(selectedTab == tab ? .purple : .secondary)
                            .overlay(
                                Rectangle()
                                    .frame(height: 2)
                                    .foregroundColor(selectedTab == tab ? .purple : .clear)
                                    .offset(y: 14),
                                alignment: .bottom
                            )
                        }
                    }
                    .background(Color(.systemBackground))

                    // Works grid
                    LazyVStack(spacing: 12) {
                        if compositionsVM.isLoading {
                            ProgressView().padding(40)
                        } else if compositionsVM.compositions.isEmpty {
                            VStack(spacing: 12) {
                                Image(systemName: "music.note.list")
                                    .font(.system(size: 40))
                                    .foregroundColor(.secondary)
                                    .padding(.top, 40)
                                Text("还没有作品")
                                    .foregroundColor(.secondary)
                                Text("去广场创作你的第一首曲子吧 🎹")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        } else {
                            ForEach(compositionsVM.compositions) { comp in
                                NavigationLink(destination: CompositionDetailView(composition: comp)) {
                                    CompositionCard(composition: comp)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                    .padding()
                }
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("我的")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("退出") {
                        authVM.logout()
                    }
                    .font(.subheadline)
                }
            }
            .sheet(isPresented: $showEditProfile) {
                NavigationStack {
                    Form {
                        Section("个人信息") {
                            TextField("用户名", text: $editUsername)
                            TextField("简介", text: $editBio, axis: .vertical)
                                .lineLimit(3)
                        }
                    }
                    .navigationTitle("编辑资料")
                    .navigationBarTitleDisplayMode(.inline)
                    .toolbar {
                        ToolbarItem(placement: .cancellationAction) {
                            Button("取消") { showEditProfile = false }
                        }
                        ToolbarItem(placement: .confirmationAction) {
                            Button("保存") {
                                Task {
                                    await authVM.updateProfile(bio: editBio, username: editUsername)
                                    showEditProfile = false
                                }
                            }
                        }
                    }
                }
                .presentationDetents([.medium])
            }
        }
        .task {
            if let userId = authVM.currentUser?.id {
                await compositionsVM.fetchUserCompositions(userId: userId)
            }
        }
    }
}

#Preview {
    ProfileView()
        .environmentObject(AuthViewModel())
        .environmentObject(CompositionsViewModel())
}
