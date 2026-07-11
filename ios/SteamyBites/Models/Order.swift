import Foundation

/// Sent to POST /api/orders. menuItemId is a string id here (decode side differs
/// because /api/my-orders populates it into a full object).
struct OrderItemRequest: Codable {
    let menuItemId: String
    let itemName: String
    let quantity: Int
    let variant: String
    let priceAtOrder: Double
    let instructions: String
}

struct CreateOrderRequest: Codable {
    let items: [OrderItemRequest]
    let customerName: String
    let mobile: String
    let address: String
    let paymentMethod: String       // "COD"
    let locationCoords: String?
    let locationLink: String?
}

/// Decoded from order responses. We deliberately omit `menuItemId` because the
/// server sometimes returns it as a string and sometimes as a populated object;
/// `itemName`/`priceAtOrder` carry everything the UI needs.
struct OrderItem: Codable, Hashable {
    let itemName: String?
    let quantity: Int
    let variant: String
    let priceAtOrder: Double
    let instructions: String?
}

struct Order: Codable, Identifiable, Hashable {
    let id: String
    let items: [OrderItem]
    let totalPrice: Double
    let finalPrice: Double
    let customerName: String
    let mobile: String
    let address: String
    let status: String
    let paymentMethod: String
    let paymentStatus: String
    let createdAt: String?

    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case items, totalPrice, finalPrice, customerName, mobile, address
        case status, paymentMethod, paymentStatus, createdAt
    }
}

extension Order {
    /// Canonical kitchen-to-door pipeline used for the tracker UI.
    static let pipeline = ["Received", "Preparing", "Ready", "Out for Delivery", "Delivered"]

    var stageIndex: Int { Order.pipeline.firstIndex(of: status) ?? 0 }
    var isTerminal: Bool { status == "Delivered" || status == "Rejected" }

    var shortId: String { String(id.suffix(6)).uppercased() }

    var createdDate: Date? {
        guard let createdAt else { return nil }
        let iso = ISO8601DateFormatter()
        iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return iso.date(from: createdAt) ?? ISO8601DateFormatter().date(from: createdAt)
    }
}
