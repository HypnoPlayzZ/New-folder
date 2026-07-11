import Foundation

/// GET /api/menu → [{ name, items: [MenuItem] }]
struct MenuCategory: Codable, Identifiable, Hashable {
    let name: String
    let items: [MenuItem]
    var id: String { name }
}

struct Price: Codable, Hashable {
    let half: Double?
    let full: Double
}

struct MenuItem: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let description: String
    let price: Price
    let imageUrl: String
    let category: String

    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case name, description, price, imageUrl, category
    }

    // imageUrl is optional on the server; default to empty.
    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decode(String.self, forKey: .id)
        name = try c.decode(String.self, forKey: .name)
        description = (try? c.decode(String.self, forKey: .description)) ?? ""
        price = try c.decode(Price.self, forKey: .price)
        imageUrl = (try? c.decode(String.self, forKey: .imageUrl)) ?? ""
        category = (try? c.decode(String.self, forKey: .category)) ?? "Uncategorized"
    }
}

/// half | full
enum Variant: String, Codable, CaseIterable, Hashable {
    case half, full
    var label: String { self == .half ? "Half" : "Full" }
}

extension MenuItem {
    func price(for variant: Variant) -> Double? {
        variant == .half ? price.half : price.full
    }
    var hasHalf: Bool { price.half != nil }
    var imageURL: URL? { imageUrl.isEmpty ? nil : URL(string: imageUrl) }
}
