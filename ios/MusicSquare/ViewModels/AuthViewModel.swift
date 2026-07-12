import SwiftUI

class AuthViewModel: ObservableObject {
    @Published var currentUser: UserProfile?
    @Published var isLoggedIn = false
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let api = APIClient.shared

    init() {
        if api.token != nil {
            Task { await fetchMe() }
        }
    }

    @MainActor
    func login(email: String, password: String) async {
        isLoading = true
        errorMessage = nil
        do {
            let resp: AuthResponse = try await api.post(APIConfig.auth + "/login", body: ["email": email, "password": password])
            api.token = resp.token
            currentUser = resp.user
            isLoggedIn = true
        } catch {
            errorMessage = "登录失败，请检查邮箱和密码"
        }
        isLoading = false
    }

    @MainActor
    func register(username: String, email: String, password: String) async {
        isLoading = true
        errorMessage = nil
        do {
            let resp: AuthResponse = try await api.post(APIConfig.auth + "/register", body: ["username": username, "email": email, "password": password])
            api.token = resp.token
            currentUser = resp.user
            isLoggedIn = true
        } catch {
            errorMessage = "注册失败，请检查信息"
        }
        isLoading = false
    }

    @MainActor
    func fetchMe() async {
        do {
            let user: UserProfile = try await api.get(APIConfig.auth + "/me")
            currentUser = user
            isLoggedIn = true
        } catch {
            logout()
        }
    }

    func logout() {
        api.token = nil
        currentUser = nil
        isLoggedIn = false
    }

    @MainActor
    func updateProfile(bio: String, username: String) async {
        do {
            let user: UserProfile = try await api.put(APIConfig.auth + "/profile", body: ["bio": bio, "username": username])
            currentUser = user
        } catch {
            errorMessage = "更新失败"
        }
    }
}
