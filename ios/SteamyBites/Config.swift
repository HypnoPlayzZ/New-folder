import Foundation

/// Central configuration. Point the app at the live (shared) backend by default
/// so menu, account and orders sync with the website; switch to localhost for
/// development against a local server.
enum Config {
    /// The same backend the website uses → real two-way sync.
    static let apiBaseURL = URL(string: "https://steamybitesbackend.onrender.com/api")!

    /// For local development: run the Node server and use this instead.
    /// (The simulator can reach your Mac via localhost.)
    static let localBaseURL = URL(string: "http://localhost:5000/api")!

    /// Flip to true to develop against a locally-running backend.
    static let useLocal = false

    static var baseURL: URL { useLocal ? localBaseURL : apiBaseURL }

    /// Optional: Google OAuth iOS client ID (from your Google Cloud project).
    /// Leave empty to use phone-OTP login only.
    static let googleClientID = ""

    static let brand = "Steamy Bites"
    static let supportCity = "Gurgaon"
}
