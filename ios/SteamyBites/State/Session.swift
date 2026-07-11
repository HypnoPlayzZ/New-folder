import Foundation
import SwiftUI

/// Holds auth state for the whole app. Persists the JWT in the Keychain and the
/// display name in UserDefaults so the session survives relaunches.
@MainActor
final class Session: ObservableObject {
    @Published private(set) var token: String?
    @Published private(set) var userName: String?
    @Published var phase: Phase = .idle
    @Published var errorMessage: String?

    enum Phase: Equatable { case idle, sendingOTP, otpSent, verifying, signedIn }

    private let tokenKey = "steamy_jwt"
    private let nameKey = "steamy_name"

    var isSignedIn: Bool { token != nil }

    init() {
        token = Keychain.get(tokenKey)
        userName = UserDefaults.standard.string(forKey: nameKey)
        if token != nil { phase = .signedIn }
        // Let the API client read the live token.
        APIClient.shared.tokenProvider = { [weak self] in self?.token }
    }

    // MARK: - Phone OTP flow

    func sendOTP(mobile: String) async {
        errorMessage = nil
        phase = .sendingOTP
        do {
            try await APIClient.shared.sendOTP(mobile: mobile)
            phase = .otpSent
        } catch {
            errorMessage = error.localizedDescription
            phase = .idle
        }
    }

    func verifyOTP(mobile: String, code: String) async {
        errorMessage = nil
        phase = .verifying
        do {
            let res = try await APIClient.shared.phoneLogin(mobile: mobile, code: code)
            apply(res)
        } catch {
            errorMessage = error.localizedDescription
            phase = .otpSent
        }
    }

    func signInWithGoogle(idToken: String) async {
        errorMessage = nil
        do {
            let res = try await APIClient.shared.googleLogin(idToken: idToken)
            apply(res)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func apply(_ res: AuthResponse) {
        token = res.token
        userName = res.userName
        Keychain.set(res.token, for: tokenKey)
        UserDefaults.standard.set(res.userName, forKey: nameKey)
        phase = .signedIn
    }

    func signOut() {
        token = nil
        userName = nil
        Keychain.delete(tokenKey)
        UserDefaults.standard.removeObject(forKey: nameKey)
        phase = .idle
    }

    /// Clear local auth when the server reports the token is no longer valid.
    func handleUnauthorized() {
        if isSignedIn { signOut() }
    }
}
