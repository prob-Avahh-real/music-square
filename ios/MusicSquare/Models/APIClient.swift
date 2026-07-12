import Foundation

struct APIConfig {
    // Change this to your server's address
    static let baseURL = "http://localhost:3000/api"

    static let compositions = "\(baseURL)/compositions"
    static let auth = "\(baseURL)/auth"
    static let feed = "\(baseURL)/feed"

    static func compositionComments(_ compId: String) -> String {
        "\(compositions)/\(compId)/comments"
    }

    static func compositionLike(_ compId: String) -> String {
        "\(compositions)/\(compId)/like"
    }

    static func followUser(_ userId: String) -> String {
        "\(feed)/follow/\(userId)"
    }
}

// MARK: - Data Models

struct UserProfile: Codable, Identifiable {
    let id: String
    var username: String
    var email: String?
    var avatar_url: String?
    var bio: String?
    var composition_count: Int?
    var follower_count: Int?
    var following_count: Int?
}

struct AuthResponse: Codable {
    let user: UserProfile
    let token: String
}

struct NoteData: Codable, Identifiable {
    var id = UUID()
    let pitch: Int
    let start: Double
    let duration: Double
}

struct TrackData: Codable, Identifiable {
    var id = UUID()
    let instrument: String
    var notes: [NoteData]
}

struct Composition: Codable, Identifiable {
    let id: String
    let user_id: String
    var title: String
    var description: String?
    var bpm: Int
    var key_signature: String?
    var scale: String?
    var tracks: [TrackData]
    var duration_secs: Double?
    var audio_url: String?
    var cover_color: String?
    var play_count: Int?
    var like_count: Int?
    var comment_count: Int?
    var is_public: Int?
    var created_at: String?
    var username: String?
    var avatar_url: String?
    var is_liked: Bool?

    var displayPlays: String {
        let count = play_count ?? 0
        if count >= 10000 { return "\(count / 10000).\((count % 10000) / 1000)万" }
        if count >= 1000 { return "\(count / 1000).\((count % 1000) / 100)k" }
        return "\(count)"
    }
}

struct Comment: Codable, Identifiable {
    let id: String
    let composition_id: String
    let user_id: String
    var parent_id: String?
    var content: String
    var timestamp_secs: Double?
    var created_at: String?
    var username: String?
    var avatar_url: String?
    var replies: [Comment]?
}

struct PaginatedResponse<T: Codable>: Codable {
    let compositions: T?
    let pagination: PaginationInfo?
}

struct PaginationInfo: Codable {
    let page: Int
    let limit: Int
    let total: Int
    let totalPages: Int
}

// MARK: - API Client

class APIClient {
    static let shared = APIClient()
    private let session = URLSession.shared
    private let decoder: JSONDecoder = {
        let d = JSONDecoder()
        return d
    }()

    var token: String? {
        get { UserDefaults.standard.string(forKey: "auth_token") }
        set { UserDefaults.standard.set(newValue, forKey: "auth_token") }
    }

    private func request(_ url: String, method: String = "GET", body: Data? = nil) -> URLRequest {
        var req = URLRequest(url: URL(string: url)!)
        req.httpMethod = method
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let t = token {
            req.setValue("Bearer \(t)", forHTTPHeaderField: "Authorization")
        }
        req.httpBody = body
        return req
    }

    func get<T: Codable>(_ url: String) async throws -> T {
        let (data, _) = try await session.data(for: request(url))
        return try decoder.decode(T.self, from: data)
    }

    func post<T: Codable, B: Codable>(_ url: String, body: B) async throws -> T {
        let bodyData = try JSONEncoder().encode(body)
        let (data, _) = try await session.data(for: request(url, method: "POST", body: bodyData))
        return try decoder.decode(T.self, from: data)
    }

    func put<T: Codable, B: Codable>(_ url: String, body: B) async throws -> T {
        let bodyData = try JSONEncoder().encode(body)
        let (data, _) = try await session.data(for: request(url, method: "PUT", body: bodyData))
        return try decoder.decode(T.self, from: data)
    }

    func delete(_ url: String) async throws {
        let (_, _) = try await session.data(for: request(url, method: "DELETE"))
    }
}
