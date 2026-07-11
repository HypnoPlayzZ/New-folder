import Foundation

/// Shared response shape for /api/auth/google, /api/auth/phone, /api/auth/admin/login
struct AuthResponse: Codable {
    let token: String
    let userName: String
    let userRole: String
}

struct MessageResponse: Codable {
    let message: String?
}
