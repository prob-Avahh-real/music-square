import SwiftUI

struct SquareView: View {
    @EnvironmentObject var compositionsVM: CompositionsViewModel
    @EnvironmentObject var authVM: AuthViewModel
    @State private var selectedSort = "latest"
    @State private var searchText = ""

    let sortOptions = ["latest", "popular", "likes"]
    let sortLabels = ["最新", "热门", "最多赞"]

    var body: some View {
        NavigationStack {
            ZStack {
                Color(.systemGroupedBackground).ignoresSafeArea()

                VStack(spacing: 0) {
                    // Sort picker
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 10) {
                            ForEach(Array(zip(sortOptions, sortLabels)), id: \.0) { opt, label in
                                Button(label) {
                                    withAnimation { selectedSort = opt }
                                    Task { await compositionsVM.fetchFeed(refresh: true) }
                                }
                                .padding(.horizontal, 16)
                                .padding(.vertical, 8)
                                .background(selectedSort == opt ? Color.purple : Color(.systemGray5))
                                .foregroundColor(selectedSort == opt ? .white : .primary)
                                .clipShape(Capsule())
                            }
                        }
                        .padding(.horizontal)
                        .padding(.vertical, 8)
                    }

                    // Feed
                    ScrollView {
                        LazyVStack(spacing: 14) {
                            ForEach(compositionsVM.compositions) { comp in
                                NavigationLink(destination: CompositionDetailView(composition: comp)) {
                                    CompositionCard(composition: comp)
                                }
                                .buttonStyle(.plain)
                            }

                            if compositionsVM.hasMorePages {
                                ProgressView()
                                    .padding()
                                    .onAppear {
                                        Task { await compositionsVM.fetchFeed(page: compositionsVM.currentPage + 1) }
                                    }
                            }
                        }
                        .padding(.horizontal)
                        .padding(.bottom, 100)
                    }
                    .refreshable {
                        await compositionsVM.fetchFeed(refresh: true)
                    }
                }
            }
            .navigationTitle("🎵 音乐广场")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        Task { await compositionsVM.fetchFeed(refresh: true) }
                    } label: {
                        Image(systemName: "arrow.clockwise")
                    }
                }
            }
        }
        .task {
            if compositionsVM.compositions.isEmpty {
                await compositionsVM.fetchFeed(refresh: true)
            }
        }
    }
}

// MARK: - Composition Card

struct CompositionCard: View {
    let composition: Composition

    var body: some View {
        HStack(spacing: 14) {
            // Cover
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(hex: composition.cover_color ?? "#6C5CE7"))
                .frame(width: 62, height: 62)
                .overlay(
                    Image(systemName: "music.note.list")
                        .font(.title2)
                        .foregroundColor(.white.opacity(0.7))
                )

            // Info
            VStack(alignment: .leading, spacing: 5) {
                Text(composition.title)
                    .font(.headline)
                    .lineLimit(1)

                if let desc = composition.description, !desc.isEmpty {
                    Text(desc)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }

                HStack(spacing: 14) {
                    Label(composition.username ?? "匿名", systemImage: "person.circle")
                        .font(.caption2)
                        .foregroundColor(.secondary)

                    Label("\(composition.displayPlays)", systemImage: "play.circle")
                        .font(.caption2)
                        .foregroundColor(.secondary)

                    Label("\(composition.like_count ?? 0)", systemImage: "heart")
                        .font(.caption2)
                        .foregroundColor(composition.is_liked == true ? .red : .secondary)

                    Label("\(composition.comment_count ?? 0)", systemImage: "bubble.right")
                        .font(.caption2)
                        .foregroundColor(.secondary)

                    if composition.is_public == 0 {
                        Image(systemName: "lock.fill")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
            }

            Spacer()

            Image(systemName: "play.fill")
                .font(.title3)
                .foregroundColor(.purple)
                .padding(8)
                .background(Circle().fill(Color.purple.opacity(0.1)))
        }
        .padding(12)
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .shadow(color: .black.opacity(0.04), radius: 4, y: 2)
    }
}

// Color hex helper
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let r, g, b: Double
        switch hex.count {
        case 6:
            r = Double((int >> 16) & 0xFF) / 255
            g = Double((int >> 8) & 0xFF) / 255
            b = Double(int & 0xFF) / 255
        default:
            r = 0.42; g = 0.33; b = 0.91
        }
        self.init(red: r, green: g, blue: b)
    }
}

#Preview {
    SquareView()
        .environmentObject(CompositionsViewModel())
        .environmentObject(AuthViewModel())
}
