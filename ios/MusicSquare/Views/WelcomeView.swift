import SwiftUI

struct WelcomeView: View {
    @EnvironmentObject var authVM: AuthViewModel
    @State private var isLogin = true
    @State private var email = ""
    @State private var password = ""
    @State private var username = ""

    let gradientColors: [Color] = [.purple, .blue, .pink]

    var body: some View {
        ZStack {
            LinearGradient(colors: gradientColors, startPoint: .topLeading, endPoint: .bottomTrailing)
                .ignoresSafeArea()

            VStack(spacing: 32) {
                Spacer()

                // Logo
                VStack(spacing: 12) {
                    Image(systemName: "music.quarternote.3")
                        .font(.system(size: 64))
                        .foregroundColor(.white)
                    Text("音悦广场")
                        .font(.system(size: 36, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                    Text("自由作曲 · 四处评论 · 音乐相遇")
                        .font(.subheadline)
                        .foregroundColor(.white.opacity(0.8))
                }

                Spacer()

                // Auth form card
                VStack(spacing: 20) {
                    // Toggle
                    HStack(spacing: 0) {
                        Button("登录") {
                            withAnimation(.easeInOut(duration: 0.2)) { isLogin = true }
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(isLogin ? Color.white.opacity(0.2) : Color.clear)
                        .foregroundColor(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 10))

                        Button("注册") {
                            withAnimation(.easeInOut(duration: 0.2)) { isLogin = false }
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(!isLogin ? Color.white.opacity(0.2) : Color.clear)
                        .foregroundColor(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                    }
                    .padding(4)
                    .background(Color.white.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: 12))

                    // Fields
                    VStack(spacing: 14) {
                        if !isLogin {
                            TextField("用户名", text: $username)
                                .textContentType(.username)
                                .padding()
                                .background(Color.white.opacity(0.15))
                                .cornerRadius(12)
                                .foregroundColor(.white)
                                .tint(.white)
                        }

                        TextField("邮箱", text: $email)
                            .textContentType(.emailAddress)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)
                            .padding()
                            .background(Color.white.opacity(0.15))
                            .cornerRadius(12)
                            .foregroundColor(.white)
                            .tint(.white)

                        SecureField("密码", text: $password)
                            .textContentType(isLogin ? .password : .newPassword)
                            .padding()
                            .background(Color.white.opacity(0.15))
                            .cornerRadius(12)
                            .foregroundColor(.white)
                            .tint(.white)
                    }

                    // Error
                    if let err = authVM.errorMessage {
                        Text(err)
                            .font(.caption)
                            .foregroundColor(.orange)
                    }

                    // Submit
                    Button {
                        Task {
                            if isLogin {
                                await authVM.login(email: email, password: password)
                            } else {
                                await authVM.register(username: username, email: email, password: password)
                            }
                        }
                    } label: {
                        HStack {
                            if authVM.isLoading {
                                ProgressView().tint(.purple)
                            }
                            Text(isLogin ? "登录" : "创建账号")
                                .fontWeight(.semibold)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(Color.white)
                        .foregroundColor(.purple)
                        .cornerRadius(14)
                    }
                    .disabled(authVM.isLoading)
                }
                .padding(24)
                .background(.ultraThinMaterial)
                .cornerRadius(24)
                .padding(.horizontal, 20)

                Spacer()
            }
        }
    }
}

#Preview {
    WelcomeView()
        .environmentObject(AuthViewModel())
}
