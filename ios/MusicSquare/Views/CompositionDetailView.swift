import SwiftUI

struct CompositionDetailView: View {
    let composition: Composition
    @EnvironmentObject var compositionsVM: CompositionsViewModel
    @EnvironmentObject var authVM: AuthViewModel
    @State private var showComments = false
    @State private var commentText = ""
    @State private var isPlaying = false
    @State private var synth = AudioSynth()

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Cover area
                coverSection

                // Track list
                trackSection

                // Description
                if let desc = composition.description, !desc.isEmpty {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("作品简介")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                        Text(desc)
                            .font(.body)
                    }
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color(.systemBackground))
                    .padding(.top, 12)
                }

                // Comments preview
                commentsPreviewSection
            }
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle(composition.title)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    Task { await compositionsVM.toggleLike(compId: composition.id) }
                } label: {
                    Image(systemName: composition.is_liked == true ? "heart.fill" : "heart")
                        .foregroundColor(composition.is_liked == true ? .red : .primary)
                }
            }
        }
        .sheet(isPresented: $showComments) {
            CommentsSheet(composition: composition)
                .environmentObject(compositionsVM)
        }
        .task {
            await compositionsVM.fetchComposition(id: composition.id)
        }
    }

    // MARK: - Cover

    var coverSection: some View {
        ZStack {
            Color(hex: composition.cover_color ?? "#6C5CE7")

            VStack(spacing: 16) {
                Image(systemName: "music.note.list")
                    .font(.system(size: 52))
                    .foregroundColor(.white.opacity(0.6))

                Text(composition.title)
                    .font(.title.bold())
                    .foregroundColor(.white)

                HStack(spacing: 8) {
                    Label(composition.username ?? "匿名", systemImage: "person.circle.fill")
                    Text("·")
                    Label("BPM \(composition.bpm)", systemImage: "metronome")
                }
                .font(.subheadline)
                .foregroundColor(.white.opacity(0.85))

                // Stats
                HStack(spacing: 24) {
                    StatBadge(icon: "play.fill", value: composition.displayPlays)
                    StatBadge(icon: "heart.fill", value: "\(composition.like_count ?? 0)")
                    StatBadge(icon: "bubble.right.fill", value: "\(composition.comment_count ?? 0)")
                }

                // Play button
                Button {
                    if isPlaying {
                        synth.stop()
                        isPlaying = false
                    } else {
                        guard let comp = compositionsVM.currentComposition ?? composition as Composition? else { return }
                        let allNotes = comp.tracks.flatMap { $0.notes }
                        guard !allNotes.isEmpty else { return }
                        isPlaying = true
                        synth.play(notes: allNotes, bpm: Double(comp.bpm)) {
                            isPlaying = false
                        }
                    }
                } label: {
                    HStack {
                        Image(systemName: isPlaying ? "stop.fill" : "play.fill")
                            .font(.title2)
                        Text(isPlaying ? "停止" : "播放")
                            .fontWeight(.semibold)
                    }
                    .padding(.horizontal, 32)
                    .padding(.vertical, 12)
                    .background(.white)
                    .foregroundColor(Color(hex: composition.cover_color ?? "#6C5CE7"))
                    .clipShape(Capsule())
                }
                .padding(.top, 4)
            }
            .padding(.vertical, 40)
        }
    }

    // MARK: - Tracks

    var trackSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("音轨列表")
                .font(.headline)
                .padding(.horizontal)
                .padding(.top, 16)

            ForEach(composition.tracks) { track in
                HStack {
                    Image(systemName: instrumentIcon(track.instrument))
                        .frame(width: 24)
                        .foregroundColor(.purple)
                    VStack(alignment: .leading) {
                        Text(track.instrument.capitalized)
                            .font(.subheadline.weight(.medium))
                        Text("\(track.notes.count) 个音符")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    Spacer()
                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding()
                .background(Color(.systemBackground))
                .clipShape(RoundedRectangle(cornerRadius: 10))
                .padding(.horizontal)
            }
        }
    }

    // MARK: - Comments Preview

    var commentsPreviewSection: some View {
        VStack(spacing: 0) {
            Button {
                showComments = true
            } label: {
                HStack {
                    Label("评论 (\(composition.comment_count ?? 0))", systemImage: "bubble.right")
                        .font(.headline)
                    Spacer()
                    Image(systemName: "chevron.right")
                        .foregroundColor(.secondary)
                }
                .padding()
                .background(Color(.systemBackground))
            }
            .buttonStyle(.plain)
            .padding(.top, 12)

            // Quick comment input
            HStack(spacing: 10) {
                Circle()
                    .fill(Color.purple.opacity(0.2))
                    .frame(width: 32, height: 32)
                    .overlay(
                        Text(authVM.currentUser?.username.prefix(1).uppercased() ?? "?")
                            .font(.caption.bold())
                            .foregroundColor(.purple)
                    )

                TextField("说点什么...", text: $commentText)
                    .font(.subheadline)

                Button {
                    guard !commentText.isEmpty else { return }
                    Task {
                        await compositionsVM.addComment(compId: composition.id, content: commentText)
                        commentText = ""
                    }
                } label: {
                    Text("发送")
                        .font(.subheadline.weight(.semibold))
                        .foregroundColor(commentText.isEmpty ? .secondary : .purple)
                }
                .disabled(commentText.isEmpty)
            }
            .padding()
            .background(Color(.systemBackground))
        }
    }

    func instrumentIcon(_ inst: String) -> String {
        switch inst {
        case "piano": return "pianokeys"
        case "guitar": return "guitars"
        case "bass": return "guitars.fill"
        case "drums": return "drum.fill"
        case "synth": return "waveform"
        default: return "music.note"
        }
    }
}

