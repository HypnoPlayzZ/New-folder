import Foundation

enum APIError: LocalizedError {
    case http(Int, String)
    case decoding(String)
    case transport(String)

    var errorDescription: String? {
        switch self {
        case .http(_, let msg): return msg
        case .decoding(let msg): return "Couldn’t read server response. \(msg)"
        case .transport(let msg): return msg
        }
    }
}

/// Thin async/await wrapper around the shared backend. A token provider closure
/// lets it attach the JWT without depending on the session type.
final class APIClient {
    static let shared = APIClient()

    private let base = Config.baseURL
    private let session: URLSession
    /// Set by Session once a user signs in.
    var tokenProvider: () -> String? = { nil }

    init() {
        let cfg = URLSessionConfiguration.default
        cfg.timeoutIntervalForRequest = 20
        cfg.waitsForConnectivity = true
        session = URLSession(configuration: cfg)
    }

    // MARK: - Public endpoints

    func fetchMenu() async throws -> [MenuCategory] {
        try await get("/menu")
    }

    func sendOTP(mobile: String) async throws {
        let _: MessageResponse = try await post("/send-otp", body: ["mobile": mobile])
    }

    func phoneLogin(mobile: String, code: String) async throws -> AuthResponse {
        try await post("/auth/phone", body: ["mobile": mobile, "code": code])
    }

    func googleLogin(idToken: String) async throws -> AuthResponse {
        try await post("/auth/google", body: ["token": idToken])
    }

    // MARK: - Authenticated endpoints

    func createOrder(_ req: CreateOrderRequest) async throws -> Order {
        try await post("/orders", encodable: req, auth: true)
    }

    func myOrders() async throws -> [Order] {
        try await get("/my-orders", auth: true)
    }

    func order(id: String) async throws -> Order {
        try await get("/orders/\(id)", auth: true)
    }

    @discardableResult
    func cancelOrder(id: String) async throws -> Order {
        try await patch("/orders/\(id)/cancel", auth: true)
    }

    // MARK: - Core

    private func get<T: Decodable>(_ path: String, auth: Bool = false) async throws -> T {
        try await send(makeRequest(path, method: "GET", auth: auth))
    }

    private func patch<T: Decodable>(_ path: String, auth: Bool = false) async throws -> T {
        try await send(makeRequest(path, method: "PATCH", auth: auth))
    }

    private func post<T: Decodable>(_ path: String, body: [String: Any], auth: Bool = false) async throws -> T {
        var req = makeRequest(path, method: "POST", auth: auth)
        req.httpBody = try JSONSerialization.data(withJSONObject: body)
        return try await send(req)
    }

    private func post<T: Decodable, B: Encodable>(_ path: String, encodable: B, auth: Bool = false) async throws -> T {
        var req = makeRequest(path, method: "POST", auth: auth)
        req.httpBody = try JSONEncoder().encode(encodable)
        return try await send(req)
    }

    private func makeRequest(_ path: String, method: String, auth: Bool) -> URLRequest {
        var req = URLRequest(url: base.appendingPathComponent(String(path.dropFirst())))
        req.httpMethod = method
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if auth, let token = tokenProvider() {
            req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        return req
    }

    private func send<T: Decodable>(_ req: URLRequest) async throws -> T {
        let data: Data, response: URLResponse
        do {
            (data, response) = try await session.data(for: req)
        } catch {
            throw APIError.transport(error.localizedDescription)
        }
        guard let http = response as? HTTPURLResponse else {
            throw APIError.transport("No response from server.")
        }
        guard (200..<300).contains(http.statusCode) else {
            let msg = (try? JSONDecoder().decode(MessageResponse.self, from: data))?.message
            throw APIError.http(http.statusCode, msg ?? "Request failed (\(http.statusCode)).")
        }
        if T.self == EmptyResponse.self { return EmptyResponse() as! T }
        do {
            return try JSONDecoder().decode(T.self, from: data)
        } catch {
            throw APIError.decoding(error.localizedDescription)
        }
    }
}

struct EmptyResponse: Decodable {}
