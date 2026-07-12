import SwiftUI

class CompositionsViewModel: ObservableObject {
    @Published var compositions: [Composition] = []
    @Published var currentComposition: Composition?
    @Published var comments: [Comment] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var currentPage = 1
    @Published var hasMorePages = true

    private let api = APIClient.shared

    @MainActor
    func fetchFeed(page: Int = 1, refresh: Bool = false) async {
        if refresh { currentPage = 1; hasMorePages = true }
        isLoading = true
        do {
            let resp: [String: Any] = try await api.get("\(APIConfig.feed)?page=\(page)&limit=20")
            // Manual decode due to Codable constraints
            if let data = try? JSONSerialization.data(withJSONObject: resp),
               let decoded = try? JSONDecoder().decode(PaginatedFeed.self, from: data) {
                if refresh {
                    compositions = decoded.compositions
                } else {
                    compositions.append(contentsOf: decoded.compositions)
                }
                hasMorePages = decoded.pagination.page < decoded.pagination.totalPages
                currentPage = decoded.pagination.page
            }
        } catch {
            errorMessage = "加载失败"
        }
        isLoading = false
    }

    @MainActor
    func fetchComposition(id: String) async {
        isLoading = true
        do {
            let comp: Composition = try await api.get("\(APIConfig.compositions)/\(id)")
            currentComposition = comp
        } catch {
            errorMessage = "加载作品失败"
        }
        isLoading = false
    }

    @MainActor
    func fetchComments(compId: String) async {
        do {
            let cmts: [Comment] = try await api.get(APIConfig.compositionComments(compId))
            comments = cmts
        } catch {
            errorMessage = "加载评论失败"
        }
    }

    @MainActor
    func toggleLike(compId: String) async {
        do {
            let resp: [String: Bool] = try await api.post(APIConfig.compositionLike(compId), body: EmptyBody())
            if let idx = compositions.firstIndex(where: { $0.id == compId }) {
                compositions[idx].is_liked = resp["liked"]
                compositions[idx].like_count = (compositions[idx].like_count ?? 0) + (resp["liked"] == true ? 1 : -1)
            }
            if currentComposition?.id == compId {
                currentComposition?.is_liked = resp["liked"]
            }
        } catch {
            errorMessage = "操作失败"
        }
    }

    @MainActor
    func addComment(compId: String, content: String, timestamp: Double? = nil, parentId: String? = nil) async {
        do {
            let body: [String: Any] = ["content": content, "timestamp_secs": timestamp ?? -1, "parent_id": parentId as Any]
            let data = try JSONSerialization.data(withJSONObject: body)
            let (respData, _) = try await URLSession.shared.data(for: {
                var req = URLRequest(url: URL(string: APIConfig.compositionComments(compId))!)
                req.httpMethod = "POST"
                req.setValue("application/json", forHTTPHeaderField: "Content-Type")
                if let t = api.token { req.setValue("Bearer \(t)", forHTTPHeaderField: "Authorization") }
                req.httpBody = data
                return req
            }())
            if let comment = try? JSONDecoder().decode(Comment.self, from: respData) {
                comments.append(comment)
            }
        } catch {
            errorMessage = "评论失败"
        }
    }

    @MainActor
    func createComposition(title: String, description: String, bpm: Int, tracks: [TrackData], duration: Double, coverColor: String, isPublic: Bool = true) async -> Composition? {
        isLoading = true
        defer { isLoading = false }
        do {
            let body: [String: Any] = [
                "title": title,
                "description": description,
                "bpm": bpm,
                "tracks": tracks.map { track in
                    ["instrument": track.instrument, "notes": track.notes.map { n in
                        ["pitch": n.pitch, "start": n.start, "duration": n.duration]
                    }]
                },
                "duration_secs": duration,
                "cover_color": coverColor,
                "is_public": isPublic
            ]
            let data = try JSONSerialization.data(withJSONObject: body)
            let (respData, _) = try await URLSession.shared.data(for: {
                var req = URLRequest(url: URL(string: APIConfig.compositions)!)
                req.httpMethod = "POST"
                req.setValue("application/json", forHTTPHeaderField: "Content-Type")
                if let t = api.token { req.setValue("Bearer \(t)", forHTTPHeaderField: "Authorization") }
                req.httpBody = data
                return req
            }())
            let comp = try JSONDecoder().decode(Composition.self, from: respData)
            compositions.insert(comp, at: 0)
            return comp
        } catch {
            errorMessage = "发布失败"
            return nil
        }
    }

    @MainActor
    func fetchUserCompositions(userId: String) async {
        isLoading = true
        do {
            let resp: [String: Any] = try await api.get("\(APIConfig.compositions)?userId=\(userId)&limit=50")
            if let data = try? JSONSerialization.data(withJSONObject: resp),
               let decoded = try? JSONDecoder().decode(PaginatedFeed.self, from: data) {
                compositions = decoded.compositions
            }
        } catch {
            errorMessage = "加载失败"
        }
        isLoading = false
    }
}

// Helpers
struct EmptyBody: Codable {}

struct PaginatedFeed: Codable {
    let compositions: [Composition]
    let pagination: PaginationInfo
}