// MARK: - Stat Badge

struct StatBadge: View {
    let icon: String
    let value: String

    var body: some View {
        Label(value, systemImage: icon)
            .font(.caption)
            .foregroundColor(.white.opacity(0.85))
    }
}

// MARK: - Comments Sheet

struct CommentsSheet: View {
    let composition: Composition
    @EnvironmentObject var compositionsVM: CompositionsViewModel
    @State private var newComment = ""
    @State private var replyTo: Comment? = nil

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                if compositionsVM.comments.isEmpty {
                    VStack(spacing: 12) {
                        Image(systemName: "bubble.left.and.bubble.right")
                            .font(.system(size: 40))
                            .foregroundColor(.secondary)
                        Text("还没有评论")
                            .foregroundColor(.secondary)
                        Text("来抢沙发吧 🎵")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .frame(maxHeight: .infinity)
                } else {
                    List {
                        ForEach(compositionsVM.comments) { comment in
                            CommentRow(comment: comment, onReply: {
                                replyTo = comment
                            })
                            .environmentObject(compositionsVM)

                            if let replies = comment.replies {
                                ForEach(replies) { reply in
                                    CommentRow(comment: reply, isReply: true, onReply: {
                                        replyTo = comment
                                    })
                                    .environmentObject(compositionsVM)
                                    .padding(.leading, 32)
                                }
                            }
                        }
                    }
                    .listStyle(.plain)
                }

                // Input bar
                if let reply = replyTo {
                    HStack {
                        Text("回复 @\(reply.username ?? "用户")")
                            .font(.caption)
                            .foregroundColor(.purple)
                        Spacer()
                        Button("取消") {
                            replyTo = nil
                        }
                        .font(.caption)
                    }
                    .padding(.horizontal)
                    .padding(.top, 6)
                }

                HStack(spacing: 10) {
                    TextField("添加评论...", text: $newComment)
                        .padding(10)
                        .background(Color(.systemGray6))
                        .cornerRadius(20)

                    Button {
                        guard !newComment.isEmpty else { return }
                        Task {
                            await compositionsVM.addComment(
                                compId: composition.id,
                                content: newComment,
                                parentId: replyTo?.id
                            )
                            newComment = ""
                            replyTo = nil
                        }
                    } label: {
                        Image(systemName: "arrow.up.circle.fill")
                            .font(.title2)
                            .foregroundColor(newComment.isEmpty ? .gray : .purple)
                    }
                    .disabled(newComment.isEmpty)
                }
                .padding()
                .background(.bar)
            }
            .navigationTitle("评论")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("关闭") {
                        // dismiss handled by sheet
                    }
                }
            }
        }
        .task {
            await compositionsVM.fetchComments(compId: composition.id)
        }
    }
}

// MARK: - Comment Row

struct CommentRow: View {
    let comment: Comment
    var isReply: Bool = false
    var onReply: () -> Void = {}
    @EnvironmentObject var compositionsVM: CompositionsViewModel

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            Circle()
                .fill(Color.purple.opacity(0.2))
                .frame(width: 32, height: 32)
                .overlay(
                    Text(comment.username?.prefix(1).uppercased() ?? "?")
                        .font(.caption.bold())
                        .foregroundColor(.purple)
                )

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(comment.username ?? "匿名")
                        .font(.subheadline.weight(.semibold))
                    if let ts = comment.timestamp_secs, ts >= 0 {
                        Text("· \(formatTime(ts))")
                            .font(.caption2)
                            .foregroundColor(.purple)
                    }
                    if let created = comment.created_at {
                        Text("· \(timeAgo(created))")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }

                Text(comment.content)
                    .font(.subheadline)

                Button("回复") {
                    onReply()
                }
                .font(.caption)
                .foregroundColor(.purple)
            }
        }
        .padding(.vertical, 4)
    }

    func formatTime(_ secs: Double) -> String {
        let m = Int(secs) / 60
        let s = Int(secs) % 60
        return String(format: "%d:%02d", m, s)
    }

    func timeAgo(_ dateStr: String) -> String {
        // Simple relative time
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        guard let date = formatter.date(from: dateStr) ?? formatter.date(from: dateStr.replacingOccurrences(of: " ", with: "T")) else {
            // Fallback: try SQLite format
            let f = DateFormatter()
            f.dateFormat = "yyyy-MM-dd HH:mm:ss"
            guard let d = f.date(from: dateStr) else { return dateStr }
            let interval = Date().timeIntervalSince(d)
            if interval < 60 { return "刚刚" }
            if interval < 3600 { return "\(Int(interval / 60))分钟前" }
            if interval < 86400 { return "\(Int(interval / 3600))小时前" }
            return "\(Int(interval / 86400))天前"
        }
        let interval = Date().timeIntervalSince(date)
        if interval < 60 { return "刚刚" }
        if interval < 3600 { return "\(Int(interval / 60))分钟前" }
        if interval < 86400 { return "\(Int(interval / 3600))小时前" }
        return "\(Int(interval / 86400))天前"
    }
}

#Preview {
    NavigationStack {
        CompositionDetailView(composition: Composition(
            id: "1", user_id: "u1", title: "测试作品", bpm: 120, tracks: [],
            username: "音乐人", play_count: 120, like_count: 34, comment_count: 8
        ))
        .environmentObject(CompositionsViewModel())
        .environmentObject(AuthViewModel())
    }
}
