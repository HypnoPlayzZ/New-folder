import Foundation

/// Subscribes to GET /api/orders/:id/status-stream (Server-Sent Events) and
/// yields each `status` the kitchen pushes — the same realtime feed the website
/// uses. EventSource can't set headers, so the token rides as a query param
/// (exactly as the server expects for this route).
struct OrderStatusStream {
    let orderId: String
    let token: String

    func statuses() -> AsyncThrowingStream<String, Error> {
        AsyncThrowingStream { continuation in
            let task = Task {
                var comps = URLComponents(url: Config.baseURL.appendingPathComponent("orders/\(orderId)/status-stream"),
                                          resolvingAgainstBaseURL: false)!
                comps.queryItems = [.init(name: "token", value: token)]
                var req = URLRequest(url: comps.url!)
                req.setValue("text/event-stream", forHTTPHeaderField: "Accept")
                req.timeoutInterval = .infinity

                do {
                    let (bytes, response) = try await URLSession.shared.bytes(for: req)
                    if let http = response as? HTTPURLResponse, !(200..<300).contains(http.statusCode) {
                        throw APIError.http(http.statusCode, "Live tracking unavailable (\(http.statusCode)).")
                    }
                    for try await line in bytes.lines {
                        guard line.hasPrefix("data:") else { continue }
                        let payload = line.dropFirst(5).trimmingCharacters(in: .whitespaces)
                        guard let data = payload.data(using: .utf8),
                              let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                              let status = obj["status"] as? String else { continue }
                        continuation.yield(status)
                    }
                    continuation.finish()
                } catch {
                    continuation.finish(throwing: error)
                }
            }
            continuation.onTermination = { _ in task.cancel() }
        }
    }
}
